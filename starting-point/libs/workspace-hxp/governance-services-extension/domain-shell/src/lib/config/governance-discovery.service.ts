/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { AppConfigService, JwtHelperService } from '@alfresco/adf-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { catchError, map, shareReplay, take } from 'rxjs/operators';
import { GovernanceDiscoveryResponse, SubscribedApp } from './governance-service.type';
import { GovernanceApiContext } from './governance-config.type';

@Injectable({
    providedIn: 'root',
})
export class GovernanceDiscoveryService {
    private appConfig = inject(AppConfigService);
    private http = inject(HttpClient);
    private jwtHelperService = inject(JwtHelperService);

    private cachedResponse$?: ReplaySubject<SubscribedApp>;

    getGovernanceApp(): Observable<SubscribedApp> {
        if (!this.cachedResponse$) {
            this.cachedResponse$ = new ReplaySubject<SubscribedApp>(1);
            this.fetchDiscoveryResponse().subscribe({
                next: (result) => this.cachedResponse$?.next(result),
                error: (err) => this.cachedResponse$?.error(err),
            });
        }
        return this.cachedResponse$.asObservable();
    }

    getGovernanceApiContext(): Observable<GovernanceApiContext> {
        return this.getGovernanceApp().pipe(
            map((response) => {
                const environmentKey = response.environmentKey ?? '';
                const govUrl = response.launchUrl ?? '';

                const hxpAuthorization = this.jwtHelperService.getValueFromLocalToken<{ environment_id: string }>(JwtHelperService.HXP_AUTHORIZATION);
                const environmentId = hxpAuthorization?.environment_id ?? '';

                return { govUrl, environmentKey, environmentId };
            }),
            shareReplay(1)
        );
    }

    /** Optionally, clear the cache (e.g., on logout) */
    clearCache(): void {
        this.cachedResponse$ = undefined;
    }

    private getDiscoveryUrl(): string {
        const url = this.appConfig.get<string>('nucleusApiHost');

        if (!url?.startsWith('http')) {
            throw new Error('nucleusApiHost must be configured with a valid URL');
        }

        return `${url}/graph/graphql`;
    }

    private fetchDiscoveryResponse(): Observable<SubscribedApp> {
        const accessToken = this.jwtHelperService.getAccessToken();
        const headers = new HttpHeaders({
            Authorization: `Bearer ${accessToken}`,
        });
        const graphqlQuery = {
            query: `
            query CurrentUserApps {
              currentUser {
                id
                subscribedApps {
                  id
                  environmentId
                  environmentKey
                  launchUrl
                  provisioningStatus
                  app {
                    key
                    id
                    localizedName
                    appType
                  }
                }
              }
            }
        `,
        };
        return this.http.post<GovernanceDiscoveryResponse>(this.getDiscoveryUrl(), graphqlQuery, { headers }).pipe(
            map((response) => {
                const hxpAuthorization = this.jwtHelperService.getValueFromLocalToken<{ environment_id: string }>(JwtHelperService.HXP_AUTHORIZATION);
                const environmentId = hxpAuthorization ? hxpAuthorization['environment_id'] : '';

                const subscribedApps = response?.data?.currentUser?.subscribedApps ?? [];
                const governanceApp = subscribedApps.find((app: any) => app.app?.key === 'governance' && app.environmentId === environmentId);
                if (!governanceApp) {
                    throw new Error('Governance app not found in the subscribed apps.');
                }
                const result: SubscribedApp = {
                    launchUrl: governanceApp?.launchUrl?.replace(`${governanceApp?.environmentKey}.`, ''),
                    environmentKey: governanceApp?.environmentKey,
                };
                return result;
            }),
            take(1),
            catchError((error) => throwError(() => error)),
            shareReplay(1)
        );
    }
}
