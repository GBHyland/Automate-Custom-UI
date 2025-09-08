/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DownloadService } from '@alfresco/adf-core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, switchMap, take, tap } from 'rxjs/operators';
import { BlobDownloadService } from '../blob-download/blob-download.service';
import { DownloadStatus } from './models/download-status.enum';

@Injectable({
    providedIn: 'root',
})
export class SingleFileDownloadService {
    constructor(private downloadService: DownloadService, private blobDownloadService: BlobDownloadService) {}

    download(document: Document): Observable<DownloadStatus> {
        const initialDownloadStatus = DownloadStatus.ERROR;
        const downloadStatusSubject: BehaviorSubject<DownloadStatus> = new BehaviorSubject<DownloadStatus>(initialDownloadStatus);

        of(document)
            .pipe(
                take(1),
                filter(({ sys_id, sysfile_blob }) => sys_id && sysfile_blob?.filename),
                tap(() => this.emitDownloadStatusRequest(downloadStatusSubject)),
                switchMap(({ sys_id }) => this.blobDownloadService.downloadBlob(sys_id as string)),
                tap((data: Blob) => {
                    // downloadService doesn't download the blob, it saves the blob to disk
                    this.downloadService.downloadBlob(data, document['sysfile_blob'].filename);
                })
            )
            .subscribe({
                next: () => this.emitDownloadStatusSuccess(downloadStatusSubject),
                error: () => this.emitDownloadStatusError(downloadStatusSubject),
            });

        return downloadStatusSubject.asObservable();
    }

    private emitDownloadStatusError(downloadStatusSubject: BehaviorSubject<DownloadStatus>) {
        downloadStatusSubject.next(DownloadStatus.ERROR);
        downloadStatusSubject.complete();
    }

    private emitDownloadStatusSuccess(downloadStatusSubject: BehaviorSubject<DownloadStatus>) {
        downloadStatusSubject.next(DownloadStatus.SUCCESS);
        downloadStatusSubject.complete();
    }

    private emitDownloadStatusRequest(downloadStatusSubject: BehaviorSubject<DownloadStatus>) {
        downloadStatusSubject.next(DownloadStatus.REQUEST);
    }
}
