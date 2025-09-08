/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject, Input, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subject, merge } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Document } from '@hylandsoftware/hxcs-js-client';
import {
    UploadContentModel,
    UploadDialogService,
    UploadSnackbarService,
} from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { ContentUploadListComponent } from '../upload-list/upload-list.component';
import { ContentUploadPropertiesEditorComponent } from '../upload-properties-editor/upload-properties-editor.component';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    standalone: true,
    selector: 'hxp-workspace-content-upload-dialog',
    templateUrl: './upload-dialog.component.html',
    styleUrls: ['./upload-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [NgIf, TranslatePipe, MatButtonModule, ContentUploadListComponent, ContentUploadPropertiesEditorComponent],
})
export class ContentUploadDialogComponent implements OnInit, OnDestroy {
    @Input()
    currentDocument: Document = undefined;

    @ViewChild('uploadList')
    uploadDataList?: ContentUploadListComponent;

    @ViewChild('uploadPropertiesEditor')
    propertiesEditor?: ContentUploadPropertiesEditorComponent;

    protected data: UploadContentModel[] = [];
    protected isDialogActive = false;
    protected canFinishUpload = false;
    protected uploadRequestsToUpdate: UploadContentModel[];
    private onDestroy$ = new Subject<void>();

    private uploadDialogService = inject(UploadDialogService);
    private uploadSnackbarService = inject(UploadSnackbarService);

    ngOnInit() {
        this.uploadDialogService.newUploads.pipe(takeUntil(this.onDestroy$)).subscribe({
            next: (uploadList: UploadContentModel[]) => {
                this.data = uploadList;
                for (const item of this.data) {
                    item.documentModel.document.sys_parentPath = this.currentDocument?.sys_path;
                }

                if (uploadList.length > 0 && !this.isDialogActive) {
                    this.isDialogActive = true;
                    this.uploadSnackbarService.requestMinimize();
                }
            },
        });

        merge([this.uploadDialogService.uploadError, this.uploadDialogService.uploadCanceled])
            .pipe(takeUntil(this.onDestroy$))
            .subscribe({
                next: () => (this.canFinishUpload = this.isUploadValid()),
            });
    }

    ngOnDestroy() {
        this.uploadDialogService.clearQueue();
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    /**
     * Cancels all the current ongoing upload requests.
     * Previous uploads will continue on background, reporting updates to the UI.
     */
    cancelAllUploads() {
        for (const model of this.data) {
            this.uploadDialogService.cancelUpload(model);
            this.uploadDialogService.removeFromQueue(model);
        }
    }

    /**
     * Cancels a single upload request.
     */
    cancelUpload(model: UploadContentModel): void {
        this.uploadDialogService.cancelUpload(model);
    }
    /**
     * Closes the dialog and dismisses any pending upload if necessary.
     */
    close(cancelOngoingRequests: boolean) {
        if (cancelOngoingRequests) {
            this.cancelAllUploads();
        }

        this.data = [];
        this.isDialogActive = false;
        this.uploadRequestsToUpdate = undefined;
        this.canFinishUpload = false;
    }

    /**
     * Helper that sets the upload requests to be edited.
     */
    onUploadSelection(uploadList: UploadContentModel[]): void {
        this.uploadRequestsToUpdate = uploadList;
        this.propertiesEditor.refresh();
        this.canFinishUpload = this.isUploadValid();
    }

    /**
     * Helper that deletes the provided upload requests.
     */
    onUploadDelete(uploadList: UploadContentModel[]): void {
        for (const model of uploadList) {
            this.cancelUpload(model);
            const idx = this.data.indexOf(model);
            if (idx >= 0) {
                this.data.splice(idx, 1);
            }
        }
        this.canFinishUpload = this.isUploadValid();
    }

    /**
     * Helper that retries the fails upload requests.
     */
    onUploadRetry(uploadList: UploadContentModel[]): void {
        for (const model of uploadList) {
            this.uploadDialogService.retryUpload(model);
        }
        this.canFinishUpload = this.isUploadValid();
    }

    /**
     * Helper that updates the upload requests.
     */
    onUploadUpdate(): void {
        this.uploadDataList.update();
        this.canFinishUpload = this.isUploadValid();
    }

    /**
     * Finishes the upload process and close the dialog.
     * Any pending request will continue on background, reporting updates to the UI.
     */
    uploadContent() {
        this.uploadDialogService.completeQueuedUploads();
        this.close(false);
    }

    /**
     * Helper that validates if the upload requests are valid.
     * Note: this will be refactored once we have a proper properties editor.
     */
    private isUploadValid(): boolean {
        return (
            this.data.length > 0 &&
            this.data.every(
                (item) =>
                    item.documentModel.document.sys_primaryType !== '' &&
                    item.documentModel.document.sys_path !== '' &&
                    !this.uploadDialogService.isFileUploadCanceled(item.fileModel) &&
                    !this.uploadDialogService.isFileUploadErrored(item.fileModel) &&
                    !this.uploadDialogService.isFileUploadAborted(item.fileModel)
            )
        );
    }
}
