/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { NucleusApiService } from './nucleus-api.service';
import { GLOBAL_APPS } from '../graphql/global-apps.query';
import { GlobalApps } from '../interfaces/global-apps.interface';
import { catchError, map, Observable, of } from 'rxjs';
import { NotificationService } from '@alfresco/adf-core';
import { DEFAULT_GLOBAL_APPS } from '../constants/default.global-apps.constant';
import { filterAccountApps } from '../utils/filter-account-apps.util';
import { filterSubscribedApps } from '../utils/filter-subscribed-apps.util';

@Injectable({
    providedIn: 'root',
})
export class AppListService {
    private readonly nucleusApiService = inject(NucleusApiService);
    private readonly notificationService = inject(NotificationService);

    globalApps$: Observable<GlobalApps>;

    constructor() {
        this.globalApps$ = this.getGlobalsApps();
    }

    private getGlobalsApps(): Observable<GlobalApps> {
        return this.nucleusApiService.fetch<GlobalApps>(GLOBAL_APPS).pipe(
            map((globalApps: GlobalApps) => {
                globalApps.data.currentUser.accountApps = filterAccountApps(globalApps.data.currentUser.accountApps);
                globalApps.data.currentUser.subscribedApps = filterSubscribedApps(globalApps.data.currentUser.subscribedApps);

                return globalApps;
            }),
            catchError(() => {
                this.notificationService.showError('APP_CHROME.ERRORS.APPS');

                return of(DEFAULT_GLOBAL_APPS);
            })
        );
    }
}
