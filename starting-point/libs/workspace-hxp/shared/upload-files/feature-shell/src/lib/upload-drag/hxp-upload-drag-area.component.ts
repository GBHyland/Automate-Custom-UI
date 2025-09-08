/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EXTENDIBLE_COMPONENT, FileInfo, FileUtils, NotificationService } from '@alfresco/adf-core';
import { Component, forwardRef, ViewEncapsulation, inject } from '@angular/core';
import { UploadBase } from '../base-upload/upload-base';
import { FileModel } from '../model/file.model';
import { HxpFileDraggableDirective } from '../directives/hxp-file-draggable.directive';

@Component({
    standalone: true,
    selector: 'hxp-upload-drag-area',
    templateUrl: './hxp-upload-drag-area.component.html',
    styleUrls: ['./hxp-upload-drag-area.component.scss'],
    host: { class: 'hxp-upload-drag-area' },
    viewProviders: [{ provide: EXTENDIBLE_COMPONENT, useExisting: forwardRef(() => HxpUploadDragAreaComponent) }],
    encapsulation: ViewEncapsulation.None,
    imports: [HxpFileDraggableDirective],
})
export class HxpUploadDragAreaComponent extends UploadBase {
    private notificationService: NotificationService = inject(NotificationService);

    /**
     * Method called when files are dropped in the drag area.
     *
     * @param files - files dropped in the drag area.
     */
    onFilesDropped(files: File[]): void {
        if (!this.disabled && files.length > 0) {
            this.uploadFiles(files);
        }
    }

    /**
     * Called when a folder are dropped in the drag area
     *
     * @param folder - name of the dropped folder
     */
    async onFolderEntityDropped(folder: any): Promise<void> {
        if (!this.disabled && folder.isDirectory) {
            const filesInfo = await FileUtils.flatten(folder);
            this.uploadFilesInfo(filesInfo);
        }
    }

    /**
     * Show undo notification bar.
     *
     * @param latestFilesAdded - files in the upload queue enriched with status flag and xhr object.
     */
    showUndoNotificationBar(latestFilesAdded: FileModel[]) {
        const messageTranslate = this.translationService.instant('FILE_UPLOAD.MESSAGES.PROGRESS');
        const actionTranslate = this.translationService.instant('FILE_UPLOAD.ACTION.UNDO');

        this.notificationService
            .openSnackMessageAction(messageTranslate, actionTranslate)
            .onAction()
            .subscribe(() => {
                this.uploadService.cancelUpload(...latestFilesAdded);
            });
    }

    /** Returns true or false considering the component options and node permissions */
    isDroppable(): boolean {
        return !this.disabled;
    }

    /**
     * Handles 'upload-files' events raised by child components.
     *
     * @param event DOM event
     */
    onUploadFiles(event: CustomEvent) {
        event.stopPropagation();
        event.preventDefault();

        const fileInfo: FileInfo[] = event.detail.files;

        if (this.isTargetNodeFolder(event)) {
            const destinationFolderName = event.detail.data.obj.entry.name;
            fileInfo.map(
                (file) => (file.relativeFolder = destinationFolderName ? destinationFolderName.concat(file.relativeFolder) : file.relativeFolder)
            );
        }

        if (fileInfo && fileInfo.length > 0) {
            this.uploadFilesInfo(fileInfo);
        }
    }

    private isTargetNodeFolder(event: CustomEvent): boolean {
        return event.detail.data.obj && event.detail.data.obj.entry.isFolder;
    }
}
