/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DocumentTreeDatabaseService } from './document-tree-database.service';
import { firstValueFrom, of } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { take } from 'rxjs/internal/operators/take';
import { DocumentTreeNode } from './models/document-tree-node';
import { DocumentService } from '../document.service';
import { isFolder } from '../configs/document.utils';
import { DocumentFetchOptions, DocumentFetchResults } from '../document.models';
import { DEFAULT_ITEMS_PER_PAGE } from '../configs/document-tree.config';

describe('DocumentTreeDatabaseService', () => {
    let service: DocumentTreeDatabaseService;
    const documentService = {
        getFolderChildren: jest.fn().mockReturnValue(
            of({
                limit: 0,
                offset: 0,
                totalCount: 1,
                documents: jestMocks.nestedDocumentAncestors,
            })
        ),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocumentTreeDatabaseService, { provide: DocumentService, useValue: documentService }],
        });
        service = TestBed.inject(DocumentTreeDatabaseService);
    });

    it('should set a Document as DocumentTree Root data', () => {
        service.setDocumentTreeRoot(jestMocks.folderDocument);
        const result = service.treeControl.dataNodes;

        expect(result.length).toBe(1);
        expect(result[0].document).toBe(jestMocks.folderDocument);
        expect(result[0].level).toBe(0);
        expect(isFolder(result[0].document)).toBe(true);
    });

    it('should find a node by providing a Document id', () => {
        service.setDocumentTreeRoot(jestMocks.folderDocument);
        expect(service.findNodeByDocumentId(jestMocks.folderDocument.sys_id)?.document).toBe(jestMocks.folderDocument);
    });

    it('should open a node by providing an index', () => {
        service.setDocumentTreeRoot(jestMocks.folderDocument);
        const node: DocumentTreeNode = service.findNodeByDocumentId(jestMocks.folderDocument.sys_id) as DocumentTreeNode;
        service.toggleNode(node, { expand: false });

        expect(service.treeControl.isExpanded(node)).toBe(false);

        service.openNodeAtIndex(0);

        expect(service.treeControl.isExpanded(node)).toBe(true);
    });

    it('should delete a node', (done) => {
        service.setDocumentTreeRoot(jestMocks.folderDocument);
        const node: DocumentTreeNode = service.findNodeByDocumentId(jestMocks.folderDocument.sys_id) as DocumentTreeNode;
        service.deleteNode(node);
        service.dataChanges().subscribe((result) => {
            expect(result.length).toBe(0);
            done();
        });
    });

    it('should update a node', (done) => {
        service.setDocumentTreeRoot(jestMocks.folderDocument);
        const updatedDocument: Document = { ...jestMocks.folderDocument, sys_title: 'Updated Title' };
        service.updateNode(updatedDocument);
        service.dataChanges().subscribe((result) => {
            expect(result.length).toBe(1);
            expect(result[0].document.sys_title).toBe('Updated Title');
            done();
        });
    });

    it('should get children', async () => {
        const parentNode: Document = ROOT_DOCUMENT;
        const children: Document[] = jestMocks.nestedDocumentAncestors;

        const mockFetchOptions: DocumentFetchOptions = {
            limit: DEFAULT_ITEMS_PER_PAGE,
            offset: 0,
            sort: [],
        };

        const result: DocumentFetchResults = await firstValueFrom((service as any).getChildren(parentNode, '', mockFetchOptions));

        expect(result.documents).toEqual(children);
    });

    it('should determine if node is expandable', () => {
        const folderNode: Document = jestMocks.folderDocument;
        const documentNode: Document = jestMocks.fileDocument;

        expect((service as any).isExpandable(folderNode)).toBe(true);
        expect((service as any).isExpandable(documentNode)).toBe(false);
    });

    it('should auto-fetch additional documents when more are available based on totalCount', (done) => {
        const parentNode: Document = jestMocks.folderDocument;
        const initialChildren: Document[] = jestMocks.nestedDocumentAncestors;
        const additionalChildren: Document[] = jestMocks.nestedDocumentAncestors2;

        documentService.getFolderChildren.mockReturnValueOnce(
            of({
                limit: DEFAULT_ITEMS_PER_PAGE,
                offset: 0,
                totalCount: 4,
                documents: initialChildren,
            })
        );

        documentService.getFolderChildren.mockReturnValueOnce(
            of({
                limit: DEFAULT_ITEMS_PER_PAGE,
                offset: initialChildren.length,
                totalCount: 4,
                documents: additionalChildren,
            })
        );

        service.setDocumentTreeRoot(parentNode);
        const node: DocumentTreeNode = service.findNodeByDocumentId(parentNode.sys_id) as DocumentTreeNode;

        service.toggleNode(node, { expand: true, limit: 2, offset: 0 });

        service
            .dataChanges()
            .pipe(take(1))
            .subscribe((initialResult) => {
                const initialChildNodes = initialResult.filter((n) => n.level === node.level + 1);

                expect(initialChildNodes.length).toBe(4);
                expect(initialChildNodes.filter((n) => n.isSkeleton).length).toBe(2);

                service.toggleNode(node, { expand: true, limit: 2, offset: 2 });

                service
                    .dataChanges()
                    .pipe(take(1))
                    .subscribe((finalResult) => {
                        const finalChildNodes = finalResult.filter((n) => n.level === node.level + 1);

                        expect(finalChildNodes.filter((n) => n.isSkeleton).length).toBe(0);
                        expect(finalChildNodes.length).toBe(4);
                        expect(finalChildNodes.map((n) => n.document)).toEqual([...initialChildren, ...additionalChildren]);

                        done();
                    });
            });
    });

    it('should insert children at the correct index based on sys_parentId', (done) => {
        const parentNode: Document = { ...jestMocks.folderDocument, sys_id: 'parent-1', sys_parentId: 'root' };
        const childNode1: Document = { ...jestMocks.fileDocument, sys_id: 'child-1', sys_parentId: 'parent-1' };
        const childNode2: Document = { ...jestMocks.fileDocument, sys_id: 'child-2', sys_parentId: 'parent-1' };

        const anotherParentNode: Document = { ...jestMocks.folderDocument, sys_id: 'parent-2', sys_parentId: 'root' };
        const anotherChildNode: Document = { ...jestMocks.fileDocument, sys_id: 'child-3', sys_parentId: 'parent-2' };

        documentService.getFolderChildren.mockReturnValue(
            of({
                limit: 0,
                offset: 0,
                totalCount: 2,
                documents: [childNode1, childNode2],
            })
        );

        service.setDocumentTreeRoot(ROOT_DOCUMENT);

        const parentTreeNode = new DocumentTreeNode(parentNode, 1, true);
        const anotherParentTreeNode = new DocumentTreeNode(anotherParentNode, 1, true);
        service['_data'].push(parentTreeNode, anotherParentTreeNode);
        service['_dataChange'].next(service['_data']);

        service.toggleNode(parentTreeNode, { expand: true });

        service
            .dataChanges()
            .pipe(take(1))
            .subscribe((initialResult) => {
                const childNodes = initialResult.filter((n) => n.document.sys_parentId === parentNode.sys_id);
                expect(childNodes.length).toBe(2);
                expect(childNodes.map((n) => n.document)).toEqual([childNode1, childNode2]);

                documentService.getFolderChildren.mockReturnValue(
                    of({
                        limit: 0,
                        offset: 0,
                        totalCount: 1,
                        documents: [anotherChildNode],
                    })
                );

                service.toggleNode(anotherParentTreeNode, { expand: true });

                service
                    .dataChanges()
                    .pipe(take(1))
                    .subscribe((finalResult) => {
                        const anotherChildNodes = finalResult.filter((n) => n.document.sys_parentId === anotherParentNode.sys_id);
                        expect(anotherChildNodes.length).toBe(1);
                        expect(anotherChildNodes[0].document).toEqual(anotherChildNode);
                        done();
                    });
            });
    });
});
