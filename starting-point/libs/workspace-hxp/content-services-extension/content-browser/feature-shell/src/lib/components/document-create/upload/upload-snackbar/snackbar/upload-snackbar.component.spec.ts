/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UploadSnackbarComponent } from './upload-snackbar.component';
import { CommonModule } from '@angular/common';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { UploadSnackbarListComponent } from '../snackbar-files-list/upload-snackbar-list.component';
import { UploadSnackbarListRowComponent } from '../snackbar-list-row/upload-snackbar-list-row.component';
import { MockService } from 'ng-mocks';
import { FileUploadStatus } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {
    generateMockUploadData,
    UploadDocumentModelStatus,
    UploadManagerService,
    UploadSnackbarService,
} from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

const EXPECTED_VIOLATIONS: jasmine.Expected<{ [violationId: string]: number }[] | undefined> = [];

describe('UploadSnackbarComponent', () => {
    let fixture: ComponentFixture<UploadSnackbarComponent>;
    const mockUploadManagerService = MockService(UploadManagerService);
    const mockUploadSnackbarService = MockService(UploadSnackbarService);

    const getSnackbar = () => fixture.debugElement.query(By.css('.hxp-upload-snackbar'));

    const getSnackbarDetails = () => {
        return {
            header: {
                title: fixture.debugElement.query(By.css('.hxp-upload-snackbar__title')),
                collapseButton: fixture.debugElement.query(By.css('#hxp-upload-snackbar-minimize')),
            },
            rows: fixture.debugElement.queryAll(By.css('hxp-upload-snackbar-list-row')),
            actions: {
                cancelAllButton: fixture.debugElement.query(By.css('#hxp-upload-snackbar-cancel-all')),
                closeButton: fixture.debugElement.query(By.css('#hxp-upload-snackbar-close')),
                confirmation: {
                    messagePanel: fixture.debugElement.query(By.css('.hxp-upload-snackbar__confirmation')),
                    closeConfirmationButton: fixture.debugElement.query(By.css('#hxp-upload-snackbar-close-confirmation')),
                    confirmCancellationButton: fixture.debugElement.query(By.css('#hxp-upload-snackbar-confirm-cancel')),
                },
            },
        };
    };

    beforeEach(async () => {
        mockUploadManagerService.queueChanged = new Subject();
        mockUploadManagerService.uploadError = new Subject();
        mockUploadManagerService.uploadCanceled = new Subject();
        mockUploadManagerService.uploadCompleted = new Subject();
        mockUploadManagerService.uploadRetried = new Subject();
        mockUploadSnackbarService.maximize$ = new Subject();
        mockUploadSnackbarService.minimize$ = new Subject();

        spyOn(mockUploadSnackbarService, 'requestMaximize').and.callFake(() => (mockUploadSnackbarService.maximize$ as Subject<void>).next());
        spyOn(mockUploadSnackbarService, 'requestMinimize').and.callFake(() => (mockUploadSnackbarService.minimize$ as Subject<void>).next());

        TestBed.configureTestingModule({
            imports: [
                CommonModule,
                NoopTranslateModule,
                MatTooltipModule,
                MatProgressBarModule,
                MatIconModule,
                UploadSnackbarComponent,
                UploadSnackbarListComponent,
                UploadSnackbarListRowComponent,
            ],
            providers: [
                {
                    provide: UploadManagerService,
                    useValue: mockUploadManagerService,
                },
                {
                    provide: UploadSnackbarService,
                    useValue: mockUploadSnackbarService,
                },
            ],
        });

        fixture = TestBed.createComponent(UploadSnackbarComponent);
        fixture.detectChanges();
    });

    it('should display snackbar on queue changed and maximize', () => {
        spyOn(mockUploadManagerService, 'isUploadOngoing').and.returnValue(true);

        let snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();

        const data = generateMockUploadData(3);
        mockUploadManagerService.queueChanged.next(data);
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        snackbar = getSnackbar();

        expect(snackbar).toBeTruthy();

        const { header, rows, actions } = getSnackbarDetails();
        const { cancelAllButton, closeButton, confirmation } = actions;
        const { closeConfirmationButton: confirmButton, confirmCancellationButton: cancelButton } = confirmation;

        expect(header.title.nativeElement.textContent.trim()).toBe('FILE_UPLOAD.SNACKBAR.TITLE');
        expect(rows).toHaveSize(3);
        expect(cancelAllButton).toBeTruthy();
        expect(closeButton).toBeFalsy();
        expect(confirmButton).toBeFalsy();
        expect(cancelButton).toBeFalsy();
    });

    it('should cancel all ongoing uploads', () => {
        spyOn(mockUploadManagerService, 'isUploadOngoing').and.returnValue(true);
        spyOn(mockUploadManagerService, 'isUploadCompleted').and.returnValue(false);

        const cancelAllUploadsSpy = spyOn(fixture.componentInstance, 'cancelAllUploads').and.callThrough();

        let snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();

        const data = generateMockUploadData(3);
        mockUploadManagerService.queueChanged.next(data);
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        snackbar = getSnackbar();

        expect(snackbar).toBeTruthy();
        expect(cancelAllUploadsSpy).not.toHaveBeenCalled();

        let { actions } = getSnackbarDetails();
        let { cancelAllButton, closeButton, confirmation } = actions;
        let { closeConfirmationButton, confirmCancellationButton } = confirmation;

        expect(cancelAllButton).toBeTruthy();
        expect(closeButton).toBeFalsy();
        expect(closeConfirmationButton).toBeFalsy();
        expect(confirmCancellationButton).toBeFalsy();

        cancelAllButton.nativeElement.click();
        fixture.detectChanges();

        expect(cancelAllUploadsSpy).not.toHaveBeenCalled();

        ({ actions } = getSnackbarDetails());
        ({ cancelAllButton, closeButton, confirmation } = actions);
        ({ closeConfirmationButton, confirmCancellationButton } = confirmation);

        expect(closeConfirmationButton).toBeTruthy();
        expect(confirmCancellationButton).toBeTruthy();

        confirmCancellationButton.nativeElement.click();
        fixture.detectChanges();

        expect(cancelAllUploadsSpy).toHaveBeenCalled();
    });

    it('should abort upload cancellation', () => {
        spyOn(mockUploadManagerService, 'isUploadOngoing').and.returnValue(true);
        spyOn(mockUploadManagerService, 'isUploadCompleted').and.returnValue(false);

        const cancelAllUploadsSpy = spyOn(fixture.componentInstance, 'cancelAllUploads').and.callThrough();

        let snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();

        const data = generateMockUploadData(3);
        mockUploadManagerService.queueChanged.next(data);
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        snackbar = getSnackbar();

        expect(snackbar).toBeTruthy();
        expect(cancelAllUploadsSpy).not.toHaveBeenCalled();

        let { actions } = getSnackbarDetails();
        let { cancelAllButton, closeButton, confirmation } = actions;
        let { closeConfirmationButton, confirmCancellationButton } = confirmation;

        expect(cancelAllButton).toBeTruthy();
        expect(closeButton).toBeFalsy();
        expect(closeConfirmationButton).toBeFalsy();
        expect(confirmCancellationButton).toBeFalsy();

        cancelAllButton.nativeElement.click();
        fixture.detectChanges();

        expect(cancelAllUploadsSpy).not.toHaveBeenCalled();

        ({ actions } = getSnackbarDetails());
        ({ cancelAllButton, closeButton, confirmation } = actions);
        ({ closeConfirmationButton, confirmCancellationButton } = confirmation);

        expect(closeConfirmationButton).toBeTruthy();
        expect(confirmCancellationButton).toBeTruthy();

        closeConfirmationButton.nativeElement.click();
        fixture.detectChanges();

        expect(cancelAllUploadsSpy).not.toHaveBeenCalled();
    });

    it('should display confirmation message when cancel is clicked on minimized state', () => {
        spyOn(mockUploadManagerService, 'isUploadOngoing').and.returnValue(true);
        spyOn(mockUploadManagerService, 'isUploadCompleted').and.returnValue(false);

        let snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();

        const data = generateMockUploadData(3);
        mockUploadManagerService.queueChanged.next(data);
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        snackbar = getSnackbar();

        expect(snackbar).toBeTruthy();

        let { header, actions } = getSnackbarDetails();
        let { collapseButton, title } = header;
        let { cancelAllButton, closeButton, confirmation } = actions;
        let { messagePanel, closeConfirmationButton, confirmCancellationButton } = confirmation;

        expect(collapseButton).toBeTruthy();
        expect(title).toBeTruthy();
        expect(cancelAllButton).toBeTruthy();
        expect(closeButton).toBeFalsy();
        expect(messagePanel).toBeTruthy();
        expect(messagePanel.classes['hxp-upload-snackbar--hide']).toBeTruthy();
        expect(closeConfirmationButton).toBeFalsy();
        expect(confirmCancellationButton).toBeFalsy();
        expect(fixture.componentInstance.isDialogMinimized).toBeFalsy();

        collapseButton.nativeElement.click();
        fixture.detectChanges();

        ({ header, actions } = getSnackbarDetails());
        ({ collapseButton, title } = header);
        ({ cancelAllButton, closeButton, confirmation } = actions);
        ({ messagePanel, closeConfirmationButton, confirmCancellationButton } = confirmation);

        expect(fixture.componentInstance.isDialogMinimized).toBeTruthy();
        expect(collapseButton).toBeTruthy();
        expect(title).toBeTruthy();
        expect(cancelAllButton).toBeTruthy();
        expect(closeButton).toBeFalsy();
        expect(messagePanel).toBeTruthy();
        expect(messagePanel.classes['hxp-upload-snackbar--hide']).toBeTruthy();
        expect(closeConfirmationButton).toBeFalsy();
        expect(confirmCancellationButton).toBeFalsy();

        cancelAllButton.nativeElement.click();
        fixture.detectChanges();

        ({ header, actions } = getSnackbarDetails());
        ({ collapseButton, title } = header);
        ({ cancelAllButton, closeButton, confirmation } = actions);
        ({ messagePanel, closeConfirmationButton, confirmCancellationButton } = confirmation);

        expect(fixture.componentInstance.isDialogMinimized).toBeFalsy();
        expect(collapseButton).toBeTruthy();
        expect(title).toBeTruthy();
        expect(cancelAllButton).toBeFalsy();
        expect(closeButton).toBeFalsy();
        expect(messagePanel).toBeTruthy();
        expect(messagePanel.classes['hxp-upload-snackbar--hide']).toBeFalsy();
        expect(closeConfirmationButton).toBeTruthy();
        expect(confirmCancellationButton).toBeTruthy();
    });

    it('should close the snackbar when all uploads have finished', () => {
        spyOn(mockUploadManagerService, 'isUploadOngoing').and.returnValue(false);
        spyOn(mockUploadManagerService, 'isUploadCompleted').and.returnValue(true);

        const closeSnackbarSpy = spyOn(fixture.componentInstance, 'close').and.callThrough();

        let snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();

        const data = generateMockUploadData(3);
        for (const upload of data) {
            upload.fileModel.status = FileUploadStatus.Complete;
            upload.documentModel.status = UploadDocumentModelStatus.COMPLETED;
        }
        mockUploadManagerService.queueChanged.next(data);
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        snackbar = getSnackbar();

        expect(snackbar).toBeTruthy();
        expect(closeSnackbarSpy).not.toHaveBeenCalled();

        const { actions } = getSnackbarDetails();
        const { cancelAllButton, closeButton, confirmation } = actions;
        const { closeConfirmationButton, confirmCancellationButton } = confirmation;

        expect(cancelAllButton).toBeFalsy();
        expect(closeButton).toBeTruthy();
        expect(closeConfirmationButton).toBeFalsy();
        expect(confirmCancellationButton).toBeFalsy();

        closeButton.nativeElement.click();

        expect(closeSnackbarSpy).toHaveBeenCalled();

        snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();
    });

    it('should close snackbar on minimized state when all uploads have finished', () => {
        spyOn(mockUploadManagerService, 'isUploadOngoing').and.returnValue(false);
        spyOn(mockUploadManagerService, 'isUploadCompleted').and.returnValue(true);

        let snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();

        const data = generateMockUploadData(3);
        mockUploadManagerService.queueChanged.next(data);
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        snackbar = getSnackbar();

        expect(snackbar).toBeTruthy();

        let { header, actions } = getSnackbarDetails();
        let { collapseButton } = header;
        let { closeButton, cancelAllButton } = actions;

        expect(collapseButton).toBeTruthy();
        expect(closeButton).toBeTruthy();
        expect(cancelAllButton).toBeFalsy();
        expect(fixture.componentInstance.isDialogMinimized).toBeFalsy();

        collapseButton.nativeElement.click();

        ({ header, actions } = getSnackbarDetails());
        ({ collapseButton } = header);
        ({ closeButton, cancelAllButton } = actions);

        expect(collapseButton).toBeTruthy();
        expect(closeButton).toBeTruthy();
        expect(cancelAllButton).toBeFalsy();
        expect(fixture.componentInstance.isDialogMinimized).toBeTruthy();

        closeButton.nativeElement.click();

        snackbar = getSnackbar();

        expect(snackbar).toBeFalsy();
    });

    it('should pass accessibility checks', async () => {
        mockUploadManagerService.queueChanged.next(generateMockUploadData(3));
        fixture.detectChanges();

        mockUploadSnackbarService.requestMaximize();
        fixture.detectChanges();

        const res = await a11yReport('.hxp-upload-snackbar');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
