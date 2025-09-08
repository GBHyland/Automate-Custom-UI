/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { UploadContentModel } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { CdkConnectedOverlay, CdkOverlayOrigin, ConnectedPosition } from '@angular/cdk/overlay';
import { DocumentModel } from '@alfresco/adf-hx-content-services/services';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { DocumentLocationPickerComponent } from '../../../document-location-picker/document-location-picker.component';
import { DocumentCategoryPickerComponent } from '../../../document-category-picker/document-category-picker.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'hxp-workspace-upload-properties-editor',
    templateUrl: './upload-properties-editor.component.html',
    styleUrls: ['./upload-properties-editor.component.scss'],
    host: { class: 'hxp-workspace-upload-properties-editor' },
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgIf,
        TranslatePipe,
        MatExpansionModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        CdkOverlayOrigin,
        CdkConnectedOverlay,
        DocumentLocationPickerComponent,
        DocumentCategoryPickerComponent,
    ],
})
export class ContentUploadPropertiesEditorComponent implements OnChanges {
    @Input()
    data: UploadContentModel[];

    @Input()
    currentDocument: Document;

    @Output()
    documentsUpdated = new EventEmitter<UploadContentModel[]>();

    readonly createDocumentForm;

    protected editDocument: Document;
    protected mixedCategoriesDetected = false;
    protected mixedLocationsDetected = false;
    protected showOverlay = false;
    protected toastMessage: string;
    protected positions: ConnectedPosition[] = [
        {
            originX: 'start',
            originY: 'bottom',
            overlayX: 'start',
            overlayY: 'bottom',
        },
    ];
    protected selectedLocation: Document;
    protected documentsByPath: Record<string, Document> = {};

    constructor(private readonly _fb: FormBuilder) {
        this.createDocumentForm = this._fb.group({});
    }

    filterFilishDocumentCategories = (documentCategory: string, documentModel: DocumentModel) =>
        documentModel.hasMixin(documentCategory, 'SysFilish');

    ngOnChanges(): void {
        if (this.currentDocument) {
            this.documentsByPath[this.currentDocument.sys_path] = this.currentDocument;
        }
        this.refresh();
    }

    public refresh(): void {
        if (!this.data || this.data.length === 0) {
            this.editDocument = undefined;
            return;
        }

        const { sys_primaryType, sys_parentId, sys_parentPath } = this.data[0].documentModel.document;
        this.editDocument = {
            sys_primaryType,
            sys_path: sys_parentPath,
            sys_parentPath: sys_parentPath,
            sys_parentId,
            sys_id: sys_parentId,
        };

        this.selectedLocation = this.documentsByPath[this.editDocument.sys_parentPath] || this.currentDocument;

        const samePrimaryType = this.hasSamePropertyValue('sys_primaryType', this.editDocument, this.data);
        const sameLocation = this.hasSamePropertyValue('sys_parentPath', this.editDocument, this.data);

        if (samePrimaryType && sameLocation) {
            this.mixedCategoriesDetected = false;
            this.mixedLocationsDetected = false;
            return;
        }

        if (sameLocation) {
            this.selectedLocation = this.documentsByPath[this.editDocument.sys_parentPath];
        } else {
            this.mixedLocationsDetected = true;
            this.editDocument.sys_parentPath = '';
            this.editDocument.sys_path = '';
            this.editDocument.sys_parentId = '';
            this.editDocument.sys_id = '';

            this.selectedLocation = undefined;
        }

        if (!samePrimaryType) {
            this.mixedCategoriesDetected = true;
            this.editDocument.sys_primaryType = '';
        }
    }

    protected enabledMixedCategoriesEditing() {
        this.mixedCategoriesDetected = false;
        this.markEditorAsInvalid();
    }

    protected enabledMixedLocationsEditing() {
        this.mixedLocationsDetected = false;
        this.selectedLocation = undefined;
        this.markEditorAsInvalid();
    }

    protected onDocumentCategorySelected(documentCategory: string) {
        if (documentCategory) {
            this.editDocument.sys_primaryType = documentCategory;
            this.resetEditorValidation();
        } else {
            this.editDocument.sys_primaryType = undefined;
            this.markEditorAsInvalid();
        }

        this.markEditorAsDirty();
    }

    protected onDocumentLocationSelected(document: Document) {
        this.selectedLocation = document;
        this.documentsByPath[document.sys_path] = document;

        this.editDocument.sys_id = document.sys_id;
        this.editDocument.sys_parentId = document.sys_id;
        this.editDocument.sys_path = document.sys_path;
        this.editDocument.sys_parentPath = document.sys_path;

        this.resetEditorValidation();
        this.markEditorAsDirty();
    }

    /*
     * Save the new properties values on the selected documents.
     */
    protected saveProperties() {
        if (!this.editDocument) {
            return;
        }

        const { sys_id, ...editDocumentWithoutSysId } = this.editDocument;
        this.data = this.data.map((selection) => {
            selection.documentModel.document = {
                ...selection.documentModel.document,
                ...editDocumentWithoutSysId,
            };
            return selection;
        });

        this.documentsUpdated.emit(this.data);

        this.createDocumentForm.markAsPristine();
        this.createDocumentForm.markAsUntouched();

        this.showToast('FILE_UPLOAD.EDIT.PROPERTIES.ASSIGNED');
    }

    protected showToast(message: string) {
        this.toastMessage = message;
        this.showOverlay = true;
        setTimeout(() => (this.showOverlay = false), 3000);
    }

    protected dismissToast() {
        this.showOverlay = false;
    }

    private resetEditorValidation(): void {
        this.createDocumentForm.setErrors();
    }

    private markEditorAsDirty(): void {
        this.createDocumentForm.markAsDirty();
    }

    private markEditorAsInvalid(): void {
        this.createDocumentForm.setErrors({ invalid: true });
    }

    private hasSamePropertyValue(property: string, editDocument: Document, uploadList: UploadContentModel[]) {
        return uploadList.map((entry) => entry.documentModel.document).every((document) => document[property] === editDocument[property]);
    }
}
