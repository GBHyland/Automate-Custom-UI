/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { VERSION_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { Inject, Injectable } from '@angular/core';
import { VersionApi, Document } from '@hylandsoftware/hxcs-js-client';
import { from, map, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class RestoreDocumentVersionService {
    constructor(@Inject(VERSION_API_TOKEN) private versionApi: VersionApi) {}

    restore(versionId: string, repositoryId: string): Observable<Document> {
        const restoreSubject = new Subject<Document>();

        from(this.versionApi.restoreVersion(versionId, repositoryId))
            .pipe(map((response) => response.data))
            .subscribe({
                next: (response) => {
                    restoreSubject.next(response);
                },
                error: (err) => restoreSubject.error(err),
            });

        return restoreSubject.asObservable();
    }
}
