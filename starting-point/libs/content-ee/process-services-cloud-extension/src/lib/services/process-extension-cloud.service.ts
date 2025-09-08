/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService, NotificationService } from '@alfresco/adf-core';
import { AlfrescoApiService } from '@alfresco/adf-content-services';
import { filter, switchMap, take, tap, catchError, withLatestFrom, map } from 'rxjs/operators';
import { of, from, ReplaySubject, Observable } from 'rxjs';
import { AppSubscriptionService } from './app-subscription.service';
import { AdfHttpClient } from '@alfresco/adf-core/api';

@Injectable({
    providedIn: 'root',
})
export class ProcessExtensionServiceCloud {
    processServicesCloudRunning = false;
    private config$: ReplaySubject<any>;

    constructor(
        private readonly appConfigService: AppConfigService,
        private readonly apiService: AlfrescoApiService,
        private readonly adfHttpClient: AdfHttpClient,
        private readonly appSubscriptionService: AppSubscriptionService,
        private readonly notificationService: NotificationService
    ) {
        this.config$ = new ReplaySubject(1);

        this.appConfigService.onLoad.pipe(take(1)).subscribe((config) => {
            if (config.plugins && (config.plugins.processAutomation === true || config.plugins.processAutomation === 'true')) {
                this.enablePlugin();
                this.appSubscriptionService.initAppNotifications(config);
            }
            this.config$.next(config);
        });
    }

    enablePlugin() {
        if (localStorage && localStorage.getItem('processAutomation') === null) {
            localStorage.setItem('processAutomation', 'true');
        }
    }

    checkBackendHealth(): Observable<boolean> {
        return this.config$.pipe(
            withLatestFrom(this.apiService.alfrescoApiInitialized),
            filter(([, status]) => status),
            take(1),
            switchMap(([config]) =>
                from(
                    this.adfHttpClient.request(
                        `${this.appConfigService.get('bpmHost', '')}/${config['alfresco-deployed-apps'][0].name}/rb/actuator/health`,
                        {
                            httpMethod: 'GET',
                            contentTypes: ['application/json'],
                            responseType: 'application/json',
                        }
                    )
                )
            ),
            map((response) => {
                const health = response.status === 'UP';
                return health;
            }),
            tap((health) => {
                this.processServicesCloudRunning = health;
            }),
            catchError(() => {
                this.processServicesCloudRunning = false;
                return of(false);
            })
        );
    }

    getTotalQuickStartProcessDefinitions(): number {
        return this.appConfigService.get<number>('totalQuickStartProcessDefinitions', 10);
    }

    showError(message: string) {
        this.notificationService.showWarning(message);
    }
}
