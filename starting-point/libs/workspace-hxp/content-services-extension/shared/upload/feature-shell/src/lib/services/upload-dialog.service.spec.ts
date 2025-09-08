/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { FileModel } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { UploadDialogService } from './upload-dialog.service';
import { UploadManagerService } from './upload-manager.service';
import { UploadContentModel } from '../model/upload-content.model';
import { CreateDocumentStrategy } from '../document-update-strategies/create-document-strategy';
import { MockProvider } from 'ng-mocks';

describe('UploadDialogService', () => {
    let uploadDialogService: UploadDialogService;
    let uploadManagerServiceSpy: jasmine.SpyObj<UploadManagerService>;

    beforeEach(() => {
        uploadManagerServiceSpy = jasmine.createSpyObj('UploadManagerService', [
            'createUploadModel',
            'addToQueue',
            'initiateUpload',
            'cancelUpload',
            'completeQueuedUploads',
            'retryUpload',
            'clearQueue',
            'removeFromQueue',
            'isFileUploadPending',
            'isFileUploadAborted',
            'isFileUploadCanceled',
            'isFileUploadErrored',
            'isUploadOngoing',
            'uploadError',
            'uploadCanceled',
        ]);

        TestBed.configureTestingModule({
            providers: [
                UploadDialogService,
                { provide: UploadManagerService, useValue: uploadManagerServiceSpy },
                MockProvider(CreateDocumentStrategy),
            ],
        });

        uploadManagerServiceSpy.uploadError = new Subject();
        uploadManagerServiceSpy.uploadCanceled = new Subject();

        uploadManagerServiceSpy = TestBed.inject(UploadManagerService) as jasmine.SpyObj<UploadManagerService>;
        uploadDialogService = TestBed.inject(UploadDialogService);
    });

    it('should upload files', () => {
        const fileModel: FileModel = { name: 'file1' } as FileModel;
        const uploadModel: UploadContentModel = { fileModel } as UploadContentModel;

        uploadManagerServiceSpy.createUploadModel.and.returnValue(uploadModel);
        uploadManagerServiceSpy.initiateUpload.and.returnValue(of(uploadModel));

        uploadDialogService.uploadFiles([fileModel]);

        expect(uploadManagerServiceSpy.createUploadModel).toHaveBeenCalledWith(fileModel, jasmine.any(CreateDocumentStrategy));
        expect(uploadManagerServiceSpy.addToQueue).toHaveBeenCalledWith(uploadModel);
        expect(uploadManagerServiceSpy.initiateUpload).toHaveBeenCalledWith(uploadModel);
    });

    it('should cancel upload', () => {
        const uploadModel: UploadContentModel = { fileModel: { name: 'file1' } } as UploadContentModel;

        uploadDialogService.cancelUpload(uploadModel);

        expect(uploadManagerServiceSpy.cancelUpload).toHaveBeenCalledWith(uploadModel);
    });

    it('should complete queued uploads', () => {
        uploadDialogService.completeQueuedUploads();

        expect(uploadManagerServiceSpy.completeQueuedUploads).toHaveBeenCalled();
    });

    it('should retry upload', () => {
        const uploadModel: UploadContentModel = { fileModel: { name: 'file1' } } as UploadContentModel;

        uploadDialogService.retryUpload(uploadModel);

        expect(uploadManagerServiceSpy.retryUpload).toHaveBeenCalledWith(uploadModel);
    });

    it('should clear queue', () => {
        uploadDialogService.clearQueue();

        expect(uploadManagerServiceSpy.clearQueue).toHaveBeenCalled();
    });

    it('should remove from queue', () => {
        const uploadModel: UploadContentModel = { fileModel: { name: 'file1' } } as UploadContentModel;

        uploadDialogService.removeFromQueue(uploadModel);

        expect(uploadManagerServiceSpy.removeFromQueue).toHaveBeenCalledWith(uploadModel);
    });

    it('should check if file upload is pending', () => {
        const fileModel: FileModel = { name: 'file1' } as FileModel;

        uploadDialogService.isFileUploadPending(fileModel);

        expect(uploadManagerServiceSpy.isFileUploadPending).toHaveBeenCalledWith(fileModel);
    });

    it('should check if file upload is aborted', () => {
        const fileModel: FileModel = { name: 'file1' } as FileModel;

        uploadDialogService.isFileUploadAborted(fileModel);

        expect(uploadManagerServiceSpy.isFileUploadAborted).toHaveBeenCalledWith(fileModel);
    });

    it('should check if file upload is canceled', () => {
        const fileModel: FileModel = { name: 'file1' } as FileModel;

        uploadDialogService.isFileUploadCanceled(fileModel);

        expect(uploadManagerServiceSpy.isFileUploadCanceled).toHaveBeenCalledWith(fileModel);
    });

    it('should check if file upload is errored', () => {
        const fileModel: FileModel = { name: 'file1' } as FileModel;

        uploadDialogService.isFileUploadErrored(fileModel);

        expect(uploadManagerServiceSpy.isFileUploadErrored).toHaveBeenCalledWith(fileModel);
    });

    it('should check if upload is ongoing', () => {
        uploadDialogService.isUploadOngoing();

        expect(uploadManagerServiceSpy.isUploadOngoing).toHaveBeenCalled();
    });

    it('should emit upload error', (done) => {
        const uploadModel: UploadContentModel = { fileModel: { name: 'file1' } } as UploadContentModel;

        uploadDialogService.uploadError.subscribe((upload) => {
            expect(upload).toBe(uploadModel);
            done();
        });

        uploadManagerServiceSpy.uploadError.next(uploadModel);
    });

    it('should emit upload canceled', (done) => {
        const uploadModel: UploadContentModel = { fileModel: { name: 'file1' } } as UploadContentModel;

        uploadDialogService.uploadCanceled.subscribe((upload) => {
            expect(upload).toBe(uploadModel);
            done();
        });

        uploadManagerServiceSpy.uploadCanceled.next(uploadModel);
    });
});
