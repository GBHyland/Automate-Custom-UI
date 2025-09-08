/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { DEFAULT_REPOSITORY_ID, DOWNLOAD_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { DownloadApi } from '@hylandsoftware/hxcs-js-client';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class BlobDownloadService {
    constructor(@Inject(DOWNLOAD_API_TOKEN) private downloadApi: DownloadApi) {}

    downloadBlob(documentId: string, property = 'sysfile_blob', repositoryId = DEFAULT_REPOSITORY_ID): Observable<Blob> {
        return from(this.downloadApi.downloadByIdAndXPath(documentId, property, false, repositoryId, { responseType: 'blob' })).pipe(
            map(({ data }) => data)
        );
    }
}
