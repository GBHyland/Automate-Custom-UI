/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Category, DataSource, FilePlan, GovernanceConfigModel } from './governance-config.type';
import { Observable } from 'rxjs';
import { map, switchMap, catchError, shareReplay } from 'rxjs/operators';
import { JwtHelperService } from '@alfresco/adf-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GovernanceDiscoveryService } from './governance-discovery.service';

@Injectable({
    providedIn: 'root',
})
export class GovernanceConfigurationService {
    private jwtHelperService: JwtHelperService = inject(JwtHelperService);
    private http: HttpClient = inject(HttpClient);
    private governanceDiscoveryService = inject(GovernanceDiscoveryService);

    private config$: Observable<GovernanceConfigModel>;
    private readonly governanceApiPath = '/api/config';

    constructor() {
        this.config$ = this.fetchConfigurationData();
    }

    getConfig(): Observable<GovernanceConfigModel> {
        return this.config$;
    }

    private fetchConfigurationData(): Observable<GovernanceConfigModel> {
        return this.fetchConfiguration().pipe(
            map((data) => {
                const dataSources = this.mapDataSources(data);
                const filePlans = this.mapFilePlans(data);
                const categories = this.collectAllCategories(filePlans);
                return { dataSources, filePlans, categories };
            }),
            shareReplay(1)
        );
    }

    private mapDataSources(data: any[]): DataSource[] {
        return data
            .filter((item) => !!item && !!item.environmentDataSourceDTO)
            .map((item: any) => ({
                createdByUser: item.environmentDataSourceDTO.createdByUser,
                createdAt: item.environmentDataSourceDTO.createdAt,
                modifiedByUser: item.environmentDataSourceDTO.modifiedByUser,
                modifiedAt: item.environmentDataSourceDTO.modifiedAt,
                name: item.environmentDataSourceDTO.name,
                description: item.environmentDataSourceDTO.description,
                type: item.environmentDataSourceDTO.type,
                dataSourceId: item.environmentDataSourceDTO.dataSourceId,
                repoUrl: item.environmentDataSourceDTO.repoUrl,
                id: item.environmentDataSourceDTO.id,
            }));
    }

    private mapFilePlans(data: any[]): FilePlan[] {
        return data
            .filter((item) => !!item && !!item.filePlans)
            .flatMap((item: any) => {
                return item.filePlans.map((fp: any) => ({
                    createdByUser: fp.createdByUser,
                    createdAt: fp.createdAt,
                    modifiedByUser: fp.modifiedByUser,
                    modifiedAt: fp.modifiedAt,
                    id: fp.id,
                    name: fp.name,
                    description: fp.description,
                    key: fp.key,
                    categories: fp.categories,
                    filePlanType: fp.filePlanType,
                }));
            });
    }

    private collectAllCategories(filePlans: FilePlan[]): Category[] {
        const categories = new Set<string>();
        return filePlans
            .flatMap((fp) => this.collectCategories(fp.categories))
            .filter((category) => {
                const isNew = !categories.has(category.id);
                categories.add(category.id);
                return isNew;
            });
    }

    private collectCategories(categories: Category[] | null | undefined): Category[] {
        if (!categories?.length) {
            return [];
        }
        return categories.flatMap((category) => [category, ...this.collectCategories(category.categories)]);
    }

    private fetchConfiguration(): Observable<any[]> {
        const accessToken = this.jwtHelperService.getAccessToken();

        return this.governanceDiscoveryService.getGovernanceApiContext().pipe(
            switchMap(({ govUrl, environmentKey, environmentId }) => {
                const headers = new HttpHeaders({
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'x-environment-key': environmentKey,
                });
                const params = { environmentId };
                return this.http.get<any[]>(`${govUrl}${this.governanceApiPath}`, { headers, params });
            }),
            catchError((error) => {
                console.error('Failed to fetch governance configuration:', error);
                throw error;
            })
        );
    }
}
