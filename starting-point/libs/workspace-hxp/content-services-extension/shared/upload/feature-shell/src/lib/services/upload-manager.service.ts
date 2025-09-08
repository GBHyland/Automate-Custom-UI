/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { FileModel, FileUploadCompleteEvent, FileUploadStatus, HxpUploadService } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { UploadDocumentModel, UploadDocumentModelStatus } from '../model/upload-document.model';
import { UploadContentModel } from '../model/upload-content.model';
import { UploadSnackbarService } from './upload-snackbar.service';
import { NoopUploadActionStrategy } from '../document-update-strategies/noop-action-strategy';
import { UploadActionStrategy } from '../document-update-strategies/upload-action-strategy';
import { UploadDocumentRequestModel } from '../model/upload-document-request.model';
import { UploadFileOptions } from '../model/upload-file-options.model';

@Injectable({
    providedIn: 'root',
})
export class UploadManagerService {
    cache: Map<FileModel, UploadContentModel> = new Map();
    queue: UploadContentModel[] = [];

    queueChanged: Subject<UploadContentModel[]> = new Subject<UploadContentModel[]>();
    uploadCanceled: Subject<UploadContentModel> = new Subject<UploadContentModel>();
    uploadCompleted: Subject<UploadContentModel> = new Subject<UploadContentModel>();
    uploadError: Subject<UploadContentModel> = new Subject<UploadContentModel>();
    uploadProgress: Subject<UploadContentModel> = new Subject<UploadContentModel>();
    uploadRetried: Subject<UploadContentModel> = new Subject<UploadContentModel>();

    constructor(
        private noopUploadActionStrategy: NoopUploadActionStrategy,
        private uploadService: HxpUploadService,
        private uploadSnackbarService: UploadSnackbarService
    ) {
        this.uploadService.fileUploadError.subscribe((event) => this.emitObservable(event.file, this.uploadError));

        this.uploadService.fileUploadCancelled.subscribe((event) => this.emitObservable(event.file, this.uploadCanceled));

        this.uploadService.fileUploadProgress.subscribe((event) => this.emitObservable(event.file, this.uploadProgress));
    }

    /**
     * Creates a new UploadContentModel with the specified FileModel, action and options (if available).
     * @param fileModel the file model of the upload
     * @param postFileUploadAction the action to execute after the file upload is completed
     * @param uploadOptions the options for the upload
     * @returns the upload content model
     */
    public createUploadModel(
        fileModel: FileModel,
        postFileUploadAction: UploadActionStrategy = this.noopUploadActionStrategy,
        uploadOptions?: UploadFileOptions
    ): UploadContentModel {
        const document: Document = uploadOptions?.document ?? {
            sys_primaryType: '',
            sys_parentId: fileModel.options.parentId,
            sys_title: fileModel.name,
            sysfile_blob: {
                uploadId: '',
            },
        };

        return {
            fileModel,
            documentModel: new UploadDocumentModel(document),
            postFileUploadAction,
        } as UploadContentModel;
    }

    /**
     * Adds the file model to the upload queue.
     *
     * @param fileModel the file model to add to the queue
     */
    public addToQueue(upload: UploadContentModel): void {
        this.queue.push(upload);
        this.queueChanged.next(this.queue);
    }

    /**
     * Initiates the upload process for the specified upload model.
     *
     * @param upload the upload model to initiate
     * @returns the upload model
     */
    public initiateUpload(upload: UploadContentModel): Observable<UploadContentModel> {
        return new Observable<UploadContentModel>((observer) => {
            if (this.isFileUploadCompleted(upload.fileModel)) {
                observer.next(upload);
                observer.complete();
                return;
            }

            this.uploadService.fileUploadComplete.pipe(filter((event: FileUploadCompleteEvent) => event.file === upload.fileModel)).subscribe({
                next: () => {
                    this.updateBlobId(upload);
                    observer.next(upload);
                    observer.complete();
                },
                error: (err) => observer.error(err),
            });

            this.uploadService.addToQueue(upload.fileModel);
            this.uploadService.uploadFilesInTheQueue();
        });
    }

    /**
     * Completes the upload process for the specified upload model.
     *
     * @param upload the upload model to complete
     * @returns the upload model
     */
    public completeUpload(upload: UploadContentModel): Observable<UploadContentModel> {
        this.uploadSnackbarService.requestMaximize();

        return new Observable<UploadContentModel>((observer) => {
            this.initiateUpload(upload)
                .pipe(map((uploadModel: UploadContentModel) => this.createOngoingUpload(uploadModel)))
                .subscribe({
                    next: (result: UploadDocumentRequestModel) => {
                        this.finishOngoingUpload(result).subscribe({
                            next: () => {
                                observer.next(upload);
                                observer.complete();
                            },
                            error: (err: any) => {
                                console.error('Error completing ongoing uploads:', err);
                                observer.error(err);
                            },
                        });
                    },
                    error: (err: any) => {
                        console.error('Error uploading file:', err);
                        observer.error(err);
                    },
                });
        });
    }

    /**
     * Cancels all uploads in the queue.
     */
    public cancelAllUploads(): void {
        for (const item of this.getQueue()) {
            this.cancelUpload(item);
        }
        this.clearQueue();
        this.uploadService.clearQueue();
    }

    /**
     * Cancels a single upload request.
     *
     * @param uploadModel the upload to cancel
     */
    public cancelUpload(uploadModel: UploadContentModel): void {
        // if the upload is completed, or the file upload was already canceled, then there's nothing to do here
        const { fileModel } = uploadModel;
        if (this.isUploadCompleted(uploadModel) || this.isFileUploadCanceled(fileModel)) {
            this.uploadCanceled.next(uploadModel);
            return;
        }

        // if the file is still being uploaded, we just need to cancel this one
        if (this.isFileUploadCompleted(fileModel)) {
            // if the file was already uploaded, at this moment, there's nothing we can do unless delete the blob
            this.uploadService.deleteUpload(fileModel);
            this.uploadCanceled.next(uploadModel);
        } else {
            this.uploadService.cancelUpload(fileModel);
        }
    }

    /**
     * Completes all ongoing uploads in background.
     */
    public completeQueuedUploads(): void {
        if (this.queue.length === 0) {
            return;
        }

        this.uploadSnackbarService.requestMaximize();
        this.queue
            .filter((upload: UploadContentModel) => !this.isUploadCompleted(upload))
            .forEach((upload: UploadContentModel) =>
                this.upload(upload).subscribe({
                    error: (err) => console.error('Error completing queued upload:', err),
                })
            );
    }

    /**
     * Retries a single upload request.
     * If the file upload failed, then we will retry the file upload.
     * If the document creation failed, then we will retry the document creation.
     */
    public retryUpload(upload: UploadContentModel): void {
        const { fileModel, documentModel } = upload;
        if (this.isFileUploadErrored(fileModel)) {
            this.uploadService.retryUpload(fileModel);
            this.uploadRetried.next(upload);
        } else if (this.isDocumentUpdateErrored(documentModel)) {
            if (!this.cache.has(fileModel)) {
                return;
            }

            documentModel.status = UploadDocumentModelStatus.PENDING;
            this.completeUpload(upload).subscribe({
                error: (err) => console.error('Error during document creation retry:', err),
            });
            this.uploadRetried.next(upload);
        }
    }

    /**
     * Clears the queue.
     */
    public clearQueue() {
        this.queue = [];
        this.queueChanged.next(this.queue);
    }

    /**
     * Gets the current upload queue.
     *
     * @returns the upload queue
     */
    public getQueue(): UploadContentModel[] {
        return this.queue;
    }

    /**
     * Remote the request upload model from the queue.
     *
     * @param model the upload model to remove from the queue
     */
    public removeFromQueue(model: UploadContentModel): void {
        const index = this.queue.indexOf(model);
        if (index > -1) {
            this.queue.splice(index, 1);
            this.queueChanged.next(this.queue);
        }
    }

    /**
     * Checks if the upload was aborted by the user.
     *
     * @param the upload to check if it was aborted
     */
    public isUploadAborted(model: UploadContentModel): boolean {
        return this.isFileUploadAborted(model.fileModel) || this.isDocumentUpdateErrored(model.documentModel);
    }

    /**
     * Checks if the upload was canceled by the user.
     */
    public isUploadCanceled(model: UploadContentModel): boolean {
        return this.isFileUploadCanceled(model.fileModel);
    }

    /**
     * Checks if the upload has completed.
     * @param model the upload to check
     */
    public isUploadCompleted(model: UploadContentModel): boolean {
        return this.isFileUploadCompleted(model.fileModel) && this.isDocumentUpdateCompleted(model.documentModel);
    }

    /**
     * Checks if the upload has errored.
     */
    public isUploadErrored(model: UploadContentModel): boolean {
        return this.isFileUploadErrored(model.fileModel) || this.isDocumentUpdateErrored(model.documentModel);
    }

    /**
     * Checks if the upload is still pending.
     */
    public isUploadPending(model: UploadContentModel): boolean {
        return this.isFileUploadPending(model.fileModel) || this.isDocumentUpdatePending(model.documentModel);
    }

    public isDocumentUpdateCompleted(documentModel: UploadDocumentModel): boolean {
        return documentModel.status === UploadDocumentModelStatus.COMPLETED;
    }

    public isDocumentUpdateErrored(documentModel: UploadDocumentModel): boolean {
        return documentModel.status === UploadDocumentModelStatus.ERRORED;
    }

    public isDocumentUpdatePending(documentModel: UploadDocumentModel): boolean {
        return documentModel.status === UploadDocumentModelStatus.PENDING;
    }

    public isFileUploadCompleted(fileModel: FileModel): boolean {
        return fileModel.status === FileUploadStatus.Complete;
    }

    public isFileUploadPending(fileModel: FileModel): boolean {
        return fileModel.status === FileUploadStatus.Pending;
    }

    public isFileUploadAborted(fileModel: FileModel): boolean {
        return fileModel.status === FileUploadStatus.Aborted;
    }

    public isFileUploadCanceled(fileModel: FileModel): boolean {
        return fileModel.status === FileUploadStatus.Cancelled;
    }

    public isFileUploadErrored(fileModel: FileModel): boolean {
        return fileModel.status === FileUploadStatus.Error;
    }

    public isFileUploadOngoing(fileModel: FileModel): boolean {
        const { status } = fileModel;
        return status === FileUploadStatus.Starting || status === FileUploadStatus.Progress || status === FileUploadStatus.Pending;
    }

    public isUploadOngoing() {
        return this.queue.some(
            (upload) =>
                !this.isUploadCompleted(upload) && !this.isUploadAborted(upload) && !this.isUploadCanceled(upload) && !this.isUploadErrored(upload)
        );
    }

    /**
     * Upload the file and run the post file upload action, if specified.
     *
     * @param upload the model to upload
     */
    private upload(upload: UploadContentModel): Observable<UploadContentModel> {
        this.uploadSnackbarService.requestMaximize();

        return new Observable<UploadContentModel>((observer) => {
            this.initiateUpload(upload)
                .pipe(map((uploadModel: UploadContentModel) => this.createOngoingUpload(uploadModel)))
                .subscribe({
                    next: (result: UploadDocumentRequestModel) => {
                        this.finishOngoingUpload(result).subscribe({
                            next: () => {
                                observer.next(upload);
                                observer.complete();
                            },
                            error: (err: any) => {
                                console.error('Error completing ongoing uploads:', err);
                                observer.error(err);
                            },
                        });
                    },
                    error: (err: any) => {
                        console.error('Error uploading file:', err);
                        observer.error(err);
                    },
                });
        });
    }

    /**
     * Creates an UploadDocumentCreationRequest object based on the specified UploadContentModel.
     * The goal is to delay any update document update request until the file upload is completed.
     */
    private createOngoingUpload(upload: UploadContentModel): UploadDocumentRequestModel {
        return {
            model: upload,
            documentUpdate$: upload.postFileUploadAction?.execute(upload),
        };
    }

    /**
     * Finishes the upload process by subscribing to the the document creation observable.
     */
    private finishOngoingUpload(result: UploadDocumentRequestModel): Observable<void> {
        return new Observable<void>((observer) => {
            result.documentUpdate$.subscribe({
                next: (doc: Document) => {
                    if (this.cache.has(result.model.fileModel)) {
                        this.cache.delete(result.model.fileModel);
                    }
                    result.model.documentModel.document = doc;
                    result.model.documentModel.status = UploadDocumentModelStatus.COMPLETED;
                    this.uploadCompleted.next(result.model);
                    observer.next();
                    observer.complete();
                },
                error: () => {
                    result.model.documentModel.status = UploadDocumentModelStatus.ERRORED;
                    if (!this.cache.has(result.model.fileModel)) {
                        this.cache.set(result.model.fileModel, result.model);
                    }
                    this.uploadError.next(result.model);
                    observer.error();
                },
            });
        });
    }

    /**
     * Updates the blob ID in the document model after upload.
     * @param upload The upload model.
     */
    private updateBlobId(upload: UploadContentModel): void {
        const document = upload.documentModel.document;
        document.sysfile_blob.uploadId = upload.fileModel.data.id;
    }

    private emitObservable(fileModel: FileModel, observable: Subject<UploadContentModel>) {
        const uploadModel = this.findUploadContentModel(fileModel);
        if (uploadModel) {
            observable.next(uploadModel);
        }
    }

    private findUploadContentModel(fileModel: FileModel): UploadContentModel {
        return this.queue.find((upload) => upload.fileModel === fileModel);
    }
}
