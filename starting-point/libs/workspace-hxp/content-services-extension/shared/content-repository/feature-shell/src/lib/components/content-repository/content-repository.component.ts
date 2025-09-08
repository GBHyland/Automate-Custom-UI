/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AfterContentChecked, Component, ContentChild, EventEmitter, Inject, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActionContext, HXP_DOCUMENT_INFO_ACTION_SERVICE, DocumentService } from '@alfresco/adf-hx-content-services/services';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { ContentPropertyViewerActionService, HxpDocumentListComponent, TableSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
import { of } from 'rxjs';
import { delay, filter, take } from 'rxjs/operators';
import { DataColumn, DataColumnListComponent } from '@alfresco/adf-core';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocumentActionToolbarComponent } from '@hxp/workspace-hxp/content-services-extension/shared/content-repository/ui';
import { NgIf } from '@angular/common';
import { ContentUploadDragAreaComponent } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

@Component({
    standalone: true,
    selector: 'hxp-content-repository',
    templateUrl: './content-repository.component.html',
    styleUrls: ['./content-repository.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [NgIf, HxpDocumentListComponent, DocumentActionToolbarComponent, TableSkeletonLoaderComponent, ContentUploadDragAreaComponent],
})
export class ContentRepositoryComponent implements AfterContentChecked {
    @Input() documents: Document[] | null = null;
    @Input() rootFolderId: string;
    @Input() isUploadDisabled: true | undefined = true;
    @Input() actionContext: ActionContext;
    @Input() isLoading: boolean;

    @Output() rowClicked = new EventEmitter<Document>();
    @Output() sortingClicked = new EventEmitter<string[]>();
    @Output() selectionChanged = new EventEmitter<Document[]>();
    @Output() columnsResized = new EventEmitter<DataColumn[]>();

    @ContentChild(DataColumnListComponent) columnList: DataColumnListComponent;
    @ViewChild('documentList') private documentListElement: HxpDocumentListComponent;

    protected selection: Document[] = [];
    private updatedDocument: Document | null = null;

    constructor(
        private documentService: DocumentService,
        @Inject(HXP_DOCUMENT_INFO_ACTION_SERVICE)
        private contentPropertyViewerActionService: ContentPropertyViewerActionService,
        private activatedRoute: ActivatedRoute
    ) {
        this.activatedRoute.url.pipe(takeUntilDestroyed()).subscribe((url) => {
            if (url) {
                this.resetTableSelection();
                this.resetTableSorting();
            }
        });

        this.documentService.clearDocumentSelection$.pipe(takeUntilDestroyed()).subscribe(() => {
            this.resetTableSelection();
        });

        this.documentService.documentUpdated$
            .pipe(
                filter(({ document }) => !!document && this.documents?.some((doc) => doc.sys_id === document.sys_id)),
                takeUntilDestroyed()
            )
            .subscribe({
                next: ({ document }) => {
                    this.updatedDocument = document;
                },
                error: ({ error }) => console.error(error),
            });
    }

    ngAfterContentChecked() {
        if (this.updatedDocument && !this.isLoading) {
            of(this.updatedDocument)
                .pipe(delay(0), take(1))
                .subscribe((document) => {
                    this.selectRowOfDocument(document);
                });
            this.updatedDocument = null;
        }
    }

    onRowClicked(event: Document): void {
        this.rowClicked.emit(event);
    }

    protected onSortingClicked(event: string[]): void {
        this.sortingClicked.emit(event);
    }

    protected onColumnsWidthChange(event: any): void {
        this.columnsResized.emit(event);
    }

    protected onSelectedDocumentsChange(documents: Document[]) {
        if (this.hasSelectionChanged(this.selection, documents)) {
            this.selection = documents;
            this.selectionChanged.emit(this.selection);
            this.actionContext = { ...this.actionContext, documents: this.selection, showPanel: undefined };
            this.contentPropertyViewerActionService.execute(this.actionContext);
        }
    }

    private hasSelectionChanged(currentSelection: Document[], newSelection: Document[]): boolean {
        if (currentSelection.length !== newSelection.length) {
            return true;
        }

        return !currentSelection.every((currentDoc) => newSelection.some((newDoc) => newDoc.id === currentDoc.id));
    }

    private resetTableSelection() {
        this.updatedDocument = null;
        if (this.documentListElement) {
            this.documentListElement.resetSelection();
        }
    }

    private resetTableSorting() {
        if (this.documentListElement) {
            this.documentListElement.resetSorting();
        }
    }

    private selectRowOfDocument(document: Document): void {
        if (this.documentListElement) {
            const { table } = this.documentListElement;
            const rowToSelect = table.data.getRows().find((row) => row.getValue('sys_id') === document.sys_id);
            if (rowToSelect) {
                table.selectRow(rowToSelect, true);
            }
        }
    }
}
