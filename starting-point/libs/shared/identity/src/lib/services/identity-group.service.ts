/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService, OAuth2Service } from '@alfresco/adf-core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IdentityGroupFilterInterface } from '../models/identity-group-filter.interface';
import { IdentityGroupModel } from '../models/identity-group.model';

const IDENTITY_MICRO_SERVICE_INGRESS = 'identity-adapter-service';

type queryParameter = 'search' | 'application' | 'role';

@Injectable({ providedIn: 'root' })
export class IdentityGroupService {
    queryParams!: { search: string; application?: string; role?: string };

    constructor(private oAuth2Service: OAuth2Service, private appConfigService: AppConfigService) {}

    public search(name?: string, filters?: IdentityGroupFilterInterface): Observable<IdentityGroupModel[]> {
        if (!name || name.trim() === '') {
            return EMPTY;
        } else if (filters?.withinApplication) {
            return this.searchGroupsWithinApp(name, filters.withinApplication, filters?.roles);
        } else if (filters?.roles && filters.roles?.length > 0) {
            return this.searchGroupsWithGlobalRoles(name, filters.roles);
        } else {
            return this.searchGroupsByName(name);
        }
    }

    private searchGroupsByName(name: string): Observable<IdentityGroupModel[]> {
        this.buildQueryParam(name);

        return this.invokeIdentityGroupApi().pipe(catchError((err) => this.handleError(err)));
    }

    private searchGroupsWithGlobalRoles(name: string, roles: string[]): Observable<IdentityGroupModel[]> {
        this.buildQueryParam(name, roles);

        return this.invokeIdentityGroupApi().pipe(catchError((err) => this.handleError(err)));
    }

    private searchGroupsWithinApp(name: string, applicationName: string, roles?: string[]): Observable<IdentityGroupModel[]> {
        this.buildQueryParam(name, roles, applicationName);

        return this.invokeIdentityGroupApi().pipe(catchError((err) => this.handleError(err)));
    }

    private invokeIdentityGroupApi(): Observable<IdentityGroupModel[]> {
        const url = `${this.identityHost}/${IDENTITY_MICRO_SERVICE_INGRESS}/v1/groups`;
        return this.oAuth2Service.get({ url, queryParams: this.queryParams });
    }

    private buildQueryParam(name: string, roles?: string[], applicationName?: string) {
        this.queryParams = { search: name };
        this.addOptionalValueToQueryParam('application', applicationName);
        this.addOptionalCommaValueToQueryParam('role', roles);
    }

    private addOptionalCommaValueToQueryParam(key: queryParameter, values?: string[]) {
        if (values && values?.length > 0) {
            const valuesNotEmpty = this.filterOutEmptyValue(values);
            if (valuesNotEmpty?.length > 0) {
                this.queryParams[key] = valuesNotEmpty.join(',');
            }
        }
    }

    private addOptionalValueToQueryParam(key: queryParameter, value?: string) {
        if (value && value?.trim()) {
            this.queryParams[key] = value;
        }
    }

    private filterOutEmptyValue(roles: string[]): string[] {
        return roles.filter((role) => (role.trim() ? true : false));
    }

    private handleError(error: any) {
        return throwError(error || 'Server error');
    }

    private get identityHost(): string {
        return `${this.appConfigService.get('bpmHost')}`;
    }
}
