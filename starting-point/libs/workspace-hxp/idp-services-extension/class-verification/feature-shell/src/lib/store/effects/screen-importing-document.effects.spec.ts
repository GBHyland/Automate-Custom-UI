/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { IdpFileMetadata, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { provideMockActions } from '@ngrx/effects/testing';
import { hot, cold, getTestScheduler } from 'jasmine-marbles';
import { Observable, of } from 'rxjs';
import { IdpTaskData } from '../../models/screen-models';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { ScreenImportingDocumentEffects } from './screen-importing-document.effects';
import { IdpDocumentImportService } from '../../services/document-import/idp-document-import.service';
import { IdpDocumentImportDialogService } from '../../services/document-import/idp-document-import-dialog.service';
import { DocumentImportingStatus } from '../states/importing-document.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslateService } from '@ngx-translate/core';
import { selectAcceptedFileSize } from '../selectors/screen-importing-document.selectors';
import { DocumentUploadErrorCode } from '../../services/document-import/idp-document-hxp-import.service';
import { IdpDocumentMetadataService } from '../../services/document-import/idp-document-metadata.service';

describe('Screen Uploaded Document Effects', () => {
    let actions$: Observable<any>;
    let effects: ScreenImportingDocumentEffects;
    let store: MockStore;
    let translateServiceSpy: jasmine.SpyObj<TranslateService>;
    let documentImportServiceSpy: jasmine.SpyObj<IdpDocumentImportService>;
    let documentUploadDialogServiceSpy: jasmine.SpyObj<IdpDocumentImportDialogService>;
    let idpDocumentMetadataServiceSpy: jasmine.SpyObj<IdpDocumentMetadataService>;

    beforeEach(() => {
        translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', ['instant']);

        documentImportServiceSpy = jasmine.createSpyObj<IdpDocumentImportService>('IdpDocumentImportService', [
            'isDocumentUploadTargetFolderExists$',
            'createDocumentUnderProcessDocumentUploadFolder$',
            'queueDocumentUpload$',
            'cancelDocumentUpload',
        ]);

        documentUploadDialogServiceSpy = jasmine.createSpyObj<IdpDocumentImportDialogService>('IdpDocumentImportDialogService', [
            'queueDocumentUpload',
        ]);

        idpDocumentMetadataServiceSpy = jasmine.createSpyObj<IdpDocumentMetadataService>('IdpDocumentMetadataService', ['extractDocumentMetadata$']);

        TestBed.configureTestingModule({
            providers: [
                ScreenImportingDocumentEffects,
                provideMockActions(() => actions$),
                provideMockStore(),
                { provide: TranslateService, useValue: translateServiceSpy },
                { provide: IdpDocumentImportService, useValue: documentImportServiceSpy },
                { provide: IdpDocumentImportDialogService, useValue: documentUploadDialogServiceSpy },
                { provide: IdpDocumentMetadataService, useValue: idpDocumentMetadataServiceSpy },
            ],
        });

        effects = TestBed.inject(ScreenImportingDocumentEffects);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        store.resetSelectors();
    });

    it('should dispatch load document upload on load screen success', () => {
        const taskData: IdpTaskData = {
            targetFolder: '/mock-target-folder',
            configuration: {},
        } as unknown as IdpTaskData;

        const action = systemActions.screenLoadSuccess({ taskData, taskContext: {} as TaskContext });
        const outcome = systemActions.screenLoadDocumentUpload({ taskData });

        actions$ = hot('a', { a: action });
        const expected = cold('b', { b: outcome });

        expect(effects.onLoadScreenSuccessLoadDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should load document upload', () => {
        documentImportServiceSpy.isDocumentUploadTargetFolderExists$.and.returnValue(cold('a', { a: true }));

        const action = systemActions.screenLoadDocumentUpload({ taskData: { targetFolder: '/mock-target-folder' } as IdpTaskData });
        const outcome = systemActions.screenLoadDocumentUploadSuccess({ enabled: true });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should load document upload as disabled when targetFolder is not set', () => {
        const action = systemActions.screenLoadDocumentUpload({ taskData: {} as IdpTaskData });
        const outcome = systemActions.screenLoadDocumentUploadSuccess({ enabled: false });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should dispatch error on load document upload when isDocumentUploadTargetFolderExists$ returns false', () => {
        documentImportServiceSpy.isDocumentUploadTargetFolderExists$.and.returnValue(cold('a', { a: false }));

        const action = systemActions.screenLoadDocumentUpload({ taskData: { targetFolder: '/mock-target-folder' } as IdpTaskData });
        const outcome = systemActions.screenLoadDocumentUploadError({ message: jasmine.any(String) as any });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should dispatch error on load document upload when isDocumentUploadTargetFolderExists$ throws an error', () => {
        documentImportServiceSpy.isDocumentUploadTargetFolderExists$.and.returnValue(cold('#', undefined, new Error('Error')));

        const action = systemActions.screenLoadDocumentUpload({ taskData: { targetFolder: '/mock-target-folder' } as IdpTaskData });
        const outcome = systemActions.screenLoadDocumentUploadError({});

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should show notification on load document error', () => {
        const action = systemActions.screenLoadDocumentUploadError({});
        const outcome = systemActions.notificationShow({ severity: 'error', message: jasmine.any(String) as any });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentUploadErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should dispatch action success on queue upload documents when all documents are valid', () => {
        const files: File[] = [new File(['abc'], 'file1.txt', { type: 'text/plain' }), new File(['def'], 'file2.txt', { type: 'text/plain' })];
        const documents = files.map((file, index) => ({
            id: `file${index}id`,
            fileName: file.name,
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        }));
        documentImportServiceSpy.queueDocumentUpload$.and.returnValue(cold('a', { a: { queued: documents, erroneous: [] } }));

        const action = userActions.queueDocumentUpload({ files });
        const outcome = systemActions.queueDocumentUploadSuccess({ documents });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.queueDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should dispatch action error on queue upload documents when all documents are erroneous', () => {
        const files: File[] = [new File(['abc'], 'file1.txt', { type: 'text/plain' }), new File(['def'], 'file2.txt', { type: 'text/plain' })];
        const documents = files.map((file, index) => ({
            id: `file${index}id`,
            fileName: file.name,
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        }));
        documentImportServiceSpy.queueDocumentUpload$.and.returnValue(cold('a', { a: { queued: [], erroneous: documents } }));

        const action = userActions.queueDocumentUpload({ files });
        const outcome = systemActions.queueDocumentUploadError({ documents });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.queueDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should dispatch both action success and error on upload documents when some documents are valid and some erroneous', () => {
        const files: File[] = [new File(['abc'], 'file1.txt', { type: 'text/plain' }), new File(['def'], 'file2.txt', { type: 'text/plain' })];
        const documents = files.map((file, index) => ({
            id: `file${index}id`,
            fileName: file.name,
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        }));
        documentImportServiceSpy.queueDocumentUpload$.and.returnValue(cold('a', { a: { queued: [documents[0]], erroneous: [documents[1]] } }));

        const action = userActions.queueDocumentUpload({ files });
        const outcome1 = systemActions.queueDocumentUploadError({ documents: [documents[1]] });
        const outcome2 = systemActions.queueDocumentUploadSuccess({ documents: [documents[1], documents[0]] });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-(bc)-', { b: outcome1, c: outcome2 });

        expect(effects.queueDocumentUploadEffect$).toBeObservable(expected);
    });

    it('should open document upload progress dialog on document upload success', () => {
        const documents = [
            {
                id: `file1id`,
                fileName: 'file1.pdf',
                importingStatus: DocumentImportingStatus.Pending,
                progress: 0,
            },
            {
                id: `file2id`,
                fileName: 'file2.txt',
                importingStatus: DocumentImportingStatus.Error,
                progress: 0,
            },
        ];

        const action = systemActions.queueDocumentUploadSuccess({ documents });

        actions$ = hot('-a-', { a: action });
        effects.queueDocumentUploadSuccessOpenProgressDialogEffect$.subscribe(() => {});

        getTestScheduler().flush();

        expect(documentUploadDialogServiceSpy.queueDocumentUpload).toHaveBeenCalledWith(documents);
    });

    it('should show notification on queue document upload error', () => {
        const documents = [
            {
                id: `file1id`,
                fileName: 'file1.txt',
                importingStatus: DocumentImportingStatus.Error,
                progress: 0,
                uploadingErrorCode: DocumentUploadErrorCode.ProhibitedType,
            },
            {
                id: `file2id`,
                fileName: 'file2.pdf',
                importingStatus: DocumentImportingStatus.Error,
                progress: 0,
                uploadingErrorCode: DocumentUploadErrorCode.ExceedsSize,
            },
            {
                id: `file3id`,
                fileName: 'file3.pdf',
                importingStatus: DocumentImportingStatus.Error,
                progress: 0,
            },
        ];

        store.overrideSelector(selectAcceptedFileSize, 1024);

        const action = systemActions.queueDocumentUploadError({ documents });
        const outcome = systemActions.notificationShow({ severity: 'error', message: jasmine.any(String) as any });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        translateServiceSpy.instant.and.returnValue('Message.');

        expect(effects.queueDocumentUploadErrorNotificationEffect$).toBeObservable(expected);
        expect(translateServiceSpy.instant).toHaveBeenCalledTimes(3);
    });

    it('should cancel document upload', () => {
        const documentIds = ['file1id', 'file2id'];

        const action = userActions.cancelDocumentUpload({ documentIds });

        actions$ = hot('-a-', { a: action });
        effects.cancelDocumentUploadEffect$.subscribe(() => {});

        getTestScheduler().flush();

        expect(documentImportServiceSpy.cancelDocumentUpload).toHaveBeenCalledWith(documentIds);
    });

    it('should show notification on document upload error', () => {
        spyOn(store, 'select').and.returnValue(
            of({
                id: `file1id`,
                fileName: 'file1.pdf',
                importingStatus: DocumentImportingStatus.Error,
                progress: 0,
                errorCode: DocumentUploadErrorCode.ProhibitedType,
            })
        );

        translateServiceSpy.instant.and.returnValue('Message.');

        const action = systemActions.documentUploadError({ documentId: 'file1id' });
        const outcome = systemActions.notificationShow({ severity: 'error', message: jasmine.any(String) as any });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.documentUploadErrorNotificationEffect$).toBeObservable(expected);
        expect(translateServiceSpy.instant).toHaveBeenCalledTimes(1);
    });

    it('should not emit anything on document upload error when document is not found', () => {
        spyOn(store, 'select').and.returnValue(of(undefined));

        const action = systemActions.documentUploadError({ documentId: 'nonexistent-id' });

        actions$ = hot('-a-', { a: action });
        const expected = cold('---');

        expect(effects.documentUploadErrorNotificationEffect$).toBeObservable(expected);
    });

    it('should create document on document upload complete', () => {
        const documentId = 'file1id';
        const fileUploadId = 'file1upload';
        const document = {
            id: documentId,
            fileUploadId,
            fileName: 'file1.pdf',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
        };

        documentImportServiceSpy.createDocumentUnderProcessDocumentUploadFolder$.and.returnValue(of(['sys1', 'process-folder']));

        spyOn(store, 'select').and.returnValue(of(document));

        const action = systemActions.documentUploadComplete({ documentId, fileUploadId });
        const outcome = systemActions.uploadedDocumentCreated({ documentId, sysId: 'sys1', processFolderId: 'process-folder' });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.documentUploadCompleteCreateDocumentEffect$).toBeObservable(expected);
    });

    it('should not emit anything on document upload complete create document when document is not found', () => {
        spyOn(store, 'select').and.returnValue(of(undefined));

        const action = systemActions.documentUploadComplete({ documentId: 'file1id', fileUploadId: 'file1upload' });

        actions$ = hot('-a-', { a: action });
        const expected = cold('---');

        expect(effects.documentUploadCompleteCreateDocumentEffect$).toBeObservable(expected);
    });

    it('should create document on document upload complete', () => {
        const documentId = 'file1id';
        const fileUploadId = 'file1upload';
        const document = {
            id: documentId,
            fileUploadId,
            fileName: 'file1.pdf',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
        };

        const error = new Error('Test Create Document Error');
        documentImportServiceSpy.createDocumentUnderProcessDocumentUploadFolder$.and.returnValue(cold('#', {}, error));

        spyOn(store, 'select').and.returnValue(of(document));

        const action = systemActions.documentUploadComplete({ documentId, fileUploadId });
        const outcome = systemActions.documentUploadError({ documentId });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.documentUploadCompleteCreateDocumentEffect$).toBeObservable(expected);
    });

    it('should retrieve document metadata on uploaded document created', () => {
        const documentId = 'file1id';
        const fileUploadId = 'file1upload';
        const document = {
            id: documentId,
            fileUploadId,
            fileName: 'file1.pdf',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
            sysId: '123',
        };

        const metadata: IdpFileMetadata = {
            status: 'Succeeded',
            pageCount: 0,
            pages: [],
        };

        spyOn(store, 'select').and.returnValue(of(document));

        idpDocumentMetadataServiceSpy.extractDocumentMetadata$.and.returnValue(of(metadata));

        const action = systemActions.uploadedDocumentCreated({ documentId, sysId: '123', processFolderId: 'process-folder' });
        const outcome = systemActions.uploadedDocumentReceivedMetadataSuccess({ metadata, documentId, uploadedDocument: document });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.uploadedDocumentCreateEffect$).toBeObservable(expected);
    });

    it('should return error action if error happened in metadata extraction', () => {
        const documentId = 'file1id';
        const fileUploadId = 'file1upload';
        const document = {
            id: documentId,
            fileUploadId,
            fileName: 'file1.pdf',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 100,
            sysId: '123',
        };

        spyOn(store, 'select').and.returnValue(of(document));

        const error = new Error('Test Create Document Error');
        idpDocumentMetadataServiceSpy.extractDocumentMetadata$.and.returnValue(cold('#', {}, error));

        const action = systemActions.uploadedDocumentCreated({ documentId, sysId: '123', processFolderId: 'process-folder' });
        const outcome = systemActions.uploadedDocumentReceivedMetadataError({ documentId });

        actions$ = hot('-a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.uploadedDocumentCreateEffect$).toBeObservable(expected);
    });
});
