/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EXTENDIBLE_COMPONENT, FileInfo } from '@alfresco/adf-core';
import { Component, forwardRef, inject, ViewEncapsulation } from '@angular/core';
import { FileModel, HxpFileDraggableDirective, HxpUploadDragAreaComponent } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { UploadDialogService } from '../services/upload-dialog.service';

@Component({
    standalone: true,
    selector: 'hxp-content-upload-drag-area',
    templateUrl: './hxp-content-upload-drag-area.component.html',
    styleUrls: ['./hxp-content-upload-drag-area.component.scss'],
    host: { class: 'hxp-content-upload-drag-area' },
    viewProviders: [{ provide: EXTENDIBLE_COMPONENT, useExisting: forwardRef(() => HxpUploadDragAreaComponent) }],
    encapsulation: ViewEncapsulation.None,
    imports: [HxpFileDraggableDirective],
})
export class ContentUploadDragAreaComponent extends HxpUploadDragAreaComponent {
    protected uploadDialogService = inject(UploadDialogService);

    uploadFiles(files: File[]): void {
        const filteredFiles: FileModel[] = files
            .map<FileModel>((file: File) =>
                this.createFileModel(file, this.rootFolderId, ((file as any).webkitRelativePath || '').replace(/\/[^/]*$/, ''))
            )
            .filter(this.isFileAcceptable.bind(this))
            .filter(this.isFileSizeAcceptable.bind(this));

        this.uploadDialogService.uploadFiles(filteredFiles);
    }

    uploadFilesInfo(files: FileInfo[]): void {
        const filteredFiles: FileModel[] = files
            .filter((fileInfo): fileInfo is Required<FileInfo> => !!fileInfo.file)
            .map<FileModel>((fileInfo) => this.createFileModel(fileInfo.file, this.rootFolderId, fileInfo.relativeFolder));

        this.uploadDialogService.uploadFiles(filteredFiles);
    }
}
