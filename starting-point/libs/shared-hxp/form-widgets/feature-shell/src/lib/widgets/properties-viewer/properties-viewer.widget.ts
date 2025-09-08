/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { WidgetComponent, FormService, CardViewItem, FormFieldModel, ErrorWidgetComponent } from '@alfresco/adf-core';
import { Component, DestroyRef, inject, Inject, ViewEncapsulation } from '@angular/core';
import { Observable, combineLatest } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { FormWidgetService } from '../../services/form-widget/form-widget.service';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DOCUMENT_PROPERTIES_SERVICE, SharedDocumentPropertiesService } from '@alfresco/adf-hx-content-services/services';
import { TranslatePipe } from '@ngx-translate/core';
import { PropertiesViewerContainerComponent } from '@alfresco/adf-hx-content-services/ui';
import { NgIf, AsyncPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface PropertiesViewerContainerData {
    defaultProperties: CardViewItem[];
    otherProperties: CardViewItem[];
    document: Document;
}

@Component({
    selector: 'hxp-properties-viewer-widget',
    templateUrl: './properties-viewer.widget.html',
    styleUrls: ['./properties-viewer.widget.scss'],
    host: {
        '(click)': 'event($event)',
        '(blur)': 'event($event)',
        '(change)': 'event($event)',
        '(focus)': 'event($event)',
        '(focusin)': 'event($event)',
        '(focusout)': 'event($event)',
        '(input)': 'event($event)',
        '(invalid)': 'event($event)',
        '(select)': 'event($event)',
    },
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, PropertiesViewerContainerComponent, ErrorWidgetComponent, AsyncPipe, TranslatePipe],
})
export class PropertiesViewerWidgetComponent extends WidgetComponent {
    private readonly destroyRef = inject(DestroyRef);

    data$: Observable<PropertiesViewerContainerData | null> = combineLatest([
        this.getDocumentFromField(),
        this.getDefaultProperties(),
        this.getOtherProperties(),
    ]).pipe(
        map(([document, defaultProperties, otherProperties]) => {
            return document ? { document, defaultProperties, otherProperties } : null;
        })
    );

    constructor(
        formService: FormService,
        @Inject(DOCUMENT_PROPERTIES_SERVICE) private documentPropertiesService: SharedDocumentPropertiesService,
        private formWidgetService: FormWidgetService
    ) {
        super(formService);
        this.formService?.formDataRefreshed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((formEvent) => {
            const linkedWidgetField = formEvent.form.fieldsCache?.find(
                (cachedField: { id: string }) => cachedField.id === this.field.params['hxpUploadWidget']
            );
            if (linkedWidgetField) {
                this.field.value = linkedWidgetField.value;
                this.refresh();
            }
        });
    }

    get options() {
        return this.field?.params['propertiesViewerOptions'];
    }

    refresh() {
        this.fieldChanged.emit(this.field);
    }

    private getDocumentFromField(): Observable<Document | null> {
        return this.fieldChanged.pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((field: FormFieldModel) => this.formWidgetService.getDocumentFromField(field))
        );
    }

    private getDefaultProperties(): Observable<CardViewItem[]> {
        return this.getDocumentFromField().pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((document: Document | null) => this.documentPropertiesService.getDefaultPropertiesFromDocument(document))
        );
    }

    private getOtherProperties(): Observable<CardViewItem[]> {
        return this.getDocumentFromField().pipe(
            takeUntilDestroyed(this.destroyRef),
            switchMap((document: Document | null) => {
                const documentPropertiesFilteringOptions = {
                    exclude: {
                        schemas: ['sysfile_blob', 'sys_'],
                    },
                };
                return this.documentPropertiesService.getPropertiesFromDocument(document, documentPropertiesFilteringOptions);
            })
        );
    }
}
