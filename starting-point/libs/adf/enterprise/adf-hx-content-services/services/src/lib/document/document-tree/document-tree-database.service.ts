/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CollectionViewer, DataSource, SelectionChange } from '@angular/cdk/collections';
import { BehaviorSubject, merge, of, Observable, Subject } from 'rxjs';
import { FlatTreeControl } from '@angular/cdk/tree';
import { finalize, map, catchError, takeUntil, delay, take } from 'rxjs/operators';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { Injectable } from '@angular/core';
import { DocumentTreeNode } from './models/document-tree-node';
import { DocumentService } from '../document.service';
import { DEFAULT_ITEMS_PER_PAGE } from '../configs/document-tree.config';
import { DocumentFetchOptions, DocumentFetchResults, ToggleNodeOptions } from '../document.models';
import { isFolder } from '../configs/document.utils';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';

@Injectable()
export class DocumentTreeDatabaseService implements DataSource<DocumentTreeNode> {
    private _dataChange = new BehaviorSubject<DocumentTreeNode[]>([]);
    private _data: DocumentTreeNode[] = [];
    private _treeControl: FlatTreeControl<DocumentTreeNode>;
    // Triggered when DataSource.disconnect is called. Do not replace with DestroyRef
    private destroy$: Subject<void> = new Subject<void>();

    get treeControl() {
        return this._treeControl;
    }

    constructor(private documentService: DocumentService) {
        this._treeControl = new FlatTreeControl<DocumentTreeNode>(this._getLevel, this._isExpandable);
    }

    setDocumentTreeRoot(document: Document) {
        this._data = this.toNode(document);
        this._treeControl.dataNodes = this._data;
    }

    connect(collectionViewer: CollectionViewer): Observable<DocumentTreeNode[]> {
        this._treeControl.expansionModel.changed.pipe(takeUntil(this.destroy$)).subscribe({
            next: (change: SelectionChange<DocumentTreeNode>) => {
                if (change.added || change.removed) {
                    this._handleTreeControl(change);
                }
            },
        });
        return merge(collectionViewer.viewChange, this._dataChange).pipe(map(() => this._data));
    }

    disconnect(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    openNodeAtIndex(index: number) {
        const node = this.treeControl.dataNodes[index];
        this._treeControl.expand(node);
        this.toggleNode(node, { expand: true });
    }

    findNodeByDocumentId(documentId: string | undefined): DocumentTreeNode | undefined {
        return this._treeControl.dataNodes.find((node: DocumentTreeNode) => node.document.sys_id === documentId);
    }

    openNodes(documents: (Document | undefined)[]) {
        const doc = documents.shift();
        const ancestor = this.findNodeByDocumentId(doc?.sys_id);

        if (ancestor) {
            if (!this._treeControl.isExpanded(ancestor) || ancestor.isLoading) {
                this._treeControl.expand(ancestor);
                if (ancestor.nodeLoaded) {
                    ancestor.nodeLoaded.pipe(takeUntil(this.destroy$)).subscribe({
                        next: () => {
                            if (documents.length > 0) {
                                this.openNodes(documents);
                            }
                        },
                    });
                }
            } else {
                this.openNodes(documents);
            }
        }
    }

    refreshNode(documentId: string | undefined) {
        const nodeToExpand = this.findNodeByDocumentId(documentId);
        if (nodeToExpand) {
            this.toggleNode(nodeToExpand, { isRefresh: true, expand: true });
        }
    }

    updateNode(updatedDocument: Document) {
        const nodeToUpdate = this.findNodeByDocumentId(updatedDocument.sys_id);

        if (!nodeToUpdate) {
            return;
        }

        nodeToUpdate.document = updatedDocument;
        this._dataChange.next(this._data);
    }

    deleteNode(node: DocumentTreeNode) {
        const nodeIndex = this._data.indexOf(node);
        if (nodeIndex < 0) {
            return;
        }

        let count = 1;
        for (let i = nodeIndex + 1; i < this._data.length && this._data[i].level > node.level; i++) {
            count++;
        }
        this._data.splice(nodeIndex, count);
        this._dataChange.next(this._data);
    }

    dataChanges(): Observable<DocumentTreeNode[]> {
        return this._dataChange.asObservable();
    }

    toggleNode(node: DocumentTreeNode, options: ToggleNodeOptions) {
        const { expand } = options;

        if (expand) {
            this.fetchAndUpdateNode(node, options);
        } else {
            this.collapseNode(node);
        }
    }

    private fetchAndUpdateNode(node: DocumentTreeNode, options: ToggleNodeOptions): void {
        const { limit = DEFAULT_ITEMS_PER_PAGE, offset = 0 } = options;
        node.isLoading = true;

        const fetchOptions: DocumentFetchOptions = { limit, offset, sort: [] };

        this.getChildren(node.document, '', fetchOptions)
            .pipe(
                takeUntil(node.loadCancel$),
                finalize(() => (node.isLoading = false))
            )
            .subscribe({
                next: (children) => {
                    if (children.documents.length === 0 && node.document.sys_id === ROOT_DOCUMENT.sys_id) {
                        this._dataChange.next(this._data);
                        node.nodeLoaded.next(true);
                    } else {
                        this.handleNodeChildren(node, children, options);
                    }
                },
                error: (error) => {
                    console.error(error);
                    if (node.nodeLoaded) {
                        node.nodeLoaded.next(false);
                    }
                },
            });
    }

    private handleNodeChildren(node: DocumentTreeNode, children: DocumentFetchResults, options: ToggleNodeOptions): void {
        const { limit = DEFAULT_ITEMS_PER_PAGE, offset = 0, isRefresh = false } = options;
        const index = this._data.indexOf(node);

        if (!children.documents || index < 0) {
            return;
        }

        if (isRefresh) {
            this.clearChildren(node, index);
        }

        const insertIndex =
            this.findLastIndex(
                this._data,
                // eslint-disable-next-line unicorn/no-array-method-this-argument
                (item, i) => i > index && item.level > node.level && !item.isSkeleton && item.document.sys_parentId === node.document.sys_id
            ) + 1 || index + 1;

        // Find the index of the first non-skeleton node after the current insert index.
        const skeletonNodesEndIndex = this._data.findIndex((item, i) => i >= insertIndex && !item.isSkeleton);
        const endIndex = skeletonNodesEndIndex >= 0 ? skeletonNodesEndIndex : this._data.length;

        // Remove skeleton nodes from the current node's children.
        this._data.splice(insertIndex, endIndex - insertIndex);

        // Create new tree nodes for each child document and insert them into the data array.
        const newNodes = children.documents.map((child) => new DocumentTreeNode(child, node.level + 1, this.isExpandable(child)));
        this._data.splice(insertIndex, 0, ...newNodes);

        const totalCount = children.totalCount ?? children.documents.length;

        if (totalCount > children.documents.length + offset) {
            this.addSkeletonPlaceholders(node, newNodes, totalCount, offset, limit);
        }

        this._dataChange.next(this._data);
        node.nodeLoaded.next(true);
    }

    private addSkeletonPlaceholders(node: DocumentTreeNode, newNodes: DocumentTreeNode[], totalCount: number, offset: number, limit: number): void {
        const placeholdersCount = totalCount - newNodes.length - offset;
        const placeholders = Array.from<DocumentTreeNode>({ length: placeholdersCount }).fill({
            document: { sys_primaryType: 'skeleton-type' },
            level: node.level + 1,
            isExpandable: false,
            isSkeleton: true,
        } as DocumentTreeNode);

        const insertIndex = this._data.indexOf(newNodes[0]) + newNodes.length;
        this._data.splice(insertIndex, 0, ...placeholders);

        // Automatically fetch the next batch of children after a short delay to avoid overloading requests.
        this.dataChanges()
            .pipe(take(1), delay(100))
            .subscribe({
                next: () => this.fetchAndUpdateNode(node, { limit, offset: offset + limit, expand: true }),
                error: (err) => console.error('Failed to fetch and update node:', err),
            });
    }

    private collapseNode(node: DocumentTreeNode) {
        node.loadCancel$.next();
        node.loadCancel$.complete();
        node.loadCancel$ = new Subject<void>();

        this.clearChildren(node, this._data.indexOf(node));
        this._dataChange.next(this._data);
    }

    private findLastIndex<DocumentNode>(
        array: DocumentNode[],
        predicate: (value: DocumentNode, index: number, array: DocumentNode[]) => boolean
    ): number {
        for (let i = array.length - 1; i >= 0; i--) {
            if (predicate(array[i], i, array)) {
                return i;
            }
        }
        return -1;
    }

    private clearChildren(node: DocumentTreeNode, index: number) {
        let count = 0;
        for (let i = index + 1; i < this._data.length && this._data[i].level > node.level; i++) {
            count++;
        }
        this._data.splice(index + 1, count);
    }

    private _handleTreeControl(change: SelectionChange<DocumentTreeNode>) {
        if (change.added) {
            change.added.forEach((node) => this.toggleNode(node, { expand: true }));
        }

        if (change.removed) {
            [...change.removed].reverse().forEach((node) => this.toggleNode(node, { expand: false }));
        }
    }

    private toNode(document: Document): DocumentTreeNode[] {
        return [new DocumentTreeNode(document, 0, true, false, false)];
    }

    private isExpandable(node: Document): boolean {
        // In the future we should check and rely on the fact if the document contains any children, rather than if is a folder type
        return isFolder(node);
    }

    private getChildren(node: Document, repositoryId: string, options: DocumentFetchOptions): Observable<DocumentFetchResults> {
        return this.documentService.getFolderChildren(node.sys_id || '', repositoryId, options).pipe(
            catchError(() =>
                of({
                    documents: [],
                    limit: 0,
                    offset: 0,
                    totalCount: 0,
                })
            )
        );
    }

    private _getLevel = (node: DocumentTreeNode) => node.level;

    private _isExpandable = (node: DocumentTreeNode) => node.isExpandable;
}
