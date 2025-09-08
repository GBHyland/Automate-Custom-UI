/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FileModel, UploadHxpButtonComponent } from '@hxp/workspace-hxp/shared/upload-files/feature-shell';
import { ActionContext } from '@alfresco/adf-hx-content-services/services';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { UploadDialogService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';

@Component({
    selector: 'hxp-workspace-upload-file-button',
    standalone: true,
    imports: [NgIf, MatIconModule, MatMenuModule, TranslatePipe],
    templateUrl: './upload-button.component.html',
    styleUrls: ['./upload-button.component.scss'],
})
export class UploadFileButtonComponent extends UploadHxpButtonComponent {
    @Input() isAvailable = true;
    @Input() data: ActionContext = { documents: [] };

    constructor(protected uploadDialogService: UploadDialogService) {
        super();
    }

    uploadFiles(files: File[]): void {
        if (!this.isAvailable) {
            return;
        }

        const filteredFiles: FileModel[] = files
            .map<FileModel>((file: File) =>
                this.createFileModel(file, this.rootFolderId, ((file as any).webkitRelativePath || '').replace(/\/[^/]*$/, ''))
            )
            .filter(this.isFileAcceptable.bind(this))
            .filter(this.isFileSizeAcceptable.bind(this));

        this.uploadDialogService.uploadFiles(filteredFiles);
    }
}
