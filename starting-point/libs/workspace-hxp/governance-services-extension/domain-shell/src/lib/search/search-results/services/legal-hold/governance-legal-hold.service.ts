/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { GovernanceLegalCaseResult } from '../legal-hold/governance-legal-case-result.interface';
import { LegalHoldQueryOptions } from '../../../models/legal-hold-query-options.interface';
import { DEFAULT_GOVERNANCE_SEARCH_LIMIT } from '.././governance-search.constants';
import { JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from '../../../../config/governance-discovery.service';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root',
})
export class GovernanceLegalHoldService {
    private readonly apiPath = '/api/legal-cases';
    private jwtHelperService: JwtHelperService = inject(JwtHelperService);
    private http: HttpClient = inject(HttpClient);
    private readonly governanceDiscoveryService = inject(GovernanceDiscoveryService);

    queryLegalCases(options?: LegalHoldQueryOptions): Observable<GovernanceLegalCaseResult> {
        const accessToken = this.jwtHelperService.getAccessToken();

        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey }) => {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });

                let params = new HttpParams();

                params = options?.limit
                    ? params.set('limit', options.limit.toString())
                    : params.set('limit', DEFAULT_GOVERNANCE_SEARCH_LIMIT.toString());

                if (options?.lastEvalKey) {
                    params = params.set('lastEvalKey', options.lastEvalKey);
                }

                return this.http.get<GovernanceLegalCaseResult>(`${govUrl}${this.apiPath}`, { headers, params });
            })
        );
    }
}
