/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserPreferencesService } from '@alfresco/adf-core';
import {
    ChangeDetectorRef,
    Component,
    Input,
    Output,
    EventEmitter,
    OnDestroy,
    OnInit,
    ViewChild,
    HostBinding,
    ElementRef,
    ViewEncapsulation,
} from '@angular/core';
import { merge, Subject } from 'rxjs';
import { Direction } from '@angular/cdk/bidi';
import { takeUntil, delay } from 'rxjs/operators';
import { HxpUploadService } from '../../services/hxp-upload.service';
import { FileUploadCompleteEvent, FileUploadDeleteEvent } from '../../events/file.event';
import { FileModel } from '../../model/file.model';
import { HxpUploadingListComponent } from '../files-list/hxp-uploading-list.component';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { HxpUploadingListRowComponent } from '../list-row/hxp-uploading-list-row.component';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'hxp-file-uploading-dialog',
    templateUrl: './hxp-uploading-dialog.component.html',
    styleUrls: ['./hxp-uploading-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [NgIf, TranslatePipe, MatIconModule, MatButtonModule, HxpUploadingListComponent, HxpUploadingListRowComponent],
})
export class HxpUploadingDialogComponent implements OnInit, OnDestroy {
    @ViewChild('uploadList')
    uploadList?: HxpUploadingListComponent;

    /** Dialog position. Can be 'left' or 'right'. */
    @Input()
    position = 'right';

    /** Makes the dialog always visible even when there are no uploads. */
    @Input()
    alwaysVisible = false;

    /** Emitted when a file in the list has an error. */
    @Output()
    errorUpload = new EventEmitter<any>();

    filesUploadingList: FileModel[] = [];
    isDialogActive = false;
    totalCompleted = 0;
    totalErrors = 0;
    isDialogMinimized = false;
    isConfirmation = false;

    /** Dialog direction. Can be 'ltr' or 'rtl. */
    private direction: Direction = 'ltr';
    private onDestroy$ = new Subject<void>();

    private dialogActive = new Subject<void>();

    constructor(
        private uploadService: HxpUploadService,
        private changeDetector: ChangeDetectorRef,
        private userPreferencesService: UserPreferencesService,
        private elementRef: ElementRef
    ) {}

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

        this.uploadService.queueChanged.pipe(takeUntil(this.onDestroy$)).subscribe((fileList) => {
            this.filesUploadingList = fileList;

            if (this.filesUploadingList.length > 0 && !this.isDialogActive) {
                this.isDialogActive = true;
                this.dialogActive.next();
            } else {
                this.dialogActive.next();
            }
        });

        merge(this.uploadService.fileUploadComplete, this.uploadService.fileUploadDeleted)
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((event: FileUploadCompleteEvent | FileUploadDeleteEvent) => {
                this.totalCompleted = event.totalComplete;
                this.changeDetector.detectChanges();
            });

        this.uploadService.fileUploadError.pipe(takeUntil(this.onDestroy$)).subscribe((event) => {
            this.totalErrors = event.totalError;
            this.changeDetector.detectChanges();
        });

        this.uploadService.fileUpload.pipe(takeUntil(this.onDestroy$)).subscribe(() => {
            this.changeDetector.detectChanges();
        });

        this.userPreferencesService
            .select('textOrientation')
            .pipe(takeUntil(this.onDestroy$))
            .subscribe((textOrientation: Direction) => {
                this.direction = textOrientation;
            });
    }

    /**
     * Toggle confirmation message.
     */
    toggleConfirmation() {
        this.isConfirmation = !this.isConfirmation;

        if (!this.isConfirmation) {
            this.dialogActive.next();
        }

        if (this.isDialogMinimized) {
            this.isDialogMinimized = false;
        }
    }

    /**
     * Cancel uploads and hide confirmation
     */
    cancelAllUploads() {
        this.toggleConfirmation();
        this.dialogActive.next();
        this.uploadList?.cancelAllFiles();
    }

    /**
     * Toggle dialog minimized state.
     */
    toggleMinimized(): void {
        this.isDialogMinimized = !this.isDialogMinimized;
        this.changeDetector.detectChanges();
    }

    /**
     * Dismiss dialog
     */
    close(): void {
        this.isConfirmation = false;
        this.totalCompleted = 0;
        this.totalErrors = 0;
        this.filesUploadingList = [];
        this.isDialogActive = false;
        this.isDialogMinimized = false;
        this.uploadService.clearQueue();
        this.changeDetector.detectChanges();
    }

    ngOnDestroy() {
        this.uploadService.clearQueue();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    canShowDialog(): boolean {
        return this.isDialogActive || this.alwaysVisible;
    }

    canShowCancelAll(): boolean {
        return !!this.filesUploadingList?.length && this.hasUploadInProgress();
    }

    canCloseDialog(): boolean {
        return !this.hasUploadInProgress() && !this.alwaysVisible;
    }

    hasUploadInProgress(): boolean {
        return !this.uploadList?.isUploadCompleted() && !this.uploadList?.isUploadCancelled();
    }
}
