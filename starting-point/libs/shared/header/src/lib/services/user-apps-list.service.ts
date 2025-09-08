/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { catchError, map, shareReplay } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { EMPTY } from 'rxjs';
import { UserApps, UserAppsResponse } from '../interfaces/apps.interface';
import { AppConfigService, LogService, NotificationService, OAuth2Service } from '@alfresco/adf-core';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class UserAppsService {
    private apiRoot!: string;
    private userAppsData$: Observable<UserAppsResponse[]> = EMPTY;
    private currentAppKey!: string;

    constructor(
        private readonly oAuth2Service: OAuth2Service,
        private readonly logService: LogService,
        private readonly appConfig: AppConfigService,
        private readonly notificationService: NotificationService,
        private readonly router: Router
    ) {
        this.getBaseUrl();
        this.getUserApps();
        this.setCurrentAppKey();
    }

    getUserAppsData(): Observable<UserApps[]> {
        return this.userAppsData$.pipe(
            map((res) =>
                res
                    .map(({ appKey, launchUrl, app: { localizedName } }: Record<string, any>) => ({ appKey, launchUrl, localizedName }))
                    .filter(({ appKey }) => appKey !== this.currentAppKey)
            )
        );
    }

    /**
     * Get the roles of all apps the current user has access to.
     * @returns {Observable<string[]>} An observable that emits an array of roles.
     */
    getCurrentUserRoles$(): Observable<string[]> {
        return this.userAppsData$.pipe(map((res) => res.flatMap((r) => r.roles ?? [])));
    }

    private getBaseUrl(): void {
        const contextRoot = this.appConfig.get('bpmHost', '');
        this.apiRoot = `${contextRoot}/identity-adapter-service/v1/apps/account`;
    }

    private getUserApps(): void {
        this.userAppsData$ = this.oAuth2Service.get<UserAppsResponse[]>({ url: this.apiRoot }).pipe(
            catchError((error) => {
                if (error.status === 403) {
                    void this.router.navigate(['error', 403]);
                } else {
                    this.notificationService.showError('HEADER.APPS.ERROR');
                }

                this.logService.error(error);
                return EMPTY;
            }),
            shareReplay(1)
        );
    }

    private setCurrentAppKey(): void {
        const { key = '' }: Record<string, string> = this.appConfig.get('application', {});
        this.currentAppKey = key;
    }
}
