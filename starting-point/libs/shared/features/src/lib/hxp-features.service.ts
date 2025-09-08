/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Observable, ReplaySubject, defer, from, of, throwError, timer } from 'rxjs';
import { FeaturesServiceConfigToken, IFeaturesService, FlagChangeset } from '@alfresco/adf-core/feature-flags';
import { AppConfigService, AuthenticationService, NotificationService, TranslationService } from '@alfresco/adf-core';
import { catchError, filter, map, tap, switchMap, distinctUntilChanged, retry, timeout } from 'rxjs/operators';
import { AdfHttpClient } from '@alfresco/adf-core/api';

export interface HxPFeatureFlagConfig {
    isApplicationAware?: boolean;
    serviceRelativePath?: string;
}

export interface FeatureFlagsResponse {
    [key: string]: boolean;
}

@Injectable()
export class HxPFeaturesService implements IFeaturesService {
    private static FEATURE_FLAGS_PATH = '/v1/feature-flags';

    private currentFlagState: FlagChangeset = {};

    private FEATURE_FLAGS_TIMEOUT = 5000; // 5 seconds

    private readonly FITMENT_FACTOR = 200; // 0.2 seconds

    readonly retryCount = 3;

    private currentFlagStateSubject = new ReplaySubject<FlagChangeset>(1);

    private currentFlagState$ = this.currentFlagStateSubject.asObservable();

    constructor(
        private notificationService: NotificationService,
        private translationService: TranslationService,
        private appConfigService: AppConfigService,
        private authenticationService: AuthenticationService,
        private adfHttpClient: AdfHttpClient,
        @Inject(FeaturesServiceConfigToken) private config: HxPFeatureFlagConfig
    ) {}

    init(): Observable<FlagChangeset> {
        return this.initializeFlags();
    }

    isOn$(key: string): Observable<boolean> {
        return this.getFlags$().pipe(
            filter((flags) => !!flags),
            map((flags) => !!flags[key]?.current),
            distinctUntilChanged()
        );
    }

    isOff$(key: string): Observable<boolean> {
        return this.getFlags$().pipe(
            filter((flags) => !!flags),
            map((flags) => !flags[key]?.current),
            distinctUntilChanged()
        );
    }

    getFlags$(): Observable<FlagChangeset> {
        return this.currentFlagState$;
    }

    private buildUrl() {
        let featureFlagsEndpoint = this.appConfigService.get('bpmHost', '');

        if (this.config.isApplicationAware) {
            featureFlagsEndpoint += '/' + this.appConfigService.get<{ name: string }[]>('alfresco-deployed-apps', [])[0]?.name;
        }

        if (this.config?.serviceRelativePath) {
            let relativePath = this.config.serviceRelativePath;

            if (relativePath.startsWith('/')) {
                relativePath = relativePath.slice(1);
            }

            if (relativePath.endsWith('/')) {
                relativePath = relativePath.slice(0, -1);
            }

            featureFlagsEndpoint += '/' + relativePath;
        }

        featureFlagsEndpoint += HxPFeaturesService.FEATURE_FLAGS_PATH;

        return featureFlagsEndpoint;
    }

    private initializeFlags(): Observable<FlagChangeset> {
        const initFlags$ = this.authenticationService.onLogin.asObservable().pipe(
            filter(() => {
                return this.authenticationService.isLoggedIn();
            }),
            switchMap(() =>
                defer(() => from(this.adfHttpClient.request(this.buildUrl(), { httpMethod: 'GET' }))).pipe(
                    timeout(this.FEATURE_FLAGS_TIMEOUT),
                    map((response: FeatureFlagsResponse) => {
                        const changeSet: FlagChangeset = {};

                        for (const flag of Object.keys(response)) {
                            changeSet[flag] = {
                                current: response[flag],
                                previous: this.currentFlagState[flag],
                            };
                        }

                        return changeSet;
                    }),
                    tap((changeSet: FlagChangeset) => {
                        this.currentFlagState = changeSet;
                        this.currentFlagStateSubject.next(changeSet);
                    }),
                    retry({
                        count: this.retryCount,
                        delay: (error, retryCount) => {
                            if (error) {
                                this.FEATURE_FLAGS_TIMEOUT = this.FEATURE_FLAGS_TIMEOUT + retryCount * this.FITMENT_FACTOR;
                                return timer(this.FEATURE_FLAGS_TIMEOUT);
                            } else {
                                return throwError(() => error);
                            }
                        },
                    }),
                    catchError((e) => {
                        this.notificationService.showError(this.translationService.instant('SDK.MAIN_NAVIGATION.ERRORS.LOADING_ERROR'));
                        console.warn('The Feature Flags service is not reachable', e);
                        this.currentFlagState = {};
                        this.currentFlagStateSubject.next(this.currentFlagState);
                        return of(this.currentFlagState);
                    })
                )
            )
        );

        return initFlags$;
    }
}
