/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewItem, InfoDrawerComponent, InfoDrawerContentDirective, InfoDrawerLayoutComponent, InfoDrawerTabComponent } from '@alfresco/adf-core';
import { Component, DestroyRef, EventEmitter, inject, Inject, Input, OnChanges, Output, ViewEncapsulation } from '@angular/core';
import { DocumentService, DOCUMENT_PROPERTIES_SERVICE, SharedDocumentPropertiesService } from '@alfresco/adf-hx-content-services/services';
import { Observable } from 'rxjs';
import { take, finalize, filter } from 'rxjs/operators';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { NgIf, AsyncPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { PropertiesViewerContainerComponent } from '../properties-viewer-container/properties-viewer-container.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

/**
 * Sidebar component to display and edit a Document properties.
 *
 * To use the `HxpPropertiesSidebarComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { HxpPropertiesSidebarComponent } from '@alfresco/adf-hx-content-services/ui';
 *
 * @NgModule({
 *     imports: [
 *         HxpPropertiesSidebarComponent
 *         ...
 *     ],
 *    [...]
 * })
 *
 * export class AppModule {}
 *
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-properties-sidebar [editable]="false" [document]="document" (closePropertySidebar)="onClose()">
 */
@Component({
    selector: 'hxp-properties-sidebar',
    templateUrl: './hxp-properties-sidebar.component.html',
    styleUrls: ['./hxp-properties-sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        InfoDrawerLayoutComponent,
        InfoDrawerContentDirective,
        MatButtonModule,
        MatIconModule,
        InfoDrawerComponent,
        InfoDrawerTabComponent,
        NgIf,
        MatProgressSpinnerModule,
        PropertiesViewerContainerComponent,
        AsyncPipe,
        TranslatePipe,
    ],
})
export class HxpPropertiesSidebarComponent implements OnChanges {
    private readonly destroyRef = inject(DestroyRef);

    /**
     * The document to display the properties for
     * @type {Document}
     */
    @Input() document?: Document;

    /**
     * Input property to enable or disable edit mode availability
     * @type {boolean}
     * @default true
     */
    @Input() editable = true;

    /**
     * Emits an event when the sidebar is closed
     */
    @Output() closePropertySidebar = new EventEmitter<void>();

    protected propertyLoading = false;
    protected selectedDocument!: Document;
    protected documentProperties$!: Observable<CardViewItem[]>;
    protected otherDocumentProperties$!: Observable<CardViewItem[]>;

    constructor(
        private documentService: DocumentService,
        @Inject(DOCUMENT_PROPERTIES_SERVICE) private documentPropertiesService: SharedDocumentPropertiesService
    ) {
        this.subscribeToDocumentUpdates();
    }

    ngOnChanges() {
        this.loadDocumentProperties(this.document?.sys_id ?? '');
    }

    protected handlePropertyUpdate(propertyUpdated: boolean): void {
        if (propertyUpdated) {
            this.fetchDefaultProperties();
            this.fetchOtherProperties();
        }
    }

    protected onClose(): void {
        this.closePropertySidebar.emit();
    }

    private subscribeToDocumentUpdates(): void {
        this.documentService.documentUpdated$
            .pipe(
                filter(({ document }) => !!document && document.sys_id === this.document?.sys_id),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: () => {
                    this.loadDocumentProperties(this.document?.sys_id ?? '');
                },
                error: (error) => console.error(error),
            });
    }

    private loadDocumentProperties(documentId: string): void {
        if (!documentId) {
            return;
        }

        this.propertyLoading = true;
        this.documentService
            .getDocumentById(documentId)
            .pipe(
                take(1),
                finalize(() => (this.propertyLoading = false))
            )
            .subscribe({
                next: (doc) => {
                    this.selectedDocument = doc;
                    this.fetchDocumentProperties();
                },
                error: ({ error }) => {
                    console.error(error);
                },
            });
    }

    private fetchDocumentProperties(): void {
        if (!this.selectedDocument) {
            return;
        }

        this.documentPropertiesService
            .extractCustomSchemaFields(this.selectedDocument.sys_primaryType)
            .pipe(take(1))
            .subscribe({
                next: (schemaFields: Record<string, any>) => {
                    this.initializeDocumentWithSchema(schemaFields);
                },
                error: (error) => console.error(error),
            });

        this.fetchDefaultProperties();
        this.fetchOtherProperties();
    }

    private initializeDocumentWithSchema(schemaFields: Record<string, any>, currentDoc: Record<string, any> = this.selectedDocument): void {
        for (const fieldName of Object.keys(schemaFields)) {
            if (!currentDoc[fieldName]) {
                currentDoc[fieldName] = typeof schemaFields[fieldName] === 'object' ? {} : '';
            }
            if (typeof schemaFields[fieldName] === 'object') {
                this.initializeDocumentWithSchema(schemaFields[fieldName], currentDoc[fieldName]);
            }
        }
    }

    private fetchDefaultProperties(): void {
        this.documentProperties$ = this.documentPropertiesService.getDefaultPropertiesFromDocument(this.selectedDocument);
    }

    private fetchOtherProperties(): void {
        this.otherDocumentProperties$ = this.documentPropertiesService.getPropertiesFromDocument(this.selectedDocument, {
            exclude: {
                schemas: ['sysfile_blob', 'sys_', 'sysver_', 'sysgov_'],
            },
        });
    }
}
