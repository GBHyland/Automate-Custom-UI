/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { FormAttachWidgetDialogServiceConfig, SharedAttachFileDialogService } from '@hxp/shared-hxp/services';
import { AttachFileDialogComponent } from '../attach-file-dialog.component';
import { FileDownloadService } from '@alfresco/adf-hx-content-services/services';

@Injectable()
export class AttachFileDialogService extends SharedAttachFileDialogService {
    constructor(private dialog: MatDialog, private fileDownloadService: FileDownloadService) {
        super();
    }

    openDialog(data: FormAttachWidgetDialogServiceConfig): void {
        this.dialog.open(AttachFileDialogComponent, {
            data,
            height: '70%',
            width: '66%',
        });
    }

    closeDialog(): void {
        this.dialog.closeAll();
    }

    downloadDocuments(documents: Document[]): void {
        this.fileDownloadService.downloadFile(documents);
    }
}
