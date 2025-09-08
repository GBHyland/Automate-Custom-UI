/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { SharedDownloadService } from '@hxp/shared-hxp/services';
import { BlobDownloadService } from '@alfresco/adf-hx-content-services/services';
import { DOCUMENT_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { DocumentApi } from '@hylandsoftware/hxcs-js-client';
import { Observable, forkJoin, from, of, zip } from 'rxjs';
import { map, mergeMap, take } from 'rxjs/operators';

export interface DownloadData {
    name: string;
    blob: Blob;
}

@Injectable()
export class DownloadService extends SharedDownloadService {
    constructor(@Inject(DOCUMENT_API_TOKEN) private documentApi: DocumentApi, private blobDownloadService: BlobDownloadService) {
        super();
    }

    downloadByDocumentId(id: string | undefined): Observable<DownloadData | null> {
        if (!id) {
            return of(null);
        }
        return forkJoin({
            document: from(this.documentApi.getDocumentById(id)),
            download: this.blobDownloadService.downloadBlob(id),
        }).pipe(
            take(1),
            map((response) => {
                return {
                    name: response.document.data['sysfile_blob'].filename,
                    blob: response.download,
                };
            })
        );
    }

    downloadByDocumentPath(path: string | undefined): Observable<DownloadData | null> {
        if (!path) {
            return of(null);
        }

        return from(this.documentApi.getDocumentByPath(path)).pipe(
            take(1),
            mergeMap((document) => {
                let download: Observable<Blob | null> = of(null);
                if (document?.data?.sys_id) {
                    download = this.blobDownloadService.downloadBlob(document.data.sys_id);
                }
                return zip(of(document), download);
            }),
            take(1),
            map(([document, download]) => {
                if (download) {
                    return {
                        name: document.data['sysfile_blob'].filename,
                        blob: download,
                    };
                } else {
                    return null;
                }
            })
        );
    }
}
