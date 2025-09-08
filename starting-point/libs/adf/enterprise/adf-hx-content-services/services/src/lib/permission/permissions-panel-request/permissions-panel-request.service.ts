/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PermissionsPanelRequestService {
    notifications$: Observable<boolean>;
    private notificationsSubject: Subject<boolean> = new Subject();

    constructor() {
        this.notifications$ = this.notificationsSubject.asObservable();
    }

    requestOpenPanel() {
        this.notificationsSubject.next(true);
    }

    requestClosePanel() {
        this.notificationsSubject.next(false);
    }
}
