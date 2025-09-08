/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService } from '@alfresco/adf-core';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit, HostBinding, ElementRef, ViewEncapsulation } from '@angular/core';
import { Subject } from 'rxjs';
import { Direction } from '@angular/cdk/bidi';
import { takeUntil, delay } from 'rxjs/operators';
import {
    UploadContentModel,
    UploadManagerService,
    UploadSnackbarService,
} from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { UploadSnackbarListRowComponent } from '../snackbar-list-row/upload-snackbar-list-row.component';
import { MatButtonModule } from '@angular/material/button';
import { UploadSnackbarListComponent } from '../snackbar-files-list/upload-snackbar-list.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    selector: 'hxp-upload-snackbar',
    templateUrl: './upload-snackbar.component.html',
    styleUrls: ['./upload-snackbar.component.scss'],
    imports: [NgIf, MatButtonModule, MatIconModule, MatProgressBarModule, UploadSnackbarListComponent, UploadSnackbarListRowComponent, TranslatePipe],
    encapsulation: ViewEncapsulation.None,
})
export class UploadSnackbarComponent implements OnInit, OnDestroy {
    /** Dialog position. Can be 'left' or 'right'. */
    @Input()
    position = 'right';

    uploadDataList: UploadContentModel[] = [];
    isDialogActive = false;
    totalCompleted = 0;
    totalErrors = 0;
    isDialogMinimized = false;
    isConfirmation = false;

    /** Dialog direction. Can be 'ltr' or 'rtl. */
    private direction: Direction = 'ltr';
    private onDestroy$ = new Subject<void>();
    private dialogActive = new Subject<boolean>();

    constructor(
        private uploadManagerService: UploadManagerService,
        private changeDetector: ChangeDetectorRef,
        private userPreferencesService: UserPreferencesService,
        private elementRef: ElementRef,
        private uploadSnackbarService: UploadSnackbarService
    ) {
        this.uploadSnackbarService.maximize$.pipe(takeUntilDestroyed()).subscribe(() => {
            this.maximize();
        });

        this.uploadSnackbarService.minimize$.pipe(takeUntilDestroyed()).subscribe(() => {
            this.minimize();
        });
    }

    @HostBinding('attr.adfUploadDialogRight')
    public get isPositionRight(): boolean {
        return (this.direction === 'ltr' && this.position === 'right') || (this.direction === 'rtl' && this.position === 'left');
    }

    @HostBinding('attr.adfUploadDialogLeft')
    public get isPositionLeft(): boolean {
        return (this.direction === 'ltr' && this.position === 'left') || (this.direction === 'rtl' && this.position === 'right');
    }

    ngOnInit() {
        this.dialogActive.pipe(delay(100), takeUntil(this.onDestroy$)).subscribe(() => {
            const element: any = this.elementRef.nativeElement.querySelector('#upload-dialog');
            if (element) {
                element.focus();
            }
        });

        this.uploadManagerService.queueChanged.pipe(takeUntil(this.onDestroy$)).subscribe((uploadList) => {
            const newUploads = uploadList.filter((upload) => !this.uploadDataList?.find((item) => item === upload));
            this.uploadDataList = [...this.uploadDataList, ...newUploads];

            if (this.isDialogActive) {
                this.scrollToActiveUpload();
            }
        });

        this.uploadManagerService.uploadCompleted.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            this.totalCompleted++;
            this.changeDetector.detectChanges();
            this.scrollToActiveUpload();
        });

        this.uploadManagerService.uploadError.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            this.totalErrors++;
            this.changeDetector.detectChanges();
            this.scrollToActiveUpload();
        });

        this.uploadManagerService.uploadRetried.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            this.totalErrors--;
            this.changeDetector.detectChanges();
        });

        this.userPreferencesService
            .select('textOrientation')
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((textOrientation: Direction) => {
                this.direction = textOrientation;
            });
    }

    scrollToActiveUpload() {
        const activeUploadIndex = this.uploadDataList.findIndex((upload) => this.isActiveUpload(upload));
        if (activeUploadIndex > 0) {
            this.scrollToIndex(activeUploadIndex);
        } else {
            const element = this.elementRef.nativeElement.querySelector('.hxp-upload-snackbar__content');
            if (element) {
                element.scrollTop = element.scrollHeight;
            }
        }
    }

    scrollToIndex(index: number) {
        const element = this.elementRef.nativeElement.querySelector(`#upload-row-${index}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
            this.scrollToBottom();
        }
    }

    scrollToBottom() {
        const element = this.elementRef.nativeElement.querySelector('.hxp-upload-snackbar__content');
        if (element) {
            element.scrollTop = element.scrollHeight;
        }
    }

    isActiveUpload(upload: UploadContentModel): boolean {
        return (
            this.uploadManagerService.isFileUploadOngoing(upload.fileModel) || this.uploadManagerService.isDocumentUpdatePending(upload.documentModel)
        );
    }

    /**
     * Toggle confirmation message.
     */
    toggleConfirmation() {
        this.isConfirmation = !this.isConfirmation;

        if (!this.isConfirmation) {
            this.dialogActive.next(true);
        }

        if (this.isDialogMinimized) {
            this.isDialogMinimized = false;
        }
    }

    /**
     * Cancel uploads and hide confirmation
     */
    cancelAllUploads() {
        this.dialogActive.next(true);
        this.uploadManagerService.cancelAllUploads();
        this.toggleConfirmation();
    }

    /**
     * Toggle dialog minimized state.
     */
    toggleMinimized(): void {
        this.isDialogMinimized = !this.isDialogMinimized;
        this.changeDetector.detectChanges();
    }

    /**
     * Maximize dialog.
     */
    maximize(): void {
        if (this.uploadDataList.length < 0) {
            return;
        }

        this.isDialogActive = true;
        this.dialogActive.next(this.isDialogActive);

        this.isDialogMinimized = false;
        this.changeDetector.detectChanges();
    }

    /**
     * Minimize dialog.
     */
    minimize(): void {
        this.isDialogMinimized = true;
        this.changeDetector.detectChanges();
    }

    /**
     * Dismiss dialog
     */
    close(): void {
        this.isConfirmation = false;
        this.totalCompleted = 0;
        this.totalErrors = 0;
        this.uploadDataList = [];
        this.isDialogActive = false;
        this.isDialogMinimized = false;
        this.uploadManagerService.clearQueue();
        this.changeDetector.detectChanges();
    }

    ngOnDestroy() {
        this.uploadManagerService.clearQueue();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    canShowDialog(): boolean {
        return this.isDialogActive;
    }

    canShowCancelAll(): boolean {
        return this.hasUploadInProgress();
    }

    canCloseDialog(): boolean {
        return !this.hasUploadInProgress();
    }

    hasUploadInProgress(): boolean {
        return this.uploadManagerService.isUploadOngoing();
    }
}
