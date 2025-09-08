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
export class UploadSnackbarService {
    maximize$: Observable<void>;
    minimize$: Observable<void>;

    protected maximizeSubject: Subject<void> = new Subject();
    protected minimizeSubject: Subject<void> = new Subject();

    constructor() {
        this.maximize$ = this.maximizeSubject.asObservable();
        this.minimize$ = this.minimizeSubject.asObservable();
    }

    requestMaximize(): void {
        this.maximizeSubject.next();
    }

    requestMinimize(): void {
        this.minimizeSubject.next();
    }
}
