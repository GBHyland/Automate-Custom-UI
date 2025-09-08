/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { TestBed } from '@angular/core/testing';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { of, Subject, throwError } from 'rxjs';
import { DocumentCacheService } from './document-cache.service';
import { DocumentService } from '../document.service';

describe('DocumentCacheService', () => {
    let service: DocumentCacheService;
    const documentServiceSpy = {
        getDocumentById: jest.fn(),
        documentUpdated$: new Subject<{ document: Document }>(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocumentCacheService, { provide: DocumentService, useValue: documentServiceSpy }],
        });
        service = TestBed.inject(DocumentCacheService);
    });

    describe('getDocument', () => {
        it('should return cached document if available', (done) => {
            const dummyDocument: Document = jestMocks.fileDocument;
            const sysId = 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af83';
            service.getDocumentCache().set(sysId, of(dummyDocument));

            const getDocumentByIdSpy = jest.spyOn(documentServiceSpy, 'getDocumentById');

            const result = service.getDocument(sysId);

            result.subscribe((emittedDocument) => {
                expect(emittedDocument).toEqual(dummyDocument);
                expect(getDocumentByIdSpy).not.toHaveBeenCalled();
                done();
            });
        });

        it('should fetch document if not cached', (done) => {
            const dummyDocument: Document = jestMocks.fileDocument;
            const sysId = 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af83';

            const getDocumentByIdSpy = jest.spyOn(documentServiceSpy, 'getDocumentById').mockReturnValue(of(dummyDocument));

            const result = service.getDocument(sysId);

            result.subscribe((emittedDocument) => {
                expect(emittedDocument).toEqual(dummyDocument);
                expect(getDocumentByIdSpy).toHaveBeenCalledWith(sysId);
                done();
            });
        });

        it('should throw an error if could not fetch the parent document', (done) => {
            const errorMock = { response: { status: 403 } };
            documentServiceSpy.getDocumentById.mockReturnValueOnce(throwError(errorMock));

            service.getDocument(ROOT_DOCUMENT.sys_id).subscribe({
                error: (error) => {
                    expect(error).toEqual(errorMock);
                    done();
                },
            });
        });

        it('should invalidate cached document on document update', (done) => {
            const sysId = 'e43b6a72-f7a7-4f5a-8cd1-a3b84cc6af83';
            const initialDocument: Document = jestMocks.fileDocument;
            const updatedDocument: Document = jestMocks.fileDocument;
            service.getDocumentCache().set(sysId, of(initialDocument));

            const invalidateSpy = spyOn(service, 'invalidate').and.callThrough();

            documentServiceSpy.documentUpdated$.subscribe(() => {
                expect(invalidateSpy).toHaveBeenCalledWith(sysId);
                done();
            });

            documentServiceSpy.documentUpdated$.next({ document: updatedDocument });
        });
    });
});
