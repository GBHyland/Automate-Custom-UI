/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, JwtHelperService } from '@alfresco/adf-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NucleusApiService {
    private readonly appConfigService = inject(AppConfigService);
    private readonly httpClient = inject(HttpClient);
    private readonly jwtHelperService = inject(JwtHelperService);

    public fetch<T>(query: string): Observable<T> {
        return this.httpClient.post<T>(this.getUrl(), { query }, { headers: this.getHeaders() });
    }

    private getUrl(): string {
        let url = this.appConfigService.get<string>('nucleusApiHost');
        if (!url?.startsWith('http')) {
            const iss = new URL(this.appConfigService.get<string>('oauth2.host'));
            url = iss.origin.replace('auth.iam', 'api.nucleus');
            if (!url) {
                throw new Error('nucleusApiHost is not configured');
            }
        }
        return `${url}/graph/graphql`;
    }

    private getHeaders(): HttpHeaders {
        return new HttpHeaders({
            Authorization: `Bearer ${this.jwtHelperService.getAccessToken()}`,
        });
    }
}
