/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ContentChild, EventEmitter, HostListener, inject, Input, OnChanges, Output, ViewChild } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { EMPTY, Observable } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';
import {
    DataRowEvent,
    DataTableComponent,
    ObjectDataRow,
    DataCellEvent,
    DataRow,
    DataColumnListComponent,
    DataColumn,
    EmptyContentComponent,
    LoadingContentTemplateDirective,
    NoContentTemplateDirective,
    DataSorting,
    provideTranslations,
} from '@alfresco/adf-core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ContextActionConfiguration, ContextMenuActionsService, DocumentCacheService } from '@alfresco/adf-hx-content-services/services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CONTEXT_MENU_ACTIONS_PROVIDERS } from '../../adf-enterprise-adf-hx-content-services-ui.providers';

/**
 * Component presents document breadcrumb.
 * To use the `HxpDocumentListComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { HxpDocumentListComponent } from '@alfresco/adf-hx-content-services/ui';
 * @NgModule({
 *     imports: [
 *         HxpDocumentListComponent
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-document-list [isLoading]="isLoading" [documents]="documents" [schema]="schema">
 * </hxp-document-list>
 */

@Component({
    selector: 'hxp-document-list',
    templateUrl: './document-list.component.html',
    styleUrls: ['./document-list.component.scss'],
    standalone: true,
    imports: [
        DataColumnListComponent,
        LoadingContentTemplateDirective,
        MatProgressSpinnerModule,
        NoContentTemplateDirective,
        EmptyContentComponent,
        DataTableComponent,
    ],
    providers: [
        provideTranslations('adf-enterprise-adf-hx-content-services-ui', 'assets/adf-enterprise-adf-hx-content-services-ui'),
        provideTranslations('process-services-cloud-extension-process-form', 'assets/process-services-cloud-extension-process-form'),
        provideTranslations('content-services-extension-content-browser-feature-shell', 'assets/content-services-extension-content-browser'),
        ...CONTEXT_MENU_ACTIONS_PROVIDERS,
    ],
})
export class HxpDocumentListComponent implements OnChanges {
    /**
     * The list of documents to be displayed.
     * @type {Document[]}
     * @default []
     *
     */
    @Input() documents: Document[] = [];

    /**
     * Indicates whether the document list is currently loading.
     * When set to `true`, a loading indicator may be displayed.
     * Defaults to `false`.
     * @type {boolean}
     * @default false
     */
    @Input() isLoading = false;
    /**
     * Indicates whether it is possible to select more than one document.
     * @type {boolean}
     * @default true
     */
    @Input() multiselect = true;
    /**
     * Indicates whether the context menu actions are enabled.
     * @type {boolean}
     * @default true
     */
    @Input() contextMenuActions = true;
    /**
     * The list of `DataColumnListComponent` to be displayed.
     * Set the parent component as following to pass the list of columns:
     * - add the columns in the template
     * - refer to them using the `ViewChild` or `ContentChild` decorator.
     * - pass the reference to the `inputColumnList` property.
     *
     * Alfresco documentation of `DataColumnListComponent` can be found here:
     * https://www.alfresco.com/abn/adf/docs/core/components/data-column.component/
     * @optional
     * @type {DataColumnListComponent}
     *
     *
     */
    @Input() inputColumnList?: DataColumnListComponent;
    /**
     * The `DataColumn` schema representing the columns to be displayed.
     * Alfresco doc: https://www.alfresco.com/abn/adf/docs/core/components/data-column.component/
     * @type {DataColumn[]}
     * @default []
     *
     */
    @Input() schema: DataColumn[] | undefined;

    /**
     * Event emitter that notifies the list of selected documents whenever it changes.
     *
     * @event selectedDocuments
     */
    @Output() selectedDocuments: EventEmitter<Document[]> = new EventEmitter();
    /**
     * Emit the Document associated with the clicked row, when the row is clicked.
     *
     * @event rowClicked
     */
    @Output() rowClicked: EventEmitter<Document> = new EventEmitter();
    /**
     * Event emitter that notifies when sorting the Document List.
     * The emitted value is a string in the form of `<column name> <direction>`
     *
     * @event sortingClicked
     */
    @Output() sortingClicked: EventEmitter<string[]> = new EventEmitter();
    /**
     * Event emitter that notifies when columns are resized.
     * The event payload is an array of `DataColumn` objects with updated width.
     *
     * @event columnsResized
     */
    @Output() columnsResized: EventEmitter<DataColumn[]> = new EventEmitter();

    protected evaluatedSchema: DataColumn[] = [];

    @ViewChild('documentList') private documentListElement!: DataTableComponent;
    @ContentChild(DataColumnListComponent) protected projectedColumnList?: DataColumnListComponent;

    private parentDocument: Document | undefined;

    private documentCache = inject(DocumentCacheService);
    private contextMenuActionsService = inject(ContextMenuActionsService);

    /**
     * Property to access the underlying Alfresco `DataTableComponent` instance.
     * https://www.alfresco.com/abn/adf/docs/core/components/datatable.component/
     */
    get table() {
        return this.documentListElement;
    }

    ngOnChanges() {
        this.updateDocumentList();
    }

    /**
     * Resets the selection of the document list.
     */
    resetSelection() {
        if (this.documentListElement) {
            this.documentListElement.resetSelection();
            if (this.documents && this.documentListElement.data) {
                this.documentListElement.onSelectAllClick({
                    checked: false,
                } as MatCheckboxChange);
            }
        }
        this.selectedDocuments.emit([]);
    }

    /**
     * Resets the sorting of the document list.
     */
    resetSorting() {
        if (this.documentListElement) {
            this.documentListElement.sorting = [];
        }
    }

    @HostListener('contextmenu', ['$event'])
    protected onShowContextMenu(event: MouseEvent) {
        event.preventDefault();
        const allRows = this.documentListElement.data.getRows();
        this.documentListElement.onSelectAllClick({
            checked: false,
        } as MatCheckboxChange);
        for (const row of allRows) {
            if (row.isContextMenuSource) {
                this.selectedDocuments.emit([row['obj']]);
                this.documentListElement.selectRow(row, true);
            }
        }
    }

    protected handleRowClicked(event: DataRowEvent): void {
        this.rowClicked.emit(<Document>event.value['obj']);
    }

    protected handleSortingChanged(event: Event): void {
        const sortingEvent = event as CustomEvent<DataSorting>;
        if (!sortingEvent.detail) {
            return;
        }

        const { key, direction } = sortingEvent.detail;
        if (key && direction) {
            this.sortingClicked.emit([`${key} ${direction}`]);
        }
    }

    protected setSelectedRows(event: Event) {
        const selectionEvent = event as CustomEvent<{ selection: ObjectDataRow[] }>;
        if (Array.isArray(selectionEvent?.detail?.selection)) {
            const selection = selectionEvent.detail.selection.map((row: ObjectDataRow) => row['obj']);
            this.selectedDocuments.emit(selection);
        }
    }

    protected onColumnsWidthChange(columns: DataColumn[]) {
        this.columnsResized.emit(columns);
    }

    protected onShowRowContextMenu(event: DataCellEvent) {
        if (!this.contextMenuActions) {
            return;
        }

        const assignActions = (doc: Document | undefined) => {
            event.value.actions = this.getContextActions(event.value.row, doc);
        };

        if (this.parentDocument) {
            assignActions(this.parentDocument);
            return;
        }

        const parentId = event.value.row['obj'].sys_parentId;
        this.refreshCachedDocument(parentId)?.subscribe({
            next: (doc: Document | undefined) => {
                assignActions(doc);
            },
            error: (error) => {
                console.error(error);
            },
        });
    }

    private updateDocumentList() {
        if (!this.documents) {
            this.documents = [];
        }
        if (this.documents.length > 0) {
            if (Array.isArray(this.schema)) {
                this.evaluatedSchema = [...this.schema];
            } else {
                this.configureSchema();
            }
            this.fetchCommonParentDocument(this.documents);
        }
    }

    private fetchCommonParentDocument(docs: Document[]): void {
        const parentIds = docs.map((doc) => doc.sys_parentId);
        if (parentIds[0] && parentIds.every((parentId) => parentId === parentIds[0])) {
            this.refreshCachedDocument(parentIds[0]).subscribe({
                next: (doc: Document | undefined) => {
                    this.parentDocument = doc;
                },
                error: (error) => {
                    console.error(error);
                },
            });
        } else {
            this.parentDocument = undefined;
        }
    }

    private refreshCachedDocument(sysId: string): Observable<Document | undefined> {
        this.documentCache.invalidate(sysId);
        return this.documentCache.getDocument(sysId).pipe(
            catchError((error) => {
                /**
                 * if there is an error here, we need to swallow it, otherwise the interface will hang.
                 *
                 * onShowRowContextMenu is called constantly which means that if we don't swallow it, we'd be
                 * throwing an exception at every call.
                 */
                console.error(error);
                return EMPTY;
            }),
            shareReplay(1)
        );
    }

    private configureSchema(): void {
        if (this.documentListElement) {
            const inputSchema: DataColumn[] = this.inputColumnList?.columns.toArray() || [];
            const projectedSchema: DataColumn[] = this.projectedColumnList?.columns.toArray() || [];
            this.evaluatedSchema = [...inputSchema, ...projectedSchema];
        }
    }

    private getContextActions(rowData: DataRow, parentDocument?: Document): ContextActionConfiguration[] {
        return this.contextMenuActionsService.getContextActions(rowData['obj'], parentDocument);
    }
}
