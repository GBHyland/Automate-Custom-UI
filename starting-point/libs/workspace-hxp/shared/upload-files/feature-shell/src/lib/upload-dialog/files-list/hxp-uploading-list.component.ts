/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TranslationService } from '@alfresco/adf-core';

import { Component, ContentChild, Input, Output, TemplateRef, EventEmitter, inject } from '@angular/core';
import { FileModel, FileUploadStatus } from '../../model/file.model';
import { HxpUploadService } from '../../services/hxp-upload.service';
import { NgForOf } from '@angular/common';

@Component({
    standalone: true,
    selector: 'hxp-file-uploading-list',
    templateUrl: './hxp-uploading-list.component.html',
    styleUrls: ['./hxp-uploading-list.component.scss'],
    imports: [NgForOf],
})
export class HxpUploadingListComponent {
    @ContentChild(TemplateRef)
    template: any;

    @Input()
    files: FileModel[] = [];

    /** Emitted when a file in the list has an error. */
    @Output()
    errorUpload = new EventEmitter<any>();

    private uploadService: HxpUploadService = inject(HxpUploadService);
    private translateService: TranslationService = inject(TranslationService);

    /**
     * Cancel file upload
     *
     * @param file File model to cancel upload for.
     *
     * @memberOf FileUploadingListComponent
     */
    cancelFile(file: FileModel): void {
        this.uploadService.cancelUpload(file);
    }

    /**
     * Remove uploaded file
     *
     * @param file File model to remove upload for.
     *
     * @memberOf FileUploadingListComponent
     */
    removeFile(file: FileModel): void {
        if (file.status === FileUploadStatus.Error) {
            this.notifyError(file);
        }

        if (this.isUploadingFile(file)) {
            this.cancelNodeVersionInstances(file);
            this.uploadService.cancelUpload(file);
        }

        this.files = this.files.filter((entry) => entry !== file);
    }

    /**
     * Calls the appropriate methods for each file, depending on state
     */
    cancelAllFiles(): void {
        const filesToCancel = this.files.filter((file) => this.isUploadingFile(file));

        if (filesToCancel.length > 0) {
            this.uploadService.cancelUpload(...filesToCancel);
        }
    }

    /**
     * Checks if all the files are uploaded false if there is at least one file in Progress | Starting | Pending
     */
    isUploadCompleted(): boolean {
        return (
            !this.isUploadCancelled() &&
            this.files.length > 0 &&
            !this.files.some(
                ({ status }) => status === FileUploadStatus.Starting || status === FileUploadStatus.Progress || status === FileUploadStatus.Pending
            )
        );
    }

    /**
     * Check if all the files are Cancelled | Aborted | Error. false if there is at least one file in uploading states
     */
    isUploadCancelled(): boolean {
        return (
            this.files.length > 0 &&
            this.files.every(
                ({ status }) => status === FileUploadStatus.Aborted || status === FileUploadStatus.Cancelled || status === FileUploadStatus.Deleted
            )
        );
    }

    private cancelNodeVersionInstances(file: FileModel) {
        this.files
            .filter((item) => item.options.newVersion && item.data.entry.id === file.data.entry.id)
            .map((item) => {
                item.status = FileUploadStatus.Deleted;
            });
    }

    private notifyError(...files: FileModel[]) {
        let messageError = '';

        messageError =
            files.length === 1
                ? this.translateService.instant('FILE_UPLOAD.MESSAGES.REMOVE_FILE_ERROR', { fileName: files[0].name })
                : this.translateService.instant('FILE_UPLOAD.MESSAGES.REMOVE_FILES_ERROR', { total: files.length });

        this.errorUpload.emit(messageError);
    }

    private isUploadingFile(file: FileModel): boolean {
        return file.status === FileUploadStatus.Pending || file.status === FileUploadStatus.Starting || file.status === FileUploadStatus.Progress;
    }
}
