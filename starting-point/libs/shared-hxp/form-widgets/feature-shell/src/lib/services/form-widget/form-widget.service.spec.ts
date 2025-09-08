/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FormFieldModel, FormModel, ViewUtilService } from '@alfresco/adf-core';
import { FormWidgetService, ContentReference } from './form-widget.service';
import { TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { BlobDownloadService, DEFAULT_RENDITION_ID, DOCUMENT_SERVICE, RenditionsService } from '@alfresco/adf-hx-content-services/services';
import { DOCUMENT_DOWNLOAD_DATA_MOCK, DOCUMENT_MOCK, DOCUMENT_WITH_NO_BLOB_MOCK } from '../../mocks/document.mock';
import { of } from 'rxjs';

describe('FormWidgetService', () => {
    let service: FormWidgetService;
    let field: FormFieldModel;
    let renditionService: RenditionsService;

    const fileId = 'fakeFileId';
    const filePath = '/fake/file/path';
    const fileReference: ContentReference = { type: 'id', reference: fileId };
    const pathReference: ContentReference = { type: 'path', reference: filePath };
    const contentObject = { sys_id: fileId, sys_path: filePath };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockProvider(DOCUMENT_SERVICE, {
                    getDocumentById: (documentId: string) => {
                        return documentId === DOCUMENT_MOCK.sys_id
                            ? of({ ...DOCUMENT_MOCK, sys_id: documentId })
                            : of({ ...DOCUMENT_WITH_NO_BLOB_MOCK, sys_id: documentId });
                    },
                    getDocumentByPath: (path: string) => {
                        return path === DOCUMENT_MOCK.sys_path ? of(DOCUMENT_MOCK) : of(DOCUMENT_WITH_NO_BLOB_MOCK);
                    },
                }),
                MockProvider(BlobDownloadService, {
                    downloadBlob: () => {
                        return of(DOCUMENT_DOWNLOAD_DATA_MOCK.blob);
                    },
                }),
                MockProvider(ViewUtilService, {
                    getViewerTypeByMimeType: (mimetype: string): string => {
                        return mimetype === DOCUMENT_MOCK.sysfile_blob.mimeType ? DOCUMENT_MOCK.sysfile_blob.mimeType : 'unknown';
                    },
                }),
                MockProvider(RenditionsService),
                FormWidgetService,
            ],
        });
        service = TestBed.inject(FormWidgetService);
        renditionService = TestBed.inject(RenditionsService);
        field = new FormFieldModel(new FormModel(), {
            id: 'fakeField',
            value: null,
            params: { multiple: true, menuOptions: { show: true, download: true, remove: true } },
        });
    });

    describe('getContentReferenceFromField', () => {
        it('should return null reference when field is null', () => {
            expect(service.getContentReferenceFromField(field)).toEqual({ type: 'id' });
        });

        it('should get id reference from field when field contains one file with sys_id', () => {
            field.value = contentObject;
            expect(service.getContentReferenceFromField(field)).toEqual(fileReference);
        });

        it('should get id reference id from field when field contains multiple files with sys_id', () => {
            field.value = [contentObject];
            expect(service.getContentReferenceFromField(field)).toEqual(fileReference);
        });

        it('should get path reference from field when field contains one file with sys_path', () => {
            field.value = { ...contentObject, sys_id: undefined };
            expect(service.getContentReferenceFromField(field)).toEqual(pathReference);
        });

        it('should get path reference id from field when field contains multiple files with sys_path', () => {
            field.value = [{ ...contentObject, sys_id: undefined }];
            expect(service.getContentReferenceFromField(field)).toEqual(pathReference);
        });

        it('should get id reference from field when field contains one file with id based uri', () => {
            field.value = { ...contentObject, uri: 'hxpr:/' + fileId };
            expect(service.getContentReferenceFromField(field)).toEqual(fileReference);
        });

        it('should get id reference from field when field contains multiple files with id based uris', () => {
            field.value = [{ ...contentObject, uri: 'hxpr:/' + fileId }];
            expect(service.getContentReferenceFromField(field)).toEqual(fileReference);
        });

        it('should get path reference from field when field contains one file with path based uri', () => {
            field.value = { ...contentObject, uri: 'hxpr:/path' + filePath };
            expect(service.getContentReferenceFromField(field)).toEqual(pathReference);
        });

        it('should get path reference from field when field contains multiple files with path based uris', () => {
            field.value = [{ ...contentObject, uri: 'hxpr:/path' + filePath }];
            expect(service.getContentReferenceFromField(field)).toEqual(pathReference);
        });
    });

    describe('getContentReferencesFromField', () => {
        it('should get empty array of references when field value is null', () => {
            expect(service.getContentReferencesFromField(field)).toEqual([]);
        });

        it('should get array with just one reference when field contains one file', () => {
            field.value = contentObject;
            expect(service.getContentReferencesFromField(field)).toEqual([fileReference]);
        });

        it('should get array of references when field contains multiple files', () => {
            field.value = [
                null,
                {},
                contentObject,
                { ...contentObject, sys_id: undefined },
                { ...contentObject, uri: 'hxpr:/' + fileId },
                { ...contentObject, uri: 'hxpr:/path' + filePath },
            ];
            expect(service.getContentReferencesFromField(field)).toEqual([
                { type: 'id' },
                { type: 'id' },
                fileReference,
                pathReference,
                fileReference,
                pathReference,
            ]);
        });
    });

    describe('getDocumentFromField', () => {
        it('should return null when field value is null', async () => {
            const document = await service.getDocumentFromField(field).toPromise();
            expect(document).toBeNull();
        });

        it('should get document by path when is a path content reference', async () => {
            const documentServiceSpy = spyOn(TestBed.inject(DOCUMENT_SERVICE), 'getDocumentByPath').and.callThrough();
            field.value = { ...contentObject, uri: 'hxpr:/path' + DOCUMENT_MOCK.sys_path };

            const document = await service.getDocumentFromField(field).toPromise();
            expect(document).toEqual(DOCUMENT_MOCK);
            expect(documentServiceSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_path as string);
        });

        it('should get document by id when is a path content reference', async () => {
            const documentServiceSpy = spyOn(TestBed.inject(DOCUMENT_SERVICE), 'getDocumentById').and.callThrough();
            field.value = { ...contentObject, uri: 'hxpr:/' + DOCUMENT_MOCK.sys_id };

            const document = await service.getDocumentFromField(field).toPromise();
            expect(document).toEqual(DOCUMENT_MOCK);
            expect(documentServiceSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_id as string);
        });
    });

    describe('getDocumentsFromField', () => {
        it('should return empty array when field value is null', async () => {
            const document = await service.getDocumentsFromField(field).toPromise();
            expect(document).toEqual([]);
        });

        it('should get documents by path and id when field value contains references', async () => {
            const documentByPathServiceSpy = spyOn(TestBed.inject(DOCUMENT_SERVICE), 'getDocumentByPath').and.callThrough();
            const documentByIdServiceSpy = spyOn(TestBed.inject(DOCUMENT_SERVICE), 'getDocumentById').and.callThrough();
            field.value = [
                null,
                {},
                { sys_id: DOCUMENT_MOCK.sys_id },
                { sys_path: DOCUMENT_MOCK.sys_path },
                { ...contentObject, uri: 'hxpr:/' + DOCUMENT_MOCK.sys_id },
                { ...contentObject, uri: 'hxpr:/path' + DOCUMENT_MOCK.sys_path },
            ];

            const document = await service.getDocumentsFromField(field).toPromise();
            expect(document).toEqual([DOCUMENT_MOCK, DOCUMENT_MOCK, DOCUMENT_MOCK, DOCUMENT_MOCK]);
            expect(documentByPathServiceSpy).toHaveBeenCalledTimes(2);
            expect(documentByPathServiceSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_path as string);
            expect(documentByIdServiceSpy).toHaveBeenCalledTimes(2);
            expect(documentByIdServiceSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_id as string);
        });
    });

    describe('getViewerContentFromDocument', () => {
        it('should return null when document is null', async () => {
            const viewerContent = await service.getViewerContentFromDocument(null).toPromise();
            expect(viewerContent).toBeNull();
        });

        it('should return null when document has no sys_id null', async () => {
            const viewerContent = await service.getViewerContentFromDocument({ ...DOCUMENT_MOCK, sys_id: undefined }).toPromise();
            expect(viewerContent).toBeNull();
        });

        it('should download current document blob when document mimetype is supported', async () => {
            const blobDownloadServiceSpy = spyOn(TestBed.inject(BlobDownloadService), 'downloadBlob').and.callThrough();
            const viewerContent = await service.getViewerContentFromDocument(DOCUMENT_MOCK).toPromise();
            expect(viewerContent).toEqual({ ...DOCUMENT_DOWNLOAD_DATA_MOCK, mimeType: DOCUMENT_MOCK.sysfile_blob.mimeType });
            expect(blobDownloadServiceSpy).toHaveBeenCalledWith(DOCUMENT_MOCK.sys_id as string);
        });

        it('should request the rendition creation when document mimetype is not supported and rendition does not exist', async () => {
            const document = { ...DOCUMENT_MOCK, sysfile_blob: { ...DOCUMENT_MOCK.sysfile_blob, mimeType: 'unsupported' } };

            const blobDownloadServiceSpy = spyOn(TestBed.inject(BlobDownloadService), 'downloadBlob').and.callThrough();
            const listRenditionsSpy = spyOn(renditionService, 'listRenditions').and.returnValue(of([]));
            const requestRenditionCreationSpy = spyOn(renditionService, 'requestRenditionCreation').and.returnValue(
                of({ ...DOCUMENT_MOCK, sys_id: 'renditionId', sysrendition_sourceDoc: document.sys_id })
            );
            const getRenditionSpy = spyOn(renditionService, 'getRendition').and.returnValue(
                of({ ...DOCUMENT_MOCK, sys_id: 'renditionId', sysrendition_status: 'COMPLETED', sysrendition_blob: DOCUMENT_MOCK.sysfile_blob })
            );

            const viewerContent = await service.getViewerContentFromDocument(document).toPromise();

            expect(viewerContent).toEqual({ ...DOCUMENT_DOWNLOAD_DATA_MOCK, mimeType: 'unsupported' });
            expect(blobDownloadServiceSpy).toHaveBeenCalledWith('renditionId', 'sysrendition_blob');
            expect(listRenditionsSpy).toHaveBeenCalledWith(document.sys_id as string);
            expect(requestRenditionCreationSpy).toHaveBeenCalledWith(document.sys_id as string, DEFAULT_RENDITION_ID);
            expect(getRenditionSpy).toHaveBeenCalledWith(document.sys_id as string, DEFAULT_RENDITION_ID);
        });

        it('should not request the rendition creation when document mimetype is not supported but rendition exists', async () => {
            const document = { ...DOCUMENT_MOCK, sysfile_blob: { ...DOCUMENT_MOCK.sysfile_blob, mimeType: 'unsupported' } };

            const blobDownloadServiceSpy = spyOn(TestBed.inject(BlobDownloadService), 'downloadBlob').and.callThrough();
            const listRenditionsSpy = spyOn(renditionService, 'listRenditions').and.returnValue(of([{ ...DOCUMENT_MOCK }]));
            const requestRenditionCreationSpy = spyOn(renditionService, 'requestRenditionCreation');
            const getRenditionSpy = spyOn(renditionService, 'getRendition').and.returnValue(
                of({ ...DOCUMENT_MOCK, sys_id: 'renditionId', sysrendition_status: 'COMPLETED', sysrendition_blob: DOCUMENT_MOCK.sysfile_blob })
            );

            const viewerContent = await service.getViewerContentFromDocument(document).toPromise();

            expect(viewerContent).toEqual({ ...DOCUMENT_DOWNLOAD_DATA_MOCK, mimeType: 'unsupported' });
            expect(blobDownloadServiceSpy).toHaveBeenCalledWith('renditionId', 'sysrendition_blob');
            expect(listRenditionsSpy).toHaveBeenCalledWith(document.sys_id as string);
            expect(requestRenditionCreationSpy).not.toHaveBeenCalled();
            expect(getRenditionSpy).toHaveBeenCalledWith(document.sys_id as string, DEFAULT_RENDITION_ID);
        });
    });
});
