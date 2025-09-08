/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HxpUploadService } from './hxp-upload.service';
import { FileModel, FileUploadStatus } from '../model/file.model';
import { TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockService } from 'ng-mocks';
import { UploadApi } from '@hylandsoftware/hxcs-js-client';
import { Subject } from 'rxjs';
import { FileReaderService } from './hxp-file-reader.service';
import { UPLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';

describe('HxpUploadService', () => {
    let uploadService: HxpUploadService;
    const mockUploadApi = MockService(UploadApi);

    const file = { name: 'bigFile.png', size: 1000001 } as File;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, HttpClientTestingModule],
            providers: [FileReaderService, { provide: UPLOAD_API_TOKEN, useValue: mockUploadApi }, HxpUploadService],
        });
        uploadService = TestBed.inject(HxpUploadService);
    });

    afterEach(() => {
        TestBed.resetTestingModule();
    });
    it('should cancel request if upload fails', (done) => {
        const fileModel = new FileModel(file);
        const cancelUpload = new Subject<void>();

        spyOn(mockUploadApi, 'upload').and.callFake(() => {
            return new Promise((_, reject) => {
                cancelUpload.subscribe({
                    next: () => reject({ message: 'Network error' }),
                });
            });
        });

        uploadService.fileUploadError.subscribe((event) => {
            expect(event.file).toEqual(fileModel);
            expect(event.error).toEqual({ message: 'Network error' });
            expect(event.status).toEqual(FileUploadStatus.Error);
            expect(mockUploadApi.upload).toHaveBeenCalled();
            done();
        });

        expect(mockUploadApi.upload).not.toHaveBeenCalled();

        uploadService.addToQueue(fileModel);
        uploadService.uploadFilesInTheQueue();
        uploadService.cancelUpload(fileModel);
        cancelUpload.next();
    });

    it('should abort upload when request is still ongoing', (done) => {
        const fileModel = new FileModel(file);
        const cancelUpload = new Subject();

        spyOn(mockUploadApi, 'upload').and.callFake(() => {
            return new Promise((_, reject) => {
                cancelUpload.subscribe(() => {
                    reject('Not relevant as the upload is aborted');
                });
            });
        });

        uploadService.fileUploadAborted.subscribe((event) => {
            expect(event.file).toEqual(fileModel);
            expect(event.status).toEqual(FileUploadStatus.Aborted);
            expect(mockUploadApi.upload).toHaveBeenCalled();
            done();
        });

        expect(mockUploadApi.upload).not.toHaveBeenCalled();

        uploadService.addToQueue(fileModel);
        uploadService.uploadFilesInTheQueue();
        // mock the progress report
        fileModel.progress = {
            loaded: 200000,
            total: 1000000,
            percent: 20,
            bytes: 200000,
            lengthComputable: true,
        };
        fileModel.status = FileUploadStatus.Progress;
        uploadService.cancelUpload(fileModel);
    });
});
