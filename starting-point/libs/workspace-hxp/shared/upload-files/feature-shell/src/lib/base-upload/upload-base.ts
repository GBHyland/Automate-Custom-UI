/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FileInfo, TranslationService } from '@alfresco/adf-core';
import { HxpUploadService } from '../services/hxp-upload.service';
import { EventEmitter, Input, Output, OnInit, NgZone, Directive, inject, DestroyRef } from '@angular/core';
import { FileModel } from '../model/file.model';
import { FileUploadErrorEvent } from '../events/file.event';
import { UploadFilesEvent } from '../events/upload-files.event';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { UploadSuccessData } from '@hxp/shared-hxp/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class UploadBase implements OnInit {
    /** Sets a limit on the maximum size (in bytes) of a file to be uploaded.
     * Has no effect if undefined.
     * Set maximum file size as 4GB which is same as HXPR (quarkus.http.limits.max-body-size in the application.properties file).
     */
    @Input()
    maxFilesSize = 4294967296;

    /** The ID of the root. Use the nodeId for
     * Content Services or the taskId/processId for Process Services.
     */
    @Input()
    rootFolderId = ROOT_DOCUMENT.sys_id;

    /** Toggles component disabled state (if there is no node permission checking).
     *  'undefined' instead of false sine mat-buttons does not work well with 'false'
     */
    @Input()
    disabled?: true | undefined = undefined;
    /** Toggles component disabled state (if there is no node permission checking). */

    /** Filter for accepted file types. */
    @Input()
    acceptedFilesType = '*';

    /** Emitted when the file is uploaded successfully. */
    @Output()
    successUpload = new EventEmitter<UploadSuccessData>();

    /** Emitted when an error occurs. */
    @Output()
    errorUpload = new EventEmitter<FileUploadErrorEvent>();

    /** Emitted when the upload begins. */
    @Output()
    beginUpload = new EventEmitter<UploadFilesEvent>();

    /** Emitted when dropping a file over another file to update the version. */
    @Output()
    updateFileVersion = new EventEmitter<CustomEvent>();

    protected readonly destroyRef = inject(DestroyRef);
    private totalError = 0;

    private ngZone: NgZone = inject(NgZone);
    protected uploadService: HxpUploadService = inject(HxpUploadService);
    protected translationService: TranslationService = inject(TranslationService);

    ngOnInit() {
        this.uploadService.fileUploadError.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((error) => this.errorUpload.emit(error));
        this.uploadService.fileUploadSuccess.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((event) => this.successUpload.emit(event));
    }

    /**
     * Upload a list of file in the specified path
     *
     * @param files
     */
    uploadFiles(files: File[]): void {
        const filteredFiles: FileModel[] = files.map<FileModel>((file: File) =>
            this.createFileModel(file, this.rootFolderId, ((file as any).webkitRelativePath || '').replace(/\/[^/]*$/, ''))
        );

        this.uploadQueue(filteredFiles);
    }

    uploadFilesInfo(files: FileInfo[]): void {
        const filteredFiles: FileModel[] = files
            .filter((fileInfo): fileInfo is Required<FileInfo> => !!fileInfo.file)
            .map<FileModel>((fileInfo) => this.createFileModel(fileInfo.file, this.rootFolderId, fileInfo.relativeFolder));

        this.uploadQueue(filteredFiles);
    }

    /**
     * Checks if the given file is allowed by the extension filters
     *
     * @param file FileModel
     */
    protected isFileAcceptable(file: FileModel): boolean {
        if (this.acceptedFilesType === '*') {
            return true;
        }

        const allowedExtensions = this.acceptedFilesType.split(',').map((ext) => ext.trim().replace(/^\./, ''));

        return allowedExtensions.includes(file.extension);
    }

    /**
     * Creates FileModel from File
     *
     * @param file
     * @param parentId
     * @param path
     * @param id
     */
    protected createFileModel(file: File, parentId: string, path: string, id?: string): FileModel {
        return new FileModel(
            file,
            {
                parentId,
                path,
            },
            id
        );
    }

    protected isFileSizeAllowed(file: FileModel) {
        let isFileSizeAllowed = true;
        if (this.isMaxFileSizeDefined()) {
            isFileSizeAllowed = this.isFileSizeCorrect(file);
        }

        return isFileSizeAllowed;
    }

    protected isMaxFileSizeDefined() {
        return this.maxFilesSize !== undefined && this.maxFilesSize !== null;
    }

    protected isFileSizeCorrect(file: FileModel) {
        const isDefined = this.isMaxFileSizeDefined();
        if (isDefined) {
            const maxFilesSize = this.maxFilesSize as number;
            return maxFilesSize >= 0 && file.size <= maxFilesSize;
        }

        return true;
    }

    private uploadQueue(files: FileModel[]) {
        const filteredFiles = files.filter(this.isFileAcceptable.bind(this)).filter(this.isFileSizeAcceptable.bind(this));

        this.ngZone.run(() => {
            const event = new UploadFilesEvent([...filteredFiles], this.uploadService);
            this.beginUpload.emit(event);

            if (!event.defaultPrevented && filteredFiles.length > 0) {
                this.uploadService.addToQueue(...filteredFiles);
                this.uploadService.uploadFilesInTheQueue();
            }
        });
    }

    /**
     * Checks if the given file is an acceptable size
     *
     * @param file FileModel
     */
    protected isFileSizeAcceptable(file: FileModel): boolean {
        let acceptableSize = true;

        if (!this.isFileSizeAllowed(file)) {
            acceptableSize = false;

            const message = this.translationService.instant('FILE_UPLOAD.MESSAGES.EXCEED_MAX_FILE_SIZE', { fileName: file.name });
            const errorEvent = new FileUploadErrorEvent(file, message, this.totalError++);
            this.errorUpload.emit(errorEvent);
        }

        return acceptableSize;
    }
}
