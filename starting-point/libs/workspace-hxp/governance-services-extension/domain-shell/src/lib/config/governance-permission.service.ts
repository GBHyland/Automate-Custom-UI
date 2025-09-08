/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, shareReplay, switchMap } from 'rxjs';
import { JwtHelperService } from '@alfresco/adf-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GovernanceDiscoveryService } from './governance-discovery.service';

const REQUIRED_GOVERNANCE_PERMISSIONS = ['governance-api.fileplan.read', 'governance-api.records.read'];

@Injectable({ providedIn: 'root' })
export class GovernancePermissionService {
    private jwtHelperService: JwtHelperService = inject(JwtHelperService);
    private http: HttpClient = inject(HttpClient);
    private governanceDiscoveryService = inject(GovernanceDiscoveryService);
    private permissions$: Observable<string[]> | null = null;
    private readonly governanceApiPath = '/api/userInfo';

    loadPermissions(): Observable<string[]> {
        if (!this.permissions$) {
            this.permissions$ = this.governanceDiscoveryService.getGovernanceApiContext().pipe(
                switchMap(({ govUrl, environmentKey, environmentId }) => {
                    const accessToken = this.jwtHelperService.getAccessToken();
                    const headers = new HttpHeaders({
                        Authorization: `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                        'x-environment-key': environmentKey,
                    });
                    const params = { environmentId };

                    return this.http.get<any[]>(`${govUrl}${this.governanceApiPath}`, { headers, params });
                }),
                map((userPermission) => userPermission ?? []),
                catchError(() => of([])),
                shareReplay(1)
            );
        }

        return this.permissions$;
    }

    hasGovernanceAccess(): Observable<boolean> {
        return this.loadPermissions().pipe(map((permissions) => REQUIRED_GOVERNANCE_PERMISSIONS.every((p) => permissions.includes(p))));
    }
}
