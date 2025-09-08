/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import { CopyApi } from '@hylandsoftware/hxcs-js-client';
import { COPY_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { CopyStatus } from './models/copy-status.enum';
import { map } from 'rxjs/operators';
import { CopyResponse } from './models/copy-response.interface';

@Injectable({
    providedIn: 'root',
})
export class SingleItemCopyService {
    constructor(@Inject(COPY_API_TOKEN) private copyApi: CopyApi) {}

    copy(copyDocumentId: string, name: string, targetParentId: string): Observable<CopyResponse> {
        const copySubject: Subject<CopyResponse> = new Subject<CopyResponse>();

        from(this.copyApi.copy(copyDocumentId, 'default', { name, targetParentId }))
            .pipe(map((response) => response.data))
            .subscribe({
                next: (response) => {
                    copySubject.next({ document: response, status: CopyStatus.SUCCESS });
                },
                error: () => {
                    copySubject.next({ document: undefined, status: CopyStatus.ERROR });
                },
            });

        return copySubject.asObservable();
    }
}
