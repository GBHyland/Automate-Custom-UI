/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { IdpDocumentImportService, QueueDocumentUploadResult } from './idp-document-import.service';
import { DocumentService as AdfDocumentService, DocumentCreateProperties } from '@alfresco/adf-hx-content-services/services';
import { fakeAsync, flush, TestBed } from '@angular/core/testing';
import { selectCorrelationId, selectTaskInputData } from '../../store/selectors/screen.selectors';
import { IdpTaskData } from '../../models/screen-models';
import { BehaviorSubject, of, Subject, throwError } from 'rxjs';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { cold } from 'jasmine-marbles';
import { FileModel, HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import {
    selectAcceptedFileExtensions,
    selectAcceptedFileSize,
    selectUploadFolderId,
} from '../../store/selectors/screen-importing-document.selectors';
import { DocumentImportingStatus, ImportingDocument, initialScreenImportingDocumentState } from '../../store/states/importing-document.state';
import { systemActions, userActions } from '../../store/actions/class-verification.actions';
import { DocumentUploadErrorCode, IdpDocumentHxpImportService } from './idp-document-hxp-import.service';
import { FileUploadStatus } from '@alfresco/adf-content-services';
import { IdpDocumentMetadataService } from './idp-document-metadata.service';
import { screenImportingDocumentFeatureSelector } from '../../store/selectors/class-verification-root.selectors';

describe('IdpDocumentHxpImportService', () => {
    let service: IdpDocumentImportService;
    let store: MockStore;
    let adfDocumentServiceMock: jasmine.SpyObj<AdfDocumentService>;
    let hxpUploadServiceMock: jasmine.SpyObj<HxpUploadService>;
    let idpDocumentMetadataServiceMock: jasmine.SpyObj<IdpDocumentMetadataService>;
    let ogConsoleError: any;

    const fileUploadStartingSubject = new Subject<any>();
    const fileUploadCancelledSubject = new Subject<any>();
    const fileUploadProgressSubject = new Subject<any>();
    const fileUploadAbortedSubject = new Subject<any>();
    const fileUploadErrorSubject = new Subject<any>();
    const fileUploadCompleteSubject = new Subject<any>();
    const fileUploadDeletedSubject = new Subject<any>();
    const fileUploadSuccessSubject = new Subject<any>();

    beforeAll(() => {
        ogConsoleError = console.error;
        console.error = () => {};
    });

    afterAll(() => {
        console.error = ogConsoleError;
    });

    beforeEach(() => {
        adfDocumentServiceMock = jasmine.createSpyObj<AdfDocumentService>('AdfDocumentService', [
            'setCurrentRepository',
            'getDocumentById',
            'getDocumentByPath',
            'createDocument',
        ]);

        hxpUploadServiceMock = jasmine.createSpyObj<HxpUploadService>(
            'HxpUploadService',
            ['addToQueue', 'uploadFilesInTheQueue', 'getQueue', 'cancelUpload'],
            {
                fileUploadStarting: fileUploadStartingSubject.asObservable(),
                fileUploadCancelled: fileUploadCancelledSubject.asObservable(),
                fileUploadProgress: fileUploadProgressSubject.asObservable(),
                fileUploadAborted: fileUploadAbortedSubject.asObservable(),
                fileUploadError: fileUploadErrorSubject.asObservable(),
                fileUploadComplete: fileUploadCompleteSubject.asObservable(),
                fileUploadDeleted: fileUploadDeletedSubject.asObservable(),
                fileUploadSuccess: fileUploadSuccessSubject.asObservable(),
            }
        );

        idpDocumentMetadataServiceMock = jasmine.createSpyObj<IdpDocumentMetadataService>(
            'IdpDocumentMetadataService',
            ['extractDocumentMetadata$'],
            {
                documentMetadataExtractionError$: new BehaviorSubject<ImportingDocument | undefined>(undefined),
                documentMetadataExtractionSuccess$: new BehaviorSubject<ImportingDocument | undefined>(undefined),
                documentMetadataExtractionCancelled$: new BehaviorSubject<ImportingDocument | undefined>(undefined),
            }
        );

        TestBed.configureTestingModule({
            providers: [
                { provide: IdpDocumentImportService, useClass: IdpDocumentHxpImportService },
                provideMockStore(),
                { provide: AdfDocumentService, useValue: adfDocumentServiceMock },
                { provide: HxpUploadService, useValue: hxpUploadServiceMock },
                { provide: IdpDocumentMetadataService, useValue: idpDocumentMetadataServiceMock },
            ],
        });

        service = TestBed.inject(IdpDocumentImportService);
        store = TestBed.inject(MockStore);

        store.overrideSelector(screenImportingDocumentFeatureSelector, initialScreenImportingDocumentState);
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should return true if document upload target folder exists', fakeAsync(() => {
        const mockTargetFolder = 'mock-folder-1/mock-folder-2';
        store.overrideSelector(selectTaskInputData, { targetFolder: mockTargetFolder } as IdpTaskData);
        store.refreshState();

        const mockTargetFolderId = 'mock-folder-id';
        adfDocumentServiceMock.getDocumentByPath.and.returnValue(of({ sys_id: mockTargetFolderId, sys_isFolderish: true } as Document));

        let result = false;
        service.isDocumentUploadTargetFolderExists$().subscribe((resultFolderExists) => (result = resultFolderExists));

        flush();

        expect(result).toBeTrue();
    }));

    it('should return false if document upload target does not exist', fakeAsync(() => {
        const mockTargetFolder = 'mock-folder-1/mock-folder-2';
        store.overrideSelector(selectTaskInputData, { targetFolder: mockTargetFolder } as IdpTaskData);
        store.refreshState();

        adfDocumentServiceMock.getDocumentByPath.and.callFake(() => {
            return throwError(() => ({ status: 404 }));
        });

        let result = true;
        service.isDocumentUploadTargetFolderExists$().subscribe((resultFolderExists) => (result = resultFolderExists));

        flush();

        expect(result).toBeFalse();
    }));

    it('should throw on is document upload target folder exists when task data is undefined', () => {
        store.overrideSelector(selectTaskInputData, undefined);
        store.refreshState();

        expect(service.isDocumentUploadTargetFolderExists$()).toBeObservable(cold('#', null, jasmine.any(Error)));
    });

    it('should return false if document upload target folder not set', fakeAsync(() => {
        store.overrideSelector(selectTaskInputData, { targetFolder: undefined } as IdpTaskData);
        store.refreshState();

        let result = true;
        service.isDocumentUploadTargetFolderExists$().subscribe((resultFolderExists) => (result = resultFolderExists));

        flush();

        expect(result).toBeFalse();
    }));

    it('should throw on is document upload target folder exists when returned document is not a folder', () => {
        const mockTargetFolder = 'mock-folder-1/mock-folder-2';
        store.overrideSelector(selectTaskInputData, { targetFolder: mockTargetFolder } as IdpTaskData);
        store.refreshState();

        adfDocumentServiceMock.getDocumentByPath.and.returnValue(of({ sys_id: 'mock-folder-id', sys_isFolderish: false } as Document));

        expect(service.isDocumentUploadTargetFolderExists$()).toBeObservable(cold('#', null, jasmine.any(Error)));
    });

    it('should throw on is document upload target folder exists when getDocumentByPath throws an error with status other than 404', () => {
        const mockTargetFolder = '/mock-folder-1/mock-folder-2';
        store.overrideSelector(selectTaskInputData, { targetFolder: mockTargetFolder } as IdpTaskData);
        store.refreshState();

        const mockError = new Error('An error');
        mockError.stack = undefined;
        adfDocumentServiceMock.getDocumentByPath.and.callFake(() => {
            return throwError(() => mockError);
        });

        expect(service.isDocumentUploadTargetFolderExists$()).toBeObservable(cold('#', null, mockError));
    });

    it('should upload documents', fakeAsync(() => {
        store.overrideSelector(selectAcceptedFileExtensions, ['pdf', 'txt', 'tif']);
        store.overrideSelector(selectAcceptedFileSize, 3);
        store.overrideSelector(selectUploadFolderId, 'mock-process-folder-id');

        const file1 = new File(['abc'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['def'], 'file2.pdf', { type: 'application/pdf' });

        let result: QueueDocumentUploadResult = { queued: [], erroneous: [] };
        service.queueDocumentUpload$([file1, file2]).subscribe((documents) => (result = documents));

        flush();

        expect(hxpUploadServiceMock.addToQueue).toHaveBeenCalledTimes(1);
        expect(hxpUploadServiceMock.uploadFilesInTheQueue).toHaveBeenCalledTimes(1);
        expect(result.queued.length).toBe(2);
        expect(result.erroneous.length).toBe(0);
        expect(result.queued[0].fileName).toBe('file1.txt');
        expect(result.queued[1].fileName).toBe('file2.pdf');
    }));

    it('should mark oversize and invalid type files on upload documents', fakeAsync(() => {
        store.overrideSelector(selectAcceptedFileExtensions, ['pdf', 'txt', 'tif']);
        store.overrideSelector(selectAcceptedFileSize, 3);
        store.overrideSelector(selectUploadFolderId, 'mock-process-folder-id');

        const file1 = new File(['abcd'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['def'], 'file2.jpg', { type: 'image/jpeg' });
        const file3 = new File(['ghi'], 'file3', { type: 'image/jpeg' });

        let result: QueueDocumentUploadResult = { queued: [], erroneous: [] };
        service.queueDocumentUpload$([file1, file2, file3]).subscribe((files) => (result = files));

        flush();

        expect(hxpUploadServiceMock.addToQueue).not.toHaveBeenCalled();
        expect(hxpUploadServiceMock.uploadFilesInTheQueue).not.toHaveBeenCalled();
        expect(result.queued.length).toBe(0);
        expect(result.erroneous.length).toBe(3);
        expect(result.erroneous[0].fileName).toBe('file1.txt');
        expect(result.erroneous[0].importingStatus).toBe(DocumentImportingStatus.Error);
        expect(result.erroneous[0].errorCode).toBe(DocumentUploadErrorCode.ExceedsSize);
        expect(result.erroneous[1].fileName).toBe('file2.jpg');
        expect(result.erroneous[1].importingStatus).toBe(DocumentImportingStatus.Error);
        expect(result.erroneous[1].errorCode).toBe(DocumentUploadErrorCode.ProhibitedType);
        expect(result.erroneous[2].fileName).toBe('file3');
        expect(result.erroneous[2].importingStatus).toBe(DocumentImportingStatus.Error);
        expect(result.erroneous[2].errorCode).toBe(DocumentUploadErrorCode.ProhibitedType);
    }));

    it('should dispatch queueDocumentUpload on queueDocumentUpload', () => {
        spyOn(store, 'dispatch');

        const file1 = new File(['abcd'], 'file1.txt', { type: 'text/plain' });
        const file2 = new File(['def'], 'file2.jpg', { type: 'image/jpeg' });
        const files = [file1, file2];

        service.queueDocumentUpload(files);

        expect(store.dispatch).toHaveBeenCalledWith(userActions.queueDocumentUpload({ files }));
    });

    it('should cancel upload', () => {
        spyOn(store, 'dispatch');

        const file1 = new FileModel(new File(['abcd'], 'file1.txt', { type: 'text/plain' }), undefined, 'file1id');
        const file2 = new FileModel(new File(['def'], 'file2.jpg', { type: 'image/jpeg' }), undefined, 'file2id');
        const file3 = new FileModel(new File(['ghi'], 'file3.jpg', { type: 'image/jpeg' }), undefined, 'file3id');
        const files = [file1, file2, file3];

        hxpUploadServiceMock.getQueue.and.returnValue(files);

        service.cancelDocumentUpload(['file1id', 'file2id']);

        expect(hxpUploadServiceMock.cancelUpload).toHaveBeenCalledWith(file1, file2);
    });

    it('should map uploaded document on file upload starting', fakeAsync(() => {
        spyOn(store, 'dispatch');

        let result: ImportingDocument | undefined;
        service.documentUploadProgress$.subscribe((document) => (result = document));

        fileUploadStartingSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                fileName: 'file1.pdf',
                status: FileUploadStatus.Starting,
                fileProperties: { status: FileUploadStatus.Starting },
            })
        );

        flush();

        expect(result).toEqual(createUploadedDocument('file1id', 'file1.pdf', DocumentImportingStatus.Progress));
    }));

    it('should dispatch document upload progress action on file upload starting', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadStartingSubject.next(createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Starting }));

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadProgress({ documentId: 'file1id', progress: 0 }));
    }));

    it('should do nothing on file upload starting when event file id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');
        const spy = jasmine.createSpy('nextSpy');
        service.documentUploadProgress$.subscribe(spy);

        fileUploadStartingSubject.next(createFileUploadEvent({ status: FileUploadStatus.Starting }));

        flush();

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should map uploaded document on file upload progress', fakeAsync(() => {
        spyOn(store, 'dispatch');

        let result: ImportingDocument | undefined;
        service.documentUploadProgress$.subscribe((document) => (result = document));

        fileUploadProgressSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                fileName: 'file1.pdf',
                status: FileUploadStatus.Progress,
                fileProperties: {
                    status: FileUploadStatus.Progress,
                    progress: {
                        loaded: 20,
                        total: 100,
                    },
                },
            })
        );

        flush();

        expect(result).toEqual({ ...createUploadedDocument('file1id', 'file1.pdf', DocumentImportingStatus.Progress), progress: 20 });
    }));

    it('should dispatch document upload progress action on file upload progress', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadProgressSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                status: FileUploadStatus.Progress,
                fileProperties: { progress: { loaded: 50, total: 100, percent: 0 } },
            })
        );

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadProgress({ documentId: 'file1id', progress: 50 }));
    }));

    it('should do nothing on file upload progress when event file id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');
        const spy = jasmine.createSpy('nextSpy');
        service.documentUploadProgress$.subscribe(spy);

        fileUploadProgressSubject.next(createFileUploadEvent({ status: FileUploadStatus.Progress }));

        flush();

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should map uploaded document on file upload complete', fakeAsync(() => {
        spyOn(store, 'dispatch');

        let result: ImportingDocument | undefined;
        service.documentUploadComplete$.subscribe((document) => (result = document));

        fileUploadCompleteSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                fileName: 'file1.pdf',
                status: FileUploadStatus.Complete,
                fileProperties: {
                    status: FileUploadStatus.Complete,
                    progress: {
                        loaded: 100,
                        total: 100,
                    },
                    data: { id: 'file1upload' },
                },
            })
        );

        flush();

        expect(result).toEqual({
            ...createUploadedDocument('file1id', 'file1.pdf', DocumentImportingStatus.Progress, 'file1upload'),
            progress: 70,
        });
    }));

    it('should dispatch document upload complete action on file upload complete', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadCompleteSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                status: FileUploadStatus.Complete,
                eventProperties: {
                    totalComplete: 1,
                    totalAborted: 0,
                },
                fileProperties: { data: { id: 'file1upload' } },
            })
        );

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadComplete({ documentId: 'file1id', fileUploadId: 'file1upload' }));
    }));

    it('should dispatch document upload error action on file upload complete when file upload id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadCompleteSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                status: FileUploadStatus.Complete,
                eventProperties: {
                    totalComplete: 1,
                    totalAborted: 0,
                },
            })
        );

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadError({ documentId: 'file1id' }));
    }));

    it('should do nothing on file upload complete when event file id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');
        const spy = jasmine.createSpy('nextSpy');
        service.documentUploadComplete$.subscribe(spy);

        fileUploadCompleteSubject.next(
            createFileUploadEvent({ status: FileUploadStatus.Complete, eventProperties: { totalComplete: 1, totalAborted: 0 } })
        );

        flush();

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should do nothing on file upload success when file upload id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadSuccessSubject.next({
            uploadedFile: { id: undefined },
            middlewareResults: { sys_id: 'sys1' },
        });

        flush();

        expect(store.dispatch).not.toHaveBeenCalled();
    }));

    it('should do nothing on file upload success when document for file upload id is missing', fakeAsync(() => {
        spyOn(store, 'dispatch');
        spyOn(store, 'select').and.returnValue(of(undefined));

        fileUploadSuccessSubject.next({
            uploadedFile: { id: 'file1upload' },
            middlewareResults: { sys_id: 'sys1' },
        });

        flush();

        expect(store.dispatch).not.toHaveBeenCalled();
    }));

    it('should map uploaded document on file upload error', fakeAsync(() => {
        spyOn(store, 'dispatch');

        let result: ImportingDocument | undefined;
        service.documentUploadError$.subscribe((document) => (result = document));

        fileUploadErrorSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                fileName: 'file1.pdf',
                status: FileUploadStatus.Error,
                fileProperties: {
                    status: FileUploadStatus.Error,
                    progress: {
                        loaded: 50,
                        total: 100,
                    },
                    errorCode: 123,
                },
            })
        );

        flush();

        expect(result).toEqual({
            ...createUploadedDocument('file1id', 'file1.pdf', DocumentImportingStatus.Error),
            progress: 50,
            errorCode: 123,
        });
    }));

    it('should dispatch document upload error action on file upload error', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadErrorSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                status: FileUploadStatus.Error,
                eventProperties: { totalError: 1 },
                fileProperties: { errorCode: 123 },
            })
        );

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadError({ documentId: 'file1id' }));

        fileUploadErrorSubject.next(
            createFileUploadEvent({
                fileId: 'file1id',
                status: FileUploadStatus.Error,
                eventProperties: { totalError: 1 },
            })
        );

        flush();

        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadError({ documentId: 'file1id' }));
    }));

    it('should do nothing on file upload error when event file id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');
        const spy = jasmine.createSpy('nextSpy');
        service.documentUploadError$.subscribe(spy);

        fileUploadErrorSubject.next(createFileUploadEvent({ status: FileUploadStatus.Error, fileProperties: { errorCode: 123 } }));

        flush();

        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should map uploaded document on file upload aborted, cancelled and deleted', fakeAsync(() => {
        spyOn(store, 'dispatch');

        let result: ImportingDocument | undefined;
        service.documentUploadCancelled$.subscribe((document) => (result = document));

        const expected = { ...createUploadedDocument('file1id', 'file', DocumentImportingStatus.Cancelled), progress: 0 };

        fileUploadAbortedSubject.next(
            createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Aborted, fileProperties: { status: FileUploadStatus.Aborted } })
        );
        flush();
        expect(result).toEqual(expected);

        fileUploadCancelledSubject.next(
            createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Cancelled, fileProperties: { status: FileUploadStatus.Cancelled } })
        );
        flush();
        expect(result).toEqual(expected);

        fileUploadDeletedSubject.next(
            createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Deleted, fileProperties: { status: FileUploadStatus.Deleted } })
        );
        flush();
        expect(result).toEqual(expected);
    }));

    it('should dispatch document upload cancelled action on file upload aborted, cancelled and deleted', fakeAsync(() => {
        spyOn(store, 'dispatch');

        fileUploadAbortedSubject.next(createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Aborted }));
        flush();
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadCancelled({ documentIds: ['file1id'] }));

        fileUploadCancelledSubject.next(createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Cancelled }));
        flush();
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadCancelled({ documentIds: ['file1id'] }));

        fileUploadDeletedSubject.next(createFileUploadEvent({ fileId: 'file1id', status: FileUploadStatus.Deleted }));
        flush();
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentUploadCancelled({ documentIds: ['file1id'] }));
    }));

    it('should do nothing on file upload aborted, cancelled and deleted when event file id is empty', fakeAsync(() => {
        spyOn(store, 'dispatch');
        const spy = jasmine.createSpy('nextSpy');
        service.documentUploadCancelled$.subscribe(spy);

        fileUploadAbortedSubject.next(createFileUploadEvent({ status: FileUploadStatus.Aborted }));
        flush();
        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();

        fileUploadCancelledSubject.next(createFileUploadEvent({ status: FileUploadStatus.Cancelled }));
        flush();
        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();

        fileUploadDeletedSubject.next(createFileUploadEvent({ status: FileUploadStatus.Deleted }));
        flush();
        expect(store.dispatch).not.toHaveBeenCalled();
        expect(spy).not.toHaveBeenCalled();
    }));

    it('should create document under process document upload folder', fakeAsync(() => {
        const mockProcessFolderId = 'process-folder';
        store.overrideSelector(selectUploadFolderId, mockProcessFolderId);
        store.refreshState();

        const document: ImportingDocument = {
            id: 'file1id',
            fileUploadId: 'file1upload',
            fileName: 'file1.txt',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
            errorCode: undefined,
        };

        const mockCreatedDocument = { sys_id: 'mock-document-id' } as Document;
        adfDocumentServiceMock.createDocument.and.returnValue(of(mockCreatedDocument));

        const expectedCreatedDocumentProperties: DocumentCreateProperties = {
            sys_name: document.fileName,
            sys_title: document.fileName,
            sys_parentId: mockProcessFolderId,
            sys_primaryType: 'SysFile',
            sysfile_blob: {
                uploadId: document.fileUploadId,
            },
        };

        let result: [string, string] = ['', ''];
        service.createDocumentUnderProcessDocumentUploadFolder$(document).subscribe((resultCreatedDocument) => (result = resultCreatedDocument));

        flush();

        expect(adfDocumentServiceMock.createDocument).toHaveBeenCalledWith(expectedCreatedDocumentProperties);
        expect(adfDocumentServiceMock.createDocument).toHaveBeenCalledTimes(1);
        expect(result[0]).toEqual(mockCreatedDocument.sys_id ?? 'I <3 TypeScript');
        expect(result[1]).toEqual(mockProcessFolderId);
    }));

    it('should get process folder id from api on create document under process document upload folder when store value is empty', fakeAsync(() => {
        store.overrideSelector(selectUploadFolderId, undefined);
        store.refreshState();

        const document: ImportingDocument = {
            id: 'file1id',
            fileUploadId: 'file1upload',
            fileName: 'file1.txt',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
            errorCode: undefined,
        };

        store.overrideSelector(selectCorrelationId, 'correlation-id');
        store.overrideSelector(selectTaskInputData, { targetFolder: '/mock-folder-1/mock-folder-2' } as IdpTaskData);
        store.refreshState();

        const mockProcessFolderId = 'mock-process-folder-id';
        adfDocumentServiceMock.getDocumentByPath.and.returnValues(
            of({ sys_id: 'mock-target-folder-id', sys_isFolderish: true } as Document),
            of({ sys_id: mockProcessFolderId, sys_isFolderish: true } as Document)
        );
        adfDocumentServiceMock.createDocument.and.returnValue(of({ sys_id: 'mock-document-id' } as Document));

        const expectedCreatedDocumentProperties = jasmine.objectContaining({ sys_parentId: mockProcessFolderId });

        let resultProcessFolderId = '';
        service
            .createDocumentUnderProcessDocumentUploadFolder$(document)
            .subscribe((resultCreatedDocument) => (resultProcessFolderId = resultCreatedDocument[1]));

        flush();

        expect(resultProcessFolderId).toEqual(mockProcessFolderId);
        expect(adfDocumentServiceMock.createDocument).toHaveBeenCalledWith(expectedCreatedDocumentProperties);
        expect(adfDocumentServiceMock.createDocument).toHaveBeenCalledTimes(1);
    }));

    it('should create process folder on create document under process document upload folder when it does not exist', fakeAsync(() => {
        store.overrideSelector(selectUploadFolderId, undefined);
        const mockCorrelationId = 'correlation-id';
        store.overrideSelector(selectCorrelationId, mockCorrelationId);
        store.overrideSelector(selectTaskInputData, { targetFolder: '/mock-folder-1/mock-folder-2' } as IdpTaskData);
        store.refreshState();

        const mockTargetFolderId = 'mock-target-folder-id';
        adfDocumentServiceMock.getDocumentByPath.and.returnValues(
            of({ sys_id: mockTargetFolderId, sys_isFolderish: true } as Document),
            throwError(() => ({ status: 404 } as any))
        );
        adfDocumentServiceMock.createDocument.and.returnValues(
            of({ sys_id: 'mock-process-folder-id' } as Document),
            of({ sys_id: 'mock-document-id' } as Document)
        );

        service
            .createDocumentUnderProcessDocumentUploadFolder$({ fileUploadId: 'file1upload', fileName: 'file1.txt' } as ImportingDocument)
            .subscribe({});
        flush();

        const expectedProcessFolderProperties: DocumentCreateProperties = {
            sys_primaryType: 'SysFolder',
            sys_name: mockCorrelationId,
            sys_parentId: mockTargetFolderId,
        };
        expect(adfDocumentServiceMock.createDocument).toHaveBeenCalledWith(expectedProcessFolderProperties);
        expect(adfDocumentServiceMock.createDocument).toHaveBeenCalledTimes(2);
    }));

    it('should throw on create document under process document upload folder when task data is undefined', () => {
        store.overrideSelector(selectUploadFolderId, undefined);
        store.overrideSelector(selectCorrelationId, 'correlation-id');
        store.overrideSelector(selectTaskInputData, undefined);
        store.refreshState();

        expect(service.createDocumentUnderProcessDocumentUploadFolder$({} as ImportingDocument)).toBeObservable(cold('#', null, jasmine.any(Error)));
    });

    it('should throw on create document under process document upload folder when task data target folder is undefined', () => {
        store.overrideSelector(selectUploadFolderId, undefined);
        store.overrideSelector(selectCorrelationId, 'correlation-id');
        store.overrideSelector(selectTaskInputData, { targetFolder: undefined } as IdpTaskData);
        store.refreshState();

        expect(service.createDocumentUnderProcessDocumentUploadFolder$({} as ImportingDocument)).toBeObservable(cold('#', null, jasmine.any(Error)));
    });

    it('should throw on create document under process document upload folder when task data target folder is empty', () => {
        store.overrideSelector(selectUploadFolderId, undefined);
        store.overrideSelector(selectCorrelationId, 'correlation-id');
        store.overrideSelector(selectTaskInputData, { targetFolder: '' } as IdpTaskData);
        store.refreshState();

        expect(service.createDocumentUnderProcessDocumentUploadFolder$({} as ImportingDocument)).toBeObservable(cold('#', null, jasmine.any(Error)));
    });

    it('should throw on create document under process document upload folder when get process folder throws an error other than 404', () => {
        store.overrideSelector(selectUploadFolderId, undefined);
        const mockCorrelationId = 'correlation-id';
        store.overrideSelector(selectCorrelationId, mockCorrelationId);
        store.overrideSelector(selectTaskInputData, { targetFolder: '/mock-folder-1/mock-folder-2' } as IdpTaskData);
        store.refreshState();

        const mockTargetFolderId = 'mock-target-folder-id';
        const mockError = new Error('An error');
        adfDocumentServiceMock.getDocumentByPath.and.returnValues(
            of({ sys_id: mockTargetFolderId, sys_isFolderish: true } as Document),
            throwError(() => mockError)
        );
        adfDocumentServiceMock.createDocument.and.returnValues(
            of({ sys_id: 'mock-process-folder-id' } as Document),
            of({ sys_id: 'mock-document-id' } as Document)
        );

        expect(service.createDocumentUnderProcessDocumentUploadFolder$({} as ImportingDocument)).toBeObservable(cold('#', null, mockError));
    });

    it('should throw on create document under process document upload folder when created document id is empty', () => {
        const mockProcessFolderId = 'process-folder';
        store.overrideSelector(selectUploadFolderId, mockProcessFolderId);
        store.refreshState();

        const document: ImportingDocument = {
            id: 'file1id',
            fileUploadId: 'file1upload',
            fileName: 'file1.txt',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
            errorCode: undefined,
        };

        const mockCreatedDocument = { sys_id: undefined } as Document;
        adfDocumentServiceMock.createDocument.and.returnValue(of(mockCreatedDocument));

        expect(service.createDocumentUnderProcessDocumentUploadFolder$(document)).toBeObservable(cold('#', null, jasmine.any(Error)));
    });

    function createFileUploadEvent({
        fileId,
        status,
        eventProperties: properties,
        fileName,
        fileProperties,
    }: {
        fileId?: string;
        status: FileUploadStatus;
        eventProperties?: any;
        fileName?: string;
        fileProperties?: any;
    }): any {
        return {
            file: Object.assign(new FileModel(new File(['abc'], fileName ?? 'file'), undefined, fileId), fileProperties),
            status: status,
            error: null,
            ...properties,
        };
    }

    function createUploadedDocument(fileId: string, fileName: string, status: DocumentImportingStatus, fileUploadId?: string): ImportingDocument {
        return {
            id: fileId,
            fileUploadId,
            fileName,
            importingStatus: status,
            progress: 0,
            errorCode: undefined,
        };
    }
});
