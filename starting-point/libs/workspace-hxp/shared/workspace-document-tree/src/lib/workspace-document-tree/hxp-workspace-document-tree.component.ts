/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import {
    ContextActionConfiguration,
    DocumentService,
    DocumentTreeDatabaseService,
    DocumentTreeNode,
} from '@alfresco/adf-hx-content-services/services';
import { AfterViewInit, Component, DestroyRef, EventEmitter, inject, Input, Output, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { TranslatePipe } from '@ngx-translate/core';
import { forkJoin, merge, Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, switchMap } from 'rxjs/operators';
import { NgFor, NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { HxpDocumentTreeComponent } from '@alfresco/adf-hx-content-services/ui';
import { DocumentCopyActionService, DocumentMoveActionService, DocumentPathChange } from '@hxp/workspace-hxp/shared/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    selector: 'hxp-workspace-document-tree',
    templateUrl: './hxp-workspace-document-tree.component.html',
    styleUrl: './hxp-workspace-document-tree.component.scss',
    standalone: true,
    imports: [NgIf, NgFor, MatMenuModule, MatIconModule, TranslatePipe, HxpDocumentTreeComponent],
    encapsulation: ViewEncapsulation.None,
})
export class HxpWorkspaceDocumentTreeComponent implements AfterViewInit {
    @Input()
    documents: Document[] = [];

    @Input()
    multiSelection = false;

    @Output()
    selectedDocument = new EventEmitter<Document>();

    @ViewChild(HxpDocumentTreeComponent)
    private uiDocumentTree!: HxpDocumentTreeComponent;

    private dataSource!: DocumentTreeDatabaseService;
    private documentPathChange$: Observable<DocumentPathChange> = merge(
        this.documentCopyActionService.documentPathChange$,
        this.documentMoveActionService.documentPathChange$
    );
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private documentService: DocumentService,
        private documentCopyActionService: DocumentCopyActionService,
        private documentMoveActionService: DocumentMoveActionService
    ) {}

    ngAfterViewInit(): void {
        this.dataSource = this.uiDocumentTree.dataSource;

        this.documentService.documentDeleted$
            .pipe(
                map((docId) => this.dataSource.findNodeByDocumentId(docId)),
                filter((node): node is DocumentTreeNode & { document: Document } => !!node?.document),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (nodeToDelete) => {
                    this.dataSource.deleteNode(nodeToDelete as DocumentTreeNode);
                },
                error: (err) => {
                    console.error(err);
                },
            });

        this.documentService.documentCreated$
            .pipe(
                debounceTime(1000), // Same approach as in document list
                map((newDocument) => {
                    const parentNode = this.dataSource.findNodeByDocumentId(newDocument.sys_parentId);
                    return { parentNode, newDocument };
                }),
                filter(({ parentNode }) => !!parentNode),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: ({ newDocument }) => {
                    this.dataSource.refreshNode(newDocument.sys_parentId);
                },
                error: (err) => {
                    console.error(err);
                },
            });

        this.documentService.documentUpdated$
            .pipe(
                map((updateInfo) => updateInfo.document),
                filter((updatedDocument): updatedDocument is Document => !!updatedDocument),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (updatedDocument) => {
                    if (updatedDocument.sys_parentId === ROOT_DOCUMENT.sys_id) {
                        this.dataSource.updateNode(updatedDocument);
                    } else {
                        this.dataSource.refreshNode(updatedDocument.sys_parentId);
                    }
                },
                error: (err) => {
                    console.error(err);
                },
            });

        this.documentPathChange$
            .pipe(
                switchMap((documentPathChange) => {
                    return forkJoin([this.getAncestors(documentPathChange.origin), this.getAncestors(documentPathChange.target)]);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe({
                next: (originTargetAncestors) => {
                    this.updateAncestorNodes(originTargetAncestors);
                },
                error: (err) => {
                    console.error(err);
                },
            });
    }

    onSelectedDocument(document: Document) {
        this.selectedDocument.emit(document);
    }

    onMenuItemClick(menuItem: ContextActionConfiguration) {
        if (menuItem?.model?.visible) {
            menuItem.subject.next(menuItem);
        }
    }

    private openNodes(documents: (Document | undefined)[]) {
        if (!this.multiSelection && Array.isArray(documents) && documents.length > 0) {
            this.dataSource.openNodes(documents);
        }
    }

    private getAncestors(documentId: string): Observable<Document[]> {
        return this.documentService.getAncestors(documentId).pipe(catchError(() => of([{ ...ROOT_DOCUMENT }])));
    }

    private updateAncestorNodes(ancestorsPaths: Document[][]) {
        const ids: string[] = [];
        for (const ancestors of ancestorsPaths) {
            const lastAncestor = ancestors[ancestors.length - 1];
            if (lastAncestor?.sys_id && !ids.includes(lastAncestor.sys_id)) {
                ids.push(lastAncestor.sys_id || '');
                if (lastAncestor.sys_id === ROOT_DOCUMENT.sys_id) {
                    this.dataSource.refreshNode(ROOT_DOCUMENT.sys_id);
                } else {
                    const lastAncestorNode = this.dataSource.findNodeByDocumentId(lastAncestor.sys_id);
                    if (lastAncestorNode) {
                        this.dataSource.toggleNode(lastAncestorNode, { expand: true, isRefresh: true });
                    }
                    this.openNodes(ancestors);
                }
            }
        }
    }
}
