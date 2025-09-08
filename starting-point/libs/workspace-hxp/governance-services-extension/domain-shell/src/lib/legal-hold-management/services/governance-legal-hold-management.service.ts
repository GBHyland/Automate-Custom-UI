/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { JwtHelperService } from '@alfresco/adf-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { GovernanceDiscoveryService } from '../../config/governance-discovery.service';
import { Observable, Subject, switchMap } from 'rxjs';
import { AssignRecordPayload, LegalHoldCase, LegalHoldCaseIdentity } from '../config/legal-config.type';

@Injectable({
    providedIn: 'root',
})
export class GovernanceLegalHoldManagementService {
    private readonly http = inject(HttpClient);
    private readonly jwtHelperService = inject(JwtHelperService);
    private readonly governanceDiscoveryService = inject(GovernanceDiscoveryService);
    private readonly shouldRefreshList = new Subject<boolean>();
    private readonly recordAssigned = new Subject<boolean>();
    private readonly legalCasesApiPath = '/api/legal-cases';
    private readonly apiPathForAssign = '/api/legal-records';

    readonly shouldRefreshList$ = this.shouldRefreshList.asObservable();
    readonly recordAssigned$ = this.recordAssigned.asObservable();

    createLegalHoldCase(body: LegalHoldCaseIdentity): Observable<LegalHoldCase> {
        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey, environmentId }) => {
                const accessToken = this.jwtHelperService.getAccessToken();
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });
                const params = { environmentId };

                return this.http.post(`${govUrl}${this.legalCasesApiPath}`, body, { headers, params });
            })
        );
    }

    assignRecordToLegalCase(body: AssignRecordPayload): Observable<void> {
        const accessToken = this.jwtHelperService.getAccessToken();
        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey, environmentId }) => {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });
                const params = { environmentId };

                return this.http.post<void>(`${govUrl}${this.apiPathForAssign}`, body, { headers, params });
            })
        );
    }

    emitRefreshList(): void {
        this.shouldRefreshList.next(true);
    }

    emitRecordAssignmentComplete(): void {
        this.recordAssigned.next(true);
    }
}
