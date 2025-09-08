/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { downloadNotificationMessages } from './configs/download-notification-messages.config';
import { downloadSnackBarTypes } from './configs/download-snack-bar-types.model';
import { SingleFileDownloadService } from './single-file-download.service';
import { HxpNotificationService } from '../notification/hxp-notification.service';
import { DownloadStatus } from './models/download-status.enum';
import { IsSingleDocumentWithMainBlobService } from '../is-single-document-with-main-blob/is-single-document-with-main-blob.service';

@Injectable({ providedIn: 'root' })
export class FileDownloadService {
    constructor(
        private singleFileDownloadService: SingleFileDownloadService,
        private hxpNotificationService: HxpNotificationService,
        private isSingleDocumentWithMainBlobService: IsSingleDocumentWithMainBlobService
    ) {}

    downloadFile(hxpSingleFileDownload: Document[]) {
        if (this.isSingleDocumentWithMainBlobService.validate(hxpSingleFileDownload)) {
            this.singleFileDownloadService.download(hxpSingleFileDownload[0]).subscribe({
                next: (status) => {
                    this.displayNotificationMessage(status);
                },
                error: () => {
                    this.displayNotificationMessage(DownloadStatus.ERROR);
                },
            });
        }
    }

    private displayNotificationMessage(status: DownloadStatus) {
        this.hxpNotificationService.openSnackBar(downloadNotificationMessages[status], downloadSnackBarTypes[status]);
    }
}
