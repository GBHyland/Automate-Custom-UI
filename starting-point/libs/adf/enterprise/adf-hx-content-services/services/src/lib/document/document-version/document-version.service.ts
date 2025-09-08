/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { CheckInApi, Document } from '@hylandsoftware/hxcs-js-client';
import { CHECKIN_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { from, map, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class CreateDocumentVersionService {
    constructor(@Inject(CHECKIN_API_TOKEN) private checkInApi: CheckInApi) {}

    checkin(documentId: string, minor: boolean, repositoryId: string): Observable<Document> {
        const checkinSubject = new Subject<Document>();

        from(this.checkInApi.checkin(documentId, minor, repositoryId))
            .pipe(map((response) => response.data))
            .subscribe({
                next: (response) => {
                    checkinSubject.next(response);
                },
                error: (err) => checkinSubject.error(err),
            });

        return checkinSubject.asObservable();
    }
}
