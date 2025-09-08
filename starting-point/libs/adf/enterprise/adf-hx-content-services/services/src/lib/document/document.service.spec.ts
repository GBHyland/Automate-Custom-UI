/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ROOT_DOCUMENT,
    checkInApiProvider,
    copyApiProvider,
    documentApiProvider,
    mockHxcsJsClientConfigurationService,
    moveApiProvider,
    queryApiProvider,
    versionApiProvider,
} from '@alfresco/adf-hx-content-services/api';
import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { generateMockResponse, jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { combineLatest, firstValueFrom, from, of, tap } from 'rxjs';
import { DocumentFetchResults } from './document.models';
import { DocumentService } from './document.service';
import { SingleItemCopyService } from '../single-item-copy/single-item-copy.service';
import { SingleItemMoveService } from '../single-item-move/single-item-move.service';

@Injectable()
export class MockDocumentService extends DocumentService {
    documentApiSpies = {
        getDocumentById: jest.spyOn(this.documentApi, 'getDocumentById').mockReturnValue(generateMockResponse({ data: jestMocks.fileDocument })),
        getDocumentByPath: jest
            .spyOn(this.documentApi, 'getDocumentByPath')
            .mockReturnValue(generateMockResponse({ data: jestMocks.folderDocument })),
        getDocumentAncestors: jest.spyOn(this.documentApi, 'getDocumentAncestors').mockImplementation((docId) =>
            generateMockResponse({
                data: docId === ROOT_DOCUMENT.sys_id ? {} : { ancestors: jestMocks.nestedDocumentAncestors },
            })
        ),
        getDocumentsByNamedQuery: jest.spyOn(this.queryApi, 'getDocumentsByNamedQuery').mockReturnValue(
            generateMockResponse({
                data: { documents: [jestMocks.fileDocument, jestMocks.folderDocument] },
            })
        ),
        createDocumentUnderParentById: jest.spyOn(this.documentApi, 'createDocumentUnderParentById').mockReturnValue(
            generateMockResponse({
                data: {
                    ...jestMocks.fileDocument,
                    sys_title: 'New Document',
                    sys_description: 'New Document description',
                },
            })
        ),
        deleteDocumentById: jest.spyOn(this.documentApi, 'deleteDocumentById').mockReturnValue(generateMockResponse({})),
        updateDocumentById: jest.spyOn(this.documentApi, 'updateDocumentById').mockReturnValue(
            generateMockResponse({
                data: {
                    ...jestMocks.fileDocument,
                    sys_description: 'English document',
                },
            })
        ),
        checkin: jest.spyOn(this.createDocumentVersionService, 'checkin').mockReturnValue(
            from(generateMockResponse({ document: jestMocks.fileDocument })).pipe(
                tap((response) => {
                    this.documentUpdatedSubject.next({ document: response, updatedProperties: new Map() });
                })
            )
        ),

        restoreVersion: jest.spyOn(this.restoreDocumentVersionService, 'restore').mockReturnValue(
            from(generateMockResponse(jestMocks.fileDocument)).pipe(
                tap((response) => {
                    this.documentRestoredSubject.next(response);
                })
            )
        ),
    };
}

describe('Document Service', () => {
    let documentService: DocumentService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: DocumentService, useClass: MockDocumentService },
                mockHxcsJsClientConfigurationService,
                documentApiProvider,
                queryApiProvider,
                copyApiProvider,
                moveApiProvider,
                checkInApiProvider,
                versionApiProvider,
                {
                    provide: SingleItemCopyService,
                    useValue: {
                        copy: jest.fn().mockReturnValue(
                            of({
                                document: {
                                    ...jestMocks.fileDocument,
                                    sys_id: 'a-new-id',
                                    sys_name: 'Copy of document',
                                    sys_parentId: jestMocks.folderDocument.sys_id,
                                },
                                status: 'SUCCESS',
                            })
                        ),
                    },
                },
                {
                    provide: SingleItemMoveService,
                    useValue: {
                        move: jest.fn().mockReturnValue(
                            of({
                                document: {
                                    ...jestMocks.fileDocument,
                                    sys_parentId: jestMocks.folderDocument.sys_id,
                                },
                                status: 'SUCCESS',
                            })
                        ),
                    },
                },
            ],
        });

        documentService = TestBed.inject(DocumentService);
    });

    it('should get document by id', (done) => {
        documentService.getDocumentById(jestMocks.fileDocument.sys_id).subscribe((doc) => {
            expect(doc.sys_id).toEqual(jestMocks.fileDocument.sys_id);
            expect((documentService as MockDocumentService).documentApiSpies.getDocumentById).toHaveBeenCalled();
            done();
        });
    });

    it('should get document by path', (done) => {
        documentService.getDocumentByPath(jestMocks.folderDocument.sys_id).subscribe((doc) => {
            expect(doc.sys_id).toEqual(jestMocks.folderDocument.sys_id);
            expect((documentService as MockDocumentService).documentApiSpies.getDocumentByPath).toHaveBeenCalled();
            done();
        });
    });

    it('should get document ancestors', (done) => {
        documentService.getAncestors(jestMocks.nestedDocument.sys_id).subscribe((docs) => {
            expect(docs).toHaveLength(3);
            expect((documentService as MockDocumentService).documentApiSpies.getDocumentAncestors).toHaveBeenCalled();
            done();
        });
    });

    it('should have root as the only ancestor document', (done) => {
        documentService.getAncestors(ROOT_DOCUMENT.sys_id).subscribe((docs) => {
            expect(docs).toHaveLength(1);
            expect(docs[0].sys_id).toBe(ROOT_DOCUMENT.sys_id);
            expect((documentService as MockDocumentService).documentApiSpies.getDocumentAncestors).toHaveBeenCalled();
            done();
        });
    });

    it('should get document children', (done) => {
        documentService.getAllChildren(ROOT_DOCUMENT.sys_id).subscribe((result: DocumentFetchResults) => {
            expect(result.documents).toHaveLength(2);
            expect((documentService as MockDocumentService).documentApiSpies.getDocumentsByNamedQuery).toHaveBeenCalled();
            done();
        });
    });

    it('should create an empty document with title and description at root', (done) => {
        combineLatest([
            documentService.createDocument({
                sys_title: 'New Document',
                sys_description: 'New Document description',
                sys_primaryType: 'SysFile',
            }),
            documentService.documentCreated$,
        ]).subscribe((val) => {
            expect(val).toHaveLength(2);
            const [createdDoc, emittedDoc] = val;
            expect(createdDoc).toEqual(emittedDoc);
            expect(createdDoc['sys_title']).toEqual('New Document');
            expect(createdDoc['sys_description']).toEqual('New Document description');
            expect(createdDoc.sys_parentId).toEqual(ROOT_DOCUMENT.sys_id);
            expect((documentService as MockDocumentService).documentApiSpies.createDocumentUnderParentById).toHaveBeenCalled();
            done();
        });
    });

    it('should delete a document', (done) => {
        combineLatest([documentService.deleteDocument(jestMocks.fileDocument.sys_id), documentService.documentDeleted$]).subscribe((val) => {
            expect(val).toHaveLength(2);
            const [deletedDocId, emittedDocId] = val;
            expect(deletedDocId).toEqual(emittedDocId);
            expect(deletedDocId).toEqual(jestMocks.fileDocument.sys_id);
            expect((documentService as MockDocumentService).documentApiSpies.deleteDocumentById).toHaveBeenCalled();
            done();
        });
    });

    it('should update document by id', async () => {
        const fieldObj = { sys_description: 'English document' };
        const doc = await firstValueFrom(documentService.updateDocument(jestMocks.fileDocument.sys_id, fieldObj));

        expect(doc.sys_id).toEqual(jestMocks.fileDocument.sys_id);
        expect(doc['sys_description']).toEqual('English document');
        expect((documentService as MockDocumentService).documentApiSpies.updateDocumentById).toHaveBeenCalled();
    });

    it('should copy document in a folder by id', async () => {
        const { document, status } = await firstValueFrom(
            documentService.copyDocument(jestMocks.fileDocument.sys_id, 'Copy of document', jestMocks.folderDocument.sys_id)
        );

        expect(status).toEqual('SUCCESS');
        expect(document?.sys_id).toEqual('a-new-id');
        expect(document?.sys_name).toEqual('Copy of document');
        expect(document?.sys_title).toEqual(jestMocks.fileDocument.sys_title);
        expect(document?.sys_parentId).toEqual(jestMocks.folderDocument.sys_id);
    });

    it('should move document in a folder by id', async () => {
        const { document, status } = await firstValueFrom(
            documentService.moveDocument(jestMocks.fileDocument.sys_id, jestMocks.folderDocument.sys_id)
        );

        expect(status).toEqual('SUCCESS');
        expect(document?.sys_name).toEqual(jestMocks.fileDocument.sys_name);
        expect(document?.sys_title).toEqual(jestMocks.fileDocument.sys_title);
        expect(document?.sys_id).toEqual(jestMocks.fileDocument.sys_id);
        expect(document?.sys_parentId).toEqual(jestMocks.folderDocument.sys_id);
    });

    it('should notify of document creation', async () => {
        const creationPromise = firstValueFrom(documentService.documentCreated$);
        documentService.notifyDocumentCreated(jestMocks.fileDocument);
        const doc = await creationPromise;
        expect(doc).toEqual(jestMocks.fileDocument);
    });

    it('should create a new document version', async () => {
        const documentUpdatedSpy = jest.spyOn(documentService['documentUpdatedSubject'], 'next');
        const checkinSpy = jest
            .spyOn(documentService['createDocumentVersionService'], 'checkin')
            .mockReturnValue(from(Promise.resolve(jestMocks.fileDocument)));

        const createDocumentVersion$ = documentService.createDocumentVersion(jestMocks.fileDocument.sys_id).pipe(
            tap(() => {
                expect(checkinSpy).toHaveBeenCalledWith(jestMocks.fileDocument.sys_id, false, documentService['repositoryId']);
            })
        );

        await firstValueFrom(createDocumentVersion$);

        expect(documentUpdatedSpy).toHaveBeenCalledWith({
            document: jestMocks.fileDocument,
            updatedProperties: new Map([['sysver_isCheckedIn', false]]),
        });
    });

    it('should restore version when sys_id is provided', async () => {
        const documentRestoredSpy = jest.spyOn(documentService['documentRestoredSubject'], 'next');
        const restoreVersionSpy = jest
            .spyOn(documentService['restoreDocumentVersionService'], 'restore')
            .mockReturnValue(from(Promise.resolve(jestMocks.fileDocument)));

        const restoreVersion$ = documentService.restoreVersion(jestMocks.fileDocument.sys_id).pipe(
            tap(() => {
                expect(restoreVersionSpy).toHaveBeenCalledWith(jestMocks.fileDocument.sys_id, documentService['repositoryId']);
            })
        );

        await firstValueFrom(restoreVersion$);

        expect(documentRestoredSpy).toHaveBeenCalledWith(jestMocks.fileDocument);
    });
});
