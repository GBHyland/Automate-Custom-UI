/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { JwtHelperService } from '@alfresco/adf-core';
import { catchError, map, Observable, of, Subject, switchMap } from 'rxjs';
import { GovernanceDiscoveryService } from '../../config/governance-discovery.service';
import { GovernanceRecord, RecordIdentity } from '../../mocks/record.type';

@Injectable({ providedIn: 'root' })
export class GovernanceRecordService {
    private http = inject(HttpClient);
    private jwtHelperService = inject(JwtHelperService);
    private governanceDiscoveryService = inject(GovernanceDiscoveryService);
    private updateConfirmedSubject = new Subject<GovernanceRecord>();
    updateConfirmed$ = this.updateConfirmedSubject.asObservable();
    private deleteConfirmedSubject = new Subject<void>();
    deleteConfirmed$ = this.deleteConfirmedSubject.asObservable();

    private readonly recordsApiPath = '/api/records';

    editRecord(recordId: string, body: RecordIdentity): Observable<GovernanceRecord> {
        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey, environmentId }) => {
                const accessToken = this.jwtHelperService.getAccessToken();
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });
                const params = { environmentId };

                return this.http.put(`${govUrl}${this.recordsApiPath}/${recordId}`, body, { headers, params });
            })
        );
    }

    emitUpdateConfirmed(updatedRecord: GovernanceRecord): void {
        this.updateConfirmedSubject.next(updatedRecord);
    }

    deleteRecord(recordId: string, edsId: string, categoryId: string): Observable<boolean> {
        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey }) => {
                const accessToken = this.jwtHelperService.getAccessToken();
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });

                const encodedRecordId = encodeURIComponent(recordId);
                const encodedEdsId = encodeURIComponent(edsId);
                const encodedCategoryId = encodeURIComponent(categoryId);

                const url = `${govUrl}${this.recordsApiPath}/${encodedRecordId}?eds=${encodedEdsId}&categoryId=${encodedCategoryId}`;

                return this.http.delete(url, { headers }).pipe(
                    map(() => true),
                    catchError(() => of(false))
                );
            })
        );
    }

    emitDeleteConfirmed(): void {
        this.deleteConfirmedSubject.next();
    }
}
