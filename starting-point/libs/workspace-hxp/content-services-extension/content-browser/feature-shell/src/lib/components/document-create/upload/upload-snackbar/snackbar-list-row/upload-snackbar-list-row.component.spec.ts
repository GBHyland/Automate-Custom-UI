/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadSnackbarListRowComponent } from './upload-snackbar-list-row.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { By } from '@angular/platform-browser';
import { FileUploadStatus, HxpFileUploadErrorPipe, HxpUploadService, FileReaderService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { MockPipe, MockProvider } from 'ng-mocks';
import { DocumentService } from '@alfresco/adf-hx-content-services/services';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { mockHxcsJsClientConfigurationService, uploadApiProvider } from '@alfresco/adf-hx-content-services/api';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
    generateMockUploadData,
    UploadDocumentModelStatus,
    UploadManagerService,
} from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('UploadSnackbarListRowComponent', () => {
    let component: UploadSnackbarListRowComponent;
    let fixture: ComponentFixture<UploadSnackbarListRowComponent>;
    let uploadManagerService: UploadManagerService;

    const getRowDetails = () => {
        return {
            cancelButton: fixture.debugElement.query(By.css('[data-automation-id="cancel-upload-queue"]')),
            errorIcon: fixture.debugElement.query(By.css('.hxp-upload-snackbar-list-row__status--error')),
            mimetypeIcon: fixture.debugElement.query(By.css('.hxp-upload-snackbar-list-row__type')),
            progressBar: fixture.debugElement.query(By.css('.hxp-upload-snackbar-list-row__progress-bar')),
            retryButton: fixture.debugElement.query(By.css('[data-automation-id="retry-upload"]')),
            uploadName: fixture.debugElement.query(By.css('.hxp-upload-snackbar-list-row__name')),
            status: fixture.debugElement.query(By.css('.hxp-upload-snackbar-list-row__status')),
        };
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [MockPipe(HxpFileUploadErrorPipe), UploadSnackbarListRowComponent],
            imports: [CommonModule, MatIconModule, MatProgressBarModule, MatIconModule, NoopTranslateModule, MatTooltipModule],
            providers: [
                MockProvider(DocumentService),
                HxpUploadService,
                FileReaderService,
                mockHxcsJsClientConfigurationService,
                uploadApiProvider,
                UploadManagerService,
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(UploadSnackbarListRowComponent);
        uploadManagerService = TestBed.inject(UploadManagerService);
        component = fixture.componentInstance;
    });

    it('should display the snackbar row', () => {
        const upload = generateMockUploadData(1)[0];
        component.upload = upload;
        fixture.detectChanges();

        const { cancelButton, errorIcon, mimetypeIcon, progressBar, retryButton, uploadName, status } = getRowDetails();

        expect(cancelButton).toBeTruthy();
        expect(errorIcon).toBeFalsy();
        expect(mimetypeIcon).toBeFalsy();
        expect(progressBar).toBeTruthy();
        expect(retryButton).toBeFalsy();
        expect(uploadName).toBeTruthy();
        expect(status).toBeTruthy();
        expect(uploadName.nativeElement.textContent.trim()).toBe(upload.fileModel.name);
    });

    it('should display error state', () => {
        const upload = generateMockUploadData(1)[0];
        component.upload = upload;
        fixture.detectChanges();
        let { cancelButton, errorIcon, mimetypeIcon, progressBar, retryButton, uploadName, status } = getRowDetails();

        expect(cancelButton).toBeTruthy();
        expect(errorIcon).toBeFalsy();
        expect(mimetypeIcon).toBeFalsy();
        expect(progressBar).toBeTruthy();
        expect(retryButton).toBeFalsy();
        expect(uploadName).toBeTruthy();
        expect(status).toBeTruthy();
        expect(uploadName.nativeElement.textContent.trim()).toBe(upload.fileModel.name);

        upload.fileModel.status = FileUploadStatus.Error;
        fixture.detectChanges();
        ({ cancelButton, errorIcon, mimetypeIcon, progressBar, retryButton, uploadName, status } = getRowDetails());

        expect(cancelButton).toBeFalsy();
        expect(errorIcon).toBeTruthy();
        expect(mimetypeIcon).toBeFalsy();
        expect(progressBar).toBeTruthy();
        expect(retryButton).toBeTruthy();
        expect(uploadName).toBeTruthy();
        expect(status).toBeFalsy();
    });

    it('should display finished upload state', () => {
        const upload = generateMockUploadData(1)[0];
        upload.fileModel.status = FileUploadStatus.Complete;
        upload.documentModel.status = UploadDocumentModelStatus.COMPLETED;
        component.upload = upload;
        fixture.detectChanges();

        const { cancelButton, errorIcon, mimetypeIcon, progressBar, retryButton, uploadName, status } = getRowDetails();

        expect(cancelButton).toBeFalsy();
        expect(errorIcon).toBeFalsy();
        expect(mimetypeIcon).toBeTruthy();
        expect(progressBar).toBeTruthy();
        expect(progressBar.classes['hxp-upload-snackbar-list-row__progress-bar--hidden']).toBeTruthy();
        expect(retryButton).toBeFalsy();
        expect(uploadName).toBeTruthy();
        expect(status).toBeTruthy();
    });

    it('should cancel an ongoing upload', () => {
        const upload = generateMockUploadData(1)[0];
        const cancelUploadSpy = spyOn(uploadManagerService, 'cancelUpload').withArgs(upload).and.callThrough();

        component.upload = upload;
        fixture.detectChanges();

        expect(cancelUploadSpy).not.toHaveBeenCalled();

        const { cancelButton } = getRowDetails();

        expect(cancelButton).toBeTruthy();

        cancelButton.nativeElement.click();

        expect(cancelUploadSpy).toHaveBeenCalledWith(upload);
    });

    it('should trigger upload retry', () => {
        const upload = generateMockUploadData(1)[0];
        const retryUploadSpy = spyOn(uploadManagerService, 'retryUpload').withArgs(upload).and.callThrough();

        upload.fileModel.status = FileUploadStatus.Error;
        component.upload = upload;
        fixture.detectChanges();

        const { cancelButton, errorIcon, mimetypeIcon, progressBar, retryButton, uploadName, status } = getRowDetails();

        expect(cancelButton).toBeFalsy();
        expect(errorIcon).toBeTruthy();
        expect(mimetypeIcon).toBeFalsy();
        expect(progressBar).toBeTruthy();
        expect(retryButton).toBeTruthy();
        expect(uploadName).toBeTruthy();
        expect(status).toBeFalsy();
        expect(retryUploadSpy).not.toHaveBeenCalled();

        retryButton.nativeElement.click();

        expect(retryUploadSpy).toHaveBeenCalledWith(upload);
    });

    it('should pass accessibility checks', async () => {
        component.upload = generateMockUploadData(1)[0];
        fixture.detectChanges();

        const res = await a11yReport('.hxp-upload-snackbar-list-row');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
