/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DocumentImportStatus, IdpDocumentImportDialogService } from './idp-document-import-dialog.service';
import { MatDialog, MatDialogRef, MatDialogState } from '@angular/material/dialog';
import { EMPTY, Subject } from 'rxjs';
import { DocumentImportingStatus, ImportingDocument } from '../../store/states/importing-document.state';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { DocumentImportProgressDialogComponent } from '../../dialogs/document-import-progress-dialog/document-import-progress.dialog';
import { EventEmitter } from '@angular/core';
import { systemActions, userActions } from '../../store/actions/class-verification.actions';
import { IdpDocumentImportService } from './idp-document-import.service';

describe('IdpDocumentImportDialogService', () => {
    let service: IdpDocumentImportDialogService;
    let documentUploadServiceMock: jasmine.SpyObj<IdpDocumentImportService>;
    let documentUploadComplete$: Subject<ImportingDocument>;
    let documentUploadError$: Subject<ImportingDocument>;
    let documentUploadCancelled$: Subject<ImportingDocument>;
    let documentMetadataExtractionError$: Subject<ImportingDocument>;
    let documentMetadataExtractionCompleted$: Subject<ImportingDocument>;
    let documentMetadataExtractionCancelled$: Subject<ImportingDocument>;
    let dialogMock: jasmine.SpyObj<MatDialog>;
    let store: MockStore;

    beforeEach(() => {
        documentUploadComplete$ = new Subject<ImportingDocument>();
        documentUploadError$ = new Subject<ImportingDocument>();
        documentUploadCancelled$ = new Subject<ImportingDocument>();
        documentMetadataExtractionError$ = new Subject<ImportingDocument>();
        documentMetadataExtractionCompleted$ = new Subject<ImportingDocument>();
        documentMetadataExtractionCancelled$ = new Subject<ImportingDocument>();

        documentUploadServiceMock = jasmine.createSpyObj<IdpDocumentImportService>('IdpDocumentImportService', ['queueDocumentUpload'], {
            documentUploadComplete$,
            documentUploadError$,
            documentUploadCancelled$,
            documentMetadataExtractionError$,
            documentMetadataExtractionCompleted$,
            documentMetadataExtractionCancelled$,
        });

        dialogMock = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

        TestBed.configureTestingModule({
            providers: [
                IdpDocumentImportDialogService,
                { provide: IdpDocumentImportService, useValue: documentUploadServiceMock },
                { provide: MatDialog, useValue: dialogMock },
                provideMockStore(),
            ],
        });

        service = TestBed.inject(IdpDocumentImportDialogService);
        store = TestBed.inject(MockStore);
    });

    it('should open document upload progress dialog', () => {
        const document1 = {
            id: 'file1id',
            fileName: 'file1.txt',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document2 = {
            id: 'file2id',
            fileName: 'file2.jpg',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document3 = {
            id: 'file3id',
            fileName: 'file3.pdf',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };

        const dialogComponentInstanceMock = jasmine.createSpyObj<DocumentImportProgressDialogComponent>(
            'DocumentImportProgressDialogComponent',
            ['onCancel'],
            { cancelDocumentUpload: new EventEmitter<any>() }
        );
        const dialogRefMock = jasmine.createSpyObj<MatDialogRef<DocumentImportProgressDialogComponent>>(
            'MatDialogRef',
            ['getState', 'beforeClosed', 'afterClosed'],
            {
                componentInstance: dialogComponentInstanceMock,
            }
        );
        dialogRefMock.beforeClosed.and.returnValue(EMPTY);
        dialogMock.open.and.returnValue(dialogRefMock);

        service.queueDocumentUpload([document1]);
        expect(dialogMock.open).toHaveBeenCalled();

        dialogRefMock.getState.and.returnValue(MatDialogState.CLOSED);
        service.queueDocumentUpload([document2]);
        expect(dialogMock.open).toHaveBeenCalled();

        const dialogAfterClosed = new Subject<void>();
        dialogRefMock.afterClosed.and.returnValue(dialogAfterClosed.asObservable());
        dialogRefMock.getState.and.returnValue(MatDialogState.CLOSING);
        service.queueDocumentUpload([document3]);
        dialogAfterClosed.next();
        dialogAfterClosed.complete();
        expect(dialogMock.open).toHaveBeenCalled();
    });

    it('should dispatch cancel document upload on document upload progress dialog component cancelDocumentUpload emit', () => {
        const document1 = {
            id: 'file1id',
            fileName: 'file1.txt',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document2 = {
            id: 'file2id',
            fileName: 'file2.jpg',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document3 = {
            id: 'file3id',
            fileName: 'file3.pdf',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };

        spyOn(store, 'dispatch');
        const dialogComponentInstanceMock = jasmine.createSpyObj<DocumentImportProgressDialogComponent>(
            'DocumentImportProgressDialogComponent',
            ['onCancel'],
            { cancelDocumentUpload: new EventEmitter<any>() }
        );
        const dialogRefMock = jasmine.createSpyObj<MatDialogRef<DocumentImportProgressDialogComponent>>('MatDialogRef', ['beforeClosed'], {
            componentInstance: dialogComponentInstanceMock,
        });
        dialogRefMock.beforeClosed.and.returnValue(EMPTY);
        dialogMock.open.and.returnValue(dialogRefMock);

        service.queueDocumentUpload([document1, document2, document3]);
        dialogRefMock.componentInstance.cancelDocumentUpload.emit([{ fileId: 'file1id' }, { fileId: 'file3id' }] as DocumentImportStatus[]);

        expect(store.dispatch).toHaveBeenCalledWith(userActions.cancelDocumentUpload({ documentIds: ['file1id', 'file3id'] }));
    });

    it('should close dialog and dispatch document upload finished when all documents finish importing', () => {
        const document1 = {
            id: 'file1id',
            fileName: 'file1.txt',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document2 = {
            id: 'file2id',
            fileName: 'file2.jpg',
            importingStatus: DocumentImportingStatus.Progress,
            progress: 0,
        };
        const document3 = {
            id: 'file3id',
            fileName: 'file3.pdf',
            importingStatus: DocumentImportingStatus.Complete,
            progress: 0,
        };
        const document4 = {
            id: 'file4id',
            fileName: 'file4.jpg',
            importingStatus: DocumentImportingStatus.Error,
            progress: 0,
        };
        const document5 = {
            id: 'file5id',
            fileName: 'file5.txt',
            importingStatus: DocumentImportingStatus.Cancelled,
            progress: 0,
        };
        const document6 = {
            id: 'file6id',
            fileName: 'file6.jpg',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document7 = {
            id: 'file7id',
            fileName: 'file7.jpg',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };
        const document8 = {
            id: 'file8id',
            fileName: 'file8.jpg',
            importingStatus: DocumentImportingStatus.Pending,
            progress: 0,
        };

        spyOn(store, 'dispatch');

        const dialogComponentInstanceMock = jasmine.createSpyObj<DocumentImportProgressDialogComponent>(
            'DocumentImportProgressDialogComponent',
            ['onCancel'],
            { cancelDocumentUpload: new EventEmitter<any>() }
        );
        const dialogRefMock = jasmine.createSpyObj<MatDialogRef<DocumentImportProgressDialogComponent>>('MatDialogRef', ['close', 'beforeClosed'], {
            componentInstance: dialogComponentInstanceMock,
        });
        dialogRefMock.beforeClosed.and.returnValue(EMPTY);
        dialogMock.open.and.returnValue(dialogRefMock);

        service.queueDocumentUpload([document1, document2, document3, document4, document5, document6, document7, document8]);

        documentUploadError$.next({ ...document1, importingStatus: DocumentImportingStatus.Error });
        documentUploadError$.next({ ...document2, importingStatus: DocumentImportingStatus.Error });
        documentMetadataExtractionError$.next({ ...document3, importingStatus: DocumentImportingStatus.Error });
        documentMetadataExtractionCompleted$.next({ ...document4, importingStatus: DocumentImportingStatus.Complete });
        documentMetadataExtractionCompleted$.next({ ...document5, importingStatus: DocumentImportingStatus.Complete });
        documentUploadCancelled$.next({ ...document6, importingStatus: DocumentImportingStatus.Cancelled });
        documentUploadCancelled$.next({ ...document7, importingStatus: DocumentImportingStatus.Cancelled });
        documentUploadCancelled$.next({ ...document8, id: '', importingStatus: DocumentImportingStatus.Cancelled });

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(store.dispatch).toHaveBeenCalledWith(systemActions.documentImportFinished());
    });
});
