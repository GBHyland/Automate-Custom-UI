/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { FileModel, FileUploadStatus, HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { Subject, combineLatest, of, take, throwError } from 'rxjs';
import { UploadContentModel } from '../model/upload-content.model';
import { UploadDocumentModelStatus } from '../model/upload-document.model';
import { UploadManagerService } from './upload-manager.service';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { generateMockUploadData } from '../data/upload-mock-data';
import { NoopUploadActionStrategy } from '../document-update-strategies/noop-action-strategy';
import { CreateDocumentStrategy } from '../document-update-strategies/create-document-strategy';

describe('UploadManagerService', () => {
    let uploadManagerService: UploadManagerService;
    let noopDocumentAction;
    let documentCreateAction;
    const hxpUploadServiceSpy = jasmine.createSpyObj('HxpUploadService', [
        'queueChanged',
        'fileUploadComplete',
        'fileUploadError',
        'fileUploadCancelled',
        'fileUploadProgress',
        'cancelUpload',
        'deleteUpload',
        'retryUpload',
        'addToQueue',
        'clearQueue',
        'uploadFilesInTheQueue',
    ]);
    const documentServiceSpy = jasmine.createSpyObj('DocumentService', ['createDocument']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                UploadManagerService,
                { provide: DocumentService, useValue: documentServiceSpy },
                { provide: HxpUploadService, useValue: hxpUploadServiceSpy },
            ],
        });

        hxpUploadServiceSpy.queueChanged = new Subject();
        hxpUploadServiceSpy.fileUploadCancelled = new Subject();
        hxpUploadServiceSpy.fileUploadComplete = new Subject();
        hxpUploadServiceSpy.fileUploadError = new Subject();
        hxpUploadServiceSpy.fileUploadProgress = new Subject();

        uploadManagerService = TestBed.inject(UploadManagerService);
        noopDocumentAction = TestBed.inject(NoopUploadActionStrategy);
        documentCreateAction = TestBed.inject(CreateDocumentStrategy);
    });

    afterEach(() => {
        hxpUploadServiceSpy.cancelUpload.calls.reset();
        hxpUploadServiceSpy.retryUpload.calls.reset();
        documentServiceSpy.createDocument.calls.reset();
    });

    it('should upload file', (done) => {
        const data = generateMockUploadData(1);
        const upload = data[0];

        uploadManagerService.initiateUpload(upload).subscribe({
            next: (uploaded) => {
                expect(uploaded).toEqual(upload);
                expect(uploaded.fileModel.status).toBe(FileUploadStatus.Complete);
                expect(uploaded.documentModel.document.sysfile_blob.uploadId).toBe(uploaded.fileModel.data.id);
                done();
            },
        });

        upload.fileModel.status = FileUploadStatus.Complete;
        upload.fileModel.data = { id: 0 };

        hxpUploadServiceSpy.fileUploadComplete.next({ file: upload.fileModel });
    });

    it('should add upload requests to queue', (done) => {
        expect(uploadManagerService.getQueue()).toHaveSize(0);

        const data = generateMockUploadData(3);
        uploadManagerService.queueChanged.pipe(take(3)).subscribe((queue: UploadContentModel[]) => {
            if (queue.length === 3) {
                expect(queue).toHaveSize(3);
                expect(uploadManagerService.getQueue()).toHaveSize(3);
                expect(queue).toEqual(data);
                done();
            }
        });

        for (const upload of data) {
            uploadManagerService.addToQueue(upload);
        }
    });

    it('should clear the queue', (done) => {
        for (const upload of generateMockUploadData(3)) {
            uploadManagerService.addToQueue(upload);
        }
        uploadManagerService.queueChanged.subscribe((queue: UploadContentModel[]) => {
            expect(queue).toHaveSize(0);
            expect(uploadManagerService.getQueue()).toHaveSize(0);
            done();
        });

        expect(uploadManagerService.getQueue()).toHaveSize(3);
        uploadManagerService.clearQueue();
    });

    it('should cancel upload', () => {
        const data = generateMockUploadData(1);
        const upload = data[0];

        uploadManagerService.cancelUpload(upload);

        expect(hxpUploadServiceSpy.cancelUpload).toHaveBeenCalledWith(upload.fileModel);
    });

    it('should cancel all uploads in queue', () => {
        for (const upload of generateMockUploadData(3)) {
            uploadManagerService.addToQueue(upload);
        }

        uploadManagerService.cancelAllUploads();

        expect(uploadManagerService.getQueue()).toHaveSize(0);
        expect(hxpUploadServiceSpy.cancelUpload).toHaveBeenCalledTimes(3);
        expect(hxpUploadServiceSpy.clearQueue).toHaveBeenCalled();
    });

    it('should complete with files already uploaded', (done) => {
        const data = generateMockUploadData(3);
        for (const [index, upload] of data.entries()) {
            upload.postFileUploadAction = noopDocumentAction;
            upload.fileModel.status = FileUploadStatus.Complete;
            upload.fileModel.data = { id: index };
            upload.documentModel.document['sysfile_blob'] = {
                uploadId: index,
            };
            documentServiceSpy.createDocument.withArgs(upload.documentModel.document).and.returnValue(of(upload.documentModel.document));
        }
        let totalUploadsCompleted = 0;

        for (const upload of data) {
            uploadManagerService.addToQueue(upload);
        }
        uploadManagerService.uploadCompleted.subscribe((upload: UploadContentModel) => {
            expect(upload.documentModel.status).toBe(UploadDocumentModelStatus.COMPLETED);
            totalUploadsCompleted++;
            if (totalUploadsCompleted === data.length) {
                done();
            }
        });

        for (const upload of data) {
            hxpUploadServiceSpy.fileUploadComplete.next({ file: upload.fileModel });
        }

        uploadManagerService.completeQueuedUploads();
    });

    it('should complete with files still uploading', (done) => {
        const data = generateMockUploadData();
        for (const upload of data) {
            upload.postFileUploadAction = noopDocumentAction;
            documentServiceSpy.createDocument.withArgs(upload.documentModel.document).and.returnValue(of(upload.documentModel.document));
        }
        let totalUploadsCompleted = 0;

        for (const upload of data) {
            uploadManagerService.addToQueue(upload);
        }
        uploadManagerService.uploadCompleted.subscribe((upload: UploadContentModel) => {
            expect(upload.documentModel.status).toBe(UploadDocumentModelStatus.COMPLETED);
            totalUploadsCompleted++;
            if (totalUploadsCompleted === data.length) {
                done();
            }
        });

        for (const [index, upload] of data.entries()) {
            upload.fileModel.status = FileUploadStatus.Complete;
            upload.fileModel.data = { id: index };
        }
        uploadManagerService.completeQueuedUploads();

        for (const upload of data) {
            hxpUploadServiceSpy.fileUploadComplete.next({ file: upload.fileModel });
        }
    });

    it('should retry file upload if file upload has failed', (done) => {
        hxpUploadServiceSpy.retryUpload.and.callFake((model: FileModel) => (model.status = FileUploadStatus.Complete));

        const data = generateMockUploadData();
        for (const [index, upload] of data.entries()) {
            documentServiceSpy.createDocument.withArgs(upload.documentModel.document).and.returnValue(of(upload.documentModel.document));

            if (index === 0) {
                upload.fileModel.status = FileUploadStatus.Error;
            }
            upload.fileModel.data = { id: index };
        }
        for (const upload of data) {
            uploadManagerService.addToQueue(upload);
        }

        uploadManagerService.uploadRetried.subscribe((upload: UploadContentModel) => {
            expect(upload).toBe(data[0]);
            expect(hxpUploadServiceSpy.retryUpload).toHaveBeenCalledWith(data[0].fileModel);
            done();
        });

        expect(hxpUploadServiceSpy.retryUpload).not.toHaveBeenCalled();

        uploadManagerService.completeQueuedUploads();

        expect(hxpUploadServiceSpy.retryUpload).not.toHaveBeenCalled();

        uploadManagerService.retryUpload(data[0]);
    });

    it('should retry document update action if file has been uploaded', (done) => {
        const data = generateMockUploadData();
        const erroredUpload = data[0];

        for (const [index, upload] of data.entries()) {
            if (index === 0) {
                documentServiceSpy.createDocument.withArgs(data[index].documentModel.document).and.returnValue(throwError('Unknown random error'));
            } else {
                documentServiceSpy.createDocument
                    .withArgs(data[index].documentModel.document)
                    .and.returnValue(of(data[index].documentModel.document));
            }

            upload.postFileUploadAction = documentCreateAction;
            upload.fileModel.status = FileUploadStatus.Complete;
            upload.fileModel.data = { id: index };
        }
        for (const upload of data) {
            uploadManagerService.addToQueue(upload);
        }

        combineLatest([uploadManagerService.uploadError, uploadManagerService.uploadRetried]).subscribe(([errorModel, retriedModel]) => {
            expect(errorModel).toEqual(erroredUpload);
            expect(retriedModel).toEqual(erroredUpload);
            expect(documentServiceSpy.createDocument).toHaveBeenCalledWith(erroredUpload.documentModel.document);
            done();
        });

        uploadManagerService.completeQueuedUploads();

        uploadManagerService.retryUpload(erroredUpload);
    });
});
