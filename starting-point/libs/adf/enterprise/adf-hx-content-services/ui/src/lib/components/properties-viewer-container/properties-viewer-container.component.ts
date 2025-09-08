/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewComponent, CardViewItem, CardViewUpdateService, UpdateNotification } from '@alfresco/adf-core';
import { Attribute, Component, DestroyRef, EventEmitter, inject, Inject, Input, OnChanges, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { editPropertiesNotificationMessages } from './configs/edit-properties-notification-messages.config';
import { editPropertiesSnackBarTypes } from './configs/edit-properties-snack-bar-types.model';
import { EditPropertiesStatus } from './configs/edit-properties-status.enum';
import { FieldType } from '@alfresco/adf-hx-content-services/api';
import {
    DOCUMENT_SERVICE,
    SharedDocumentService,
    HxpNotificationService,
    SharedDocumentPropertiesService,
    DOCUMENT_PROPERTIES_SERVICE,
    isVersion,
    getRetentionStatus,
    RecordStatusType,
    BLOCK_EDIT_STATUSES,
} from '@alfresco/adf-hx-content-services/services';
import { MatExpansionModule } from '@angular/material/expansion';
import { NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Component presents document properties viewer container.
 *
 * To use the `PropertiesViewerContainerComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { PropertiesViewerContainerComponent } from '@alfresco/adf-hx-content-services/ui';
 *
 * @NgModule({
 *     imports: [
 *         PropertiesViewerContainerComponent
 *         ...
 *     ],
 *    [...]
 * })
 *
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-properties-viewer-container
 *    [document]="document"
 *    [properties]="defaultProperties"
 *    [editable]="editable"
 *    [expanded]="expanded"
 *    [copyToClipboardAction]="copyToClipboardAction"
 *    [displayDefaultProperties]="displayDefaultProperties"
 *    [displayEmpty]="displayEmpty"
 *    [multi]="multi"
 *    [useChipsForMultiValueProperty]="useChipsForMultiValueProperty"
 *    [displayLabelForChips]="true">
 * </hxp-properties-viewer-container>
 */
@Component({
    selector: 'hxp-properties-viewer-container',
    templateUrl: './properties-viewer-container.component.html',
    styleUrls: ['./properties-viewer-container.component.scss'],
    standalone: true,
    imports: [MatExpansionModule, NgIf, CardViewComponent, MatButtonModule, TranslatePipe],
})
export class PropertiesViewerContainerComponent implements OnChanges {
    private destroyRef = inject(DestroyRef);
    /**
     * The document to display the properties for.
     * @type {Document}
     * @required
     */
    @Input()
    document: Document | undefined;

    /**
     * The properties to display in the card view.
     * @type {CardViewItem[]}
     * @default []
     *
     * ```ts
     * export interface CardViewItem {
     *      label: string;
     *      value: any;
     *      key: string;
     *      default?: any;
     *      type: string;
     *      displayValue: any;
     *      editable?: boolean;
     *      icon?: string;
     * }
     * ```
     *
     */
    @Input()
    properties: CardViewItem[] = [];

    /**
     * Toggles whether or not to enable copy to clipboard action.
     * @type {boolean}
     * @default true
     */
    @Input()
    copyToClipboardAction = true;

    /**
     * Toggles whether the metadata properties should be shown.
     * @type {boolean}
     * @default true
     */
    @Input()
    displayDefaultProperties = true;

    /**
     * Toggles whether to display empty values in the card view.
     * @type {boolean}
     * @default false
     */
    @Input()
    displayEmpty = false;

    /**
     * Toggles whether the edit button should be shown
     * @type {boolean}
     * @default false
     */
    @Input()
    editable = false;

    /**
     * Expand or collapse the panel.
     * @type {boolean}
     * @default false
     */
    @Input()
    expanded = false;

    /**
     * The multi parameter of the underlying material expansion panel, set to true to allow multi accordion to be expanded at the same time.
     * @type {boolean}
     * @default false
     */
    @Input()
    multi = false;

    /**
     * Toggles whether or not to enable chips for multivalued properties.
     * @type {boolean}
     * @default true
     */
    @Input()
    useChipsForMultiValueProperty = true;

    /**
     * Toggles whether or not to display label for multivalued properties.
     * @type {boolean}
     * @default false
     */
    @Input()
    displayLabelForChips = false;

    @Output()
    propertyUpdateRequest: EventEmitter<boolean> = new EventEmitter<boolean>();

    protected editMode = false;
    protected workingCopy = true;
    protected isEditableRecord = false;

    private cardValueValidationMap: Record<string, boolean> = {};
    private documentPropertiesToUpdate: Partial<Document> = {};
    private requiredProperties: string[];

    constructor(
        @Inject(DOCUMENT_SERVICE)
        private documentService: SharedDocumentService,
        private cardViewUpdateService: CardViewUpdateService,
        private hxpNotificationService: HxpNotificationService,
        @Inject(DOCUMENT_PROPERTIES_SERVICE)
        private documentPropertiesService: SharedDocumentPropertiesService,
        /**
         * An attribute representing a text to display in the header. Can be a key to translate.
         * @type {boolean}
         * @default false
         */
        @Attribute('headerText')
        public headerText = 'CORE.METADATA.BASIC.HEADER'
    ) {
        this.requiredProperties = this.documentPropertiesService.getRequiredProperties();
        this.cardViewUpdateService.itemUpdated$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.respondToCardUpdate.bind(this));
    }

    ngOnChanges() {
        if (this.document) {
            this.workingCopy = !isVersion(this.document);
            this.isEditableRecord = !BLOCK_EDIT_STATUSES.includes(getRetentionStatus(this.document) as RecordStatusType);
        }
    }

    protected onSaveProperties() {
        if (!this.document?.sys_id) {
            return;
        }
        this.documentService
            .updateDocument(this.document.sys_id, this.documentPropertiesToUpdate)
            .pipe(take(1))
            .subscribe({
                next: (document) => {
                    this.document = document;
                    this.editMode = false;
                    this.documentPropertiesToUpdate = {};
                    this.hxpNotificationService.openSnackBar(
                        editPropertiesNotificationMessages[EditPropertiesStatus.SUCCESS],
                        editPropertiesSnackBarTypes[EditPropertiesStatus.SUCCESS]
                    );
                },
                error: () => {
                    this.hxpNotificationService.openSnackBar(
                        editPropertiesNotificationMessages[EditPropertiesStatus.ERROR],
                        editPropertiesSnackBarTypes[EditPropertiesStatus.ERROR]
                    );
                },
            });
    }

    protected toggleEditMode() {
        this.editMode = !this.editMode;
        this.documentPropertiesToUpdate = {};
        if (!this.editMode) {
            this.propertyUpdateRequest.emit(true);
        }
    }

    protected hasBeenModified(): boolean {
        return Object.keys(this.documentPropertiesToUpdate).length > 0;
    }

    protected allCardValuesAreValid(): boolean {
        return Object.keys(this.documentPropertiesToUpdate).every((changedKey) => this.cardValueValidationMap[changedKey]);
    }

    private respondToCardUpdate(updateNotification: UpdateNotification): void {
        const changedKey = Object.keys(updateNotification.changed)[0];
        const changedValue = updateNotification.changed[changedKey];

        const fieldType: FieldType | undefined = this.documentPropertiesService.propertyType(changedKey);

        this.cardValueValidationMap[changedKey] = this.validateCardValue(changedKey, changedValue, fieldType);

        if (!this.cardValueValidationMap[changedKey]) {
            return;
        }

        const updatedValue = this.isComplexProperty(changedValue, fieldType)
            ? this.getUpdatedComplexProperty(changedKey, changedValue)
            : updateNotification.changed;

        this.documentPropertiesToUpdate = {
            ...this.documentPropertiesToUpdate,
            ...updatedValue,
        };
    }

    private getUpdatedComplexProperty(changedKey: string, changedValue: any): Partial<Document> {
        const existingDataInDocument = this.document?.[changedKey] || {};
        const existingUpdateData = this.documentPropertiesToUpdate[changedKey] || {};

        return {
            [changedKey]: {
                ...existingDataInDocument,
                ...existingUpdateData,
                ...changedValue,
            },
        };
    }

    private validateCardValue(changedKey: string, changedValue: any, fieldType?: FieldType) {
        let invalidCardValue = false;
        if (fieldType === FieldType.Blob || fieldType === FieldType.Complex) {
            const nestedPropertyName: string = Object.keys(changedValue)[0];
            if (this.isEmptyProperty(changedValue[`${nestedPropertyName}`])) {
                invalidCardValue = this.handleEmptyProperty(`${changedKey}.${nestedPropertyName || ''}`);
            }
        } else if (this.isEmptyProperty(changedValue)) {
            invalidCardValue = this.handleEmptyProperty(changedKey);
        }

        return !invalidCardValue;
    }

    private isComplexProperty(changedValue: any, fieldType: FieldType | undefined) {
        return fieldType === FieldType.Complex || (fieldType !== FieldType.Date && typeof changedValue === 'object' && !Array.isArray(changedValue));
    }

    private isEmptyProperty(changedValue: any): boolean {
        return !changedValue;
    }

    private handleEmptyProperty(propertyName: string): boolean {
        if (this.requiredProperties.includes(propertyName)) {
            this.hxpNotificationService.openSnackBar(
                editPropertiesNotificationMessages[EditPropertiesStatus.INFO],
                editPropertiesSnackBarTypes[EditPropertiesStatus.INFO]
            );
            return true;
        }
        return false;
    }
}
