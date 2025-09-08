/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DownloadData {
    name: string;
    blob: Blob;
    title?: string;
}

@Injectable()
export abstract class SharedDownloadService {
    abstract downloadByDocumentId(id: string | undefined): Observable<DownloadData | null>;
    abstract downloadByDocumentPath(path: string | undefined): Observable<DownloadData | null>;
}
