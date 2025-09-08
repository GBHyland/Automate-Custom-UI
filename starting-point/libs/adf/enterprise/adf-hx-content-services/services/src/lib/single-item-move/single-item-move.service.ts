/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { MoveApi } from '@hylandsoftware/hxcs-js-client';
import { Subject, Observable, from, map } from 'rxjs';
import { MoveStatus } from './models/move-status.enum';
import { MOVE_API_TOKEN } from '@alfresco/adf-hx-content-services/api';
import { MoveResponse } from './models/move-response.interface';

@Injectable({
    providedIn: 'root',
})
export class SingleItemMoveService {
    constructor(@Inject(MOVE_API_TOKEN) private moveApi: MoveApi) {}

    move(moveDocumentId: string, targetParentId: string): Observable<MoveResponse> {
        const moveSubject: Subject<MoveResponse> = new Subject<MoveResponse>();

        from(
            this.moveApi.move(moveDocumentId, 'default', {
                targetParentId,
            })
        )
            .pipe(map((response) => response.data))
            .subscribe({
                next: (response) => {
                    moveSubject.next({ document: response, status: MoveStatus.SUCCESS });
                },
                error: () => {
                    moveSubject.next({ document: undefined, status: MoveStatus.ERROR });
                },
            });

        return moveSubject.asObservable();
    }
}
