/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppConfigService, JwtHelperService, OAuth2Service } from '@alfresco/adf-core';
import { EMPTY, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IdentityUserModel } from '../models/identity-user.model';
import { IdentityUserFilterInterface } from '../models/identity-user-filter.interface';
import { UserSearchType } from '../models/user-search-type.enum';

const IDENTITY_MICRO_SERVICE_INGRESS = 'identity-adapter-service';

type queryParameter = 'search' | 'application' | 'role' | 'group' | 'type';

@Injectable({
    providedIn: 'root',
})
export class IdentityUserService {
    queryParams!: { search: string; application?: string; role?: string; group?: string; type?: string };

    constructor(private jwtHelperService: JwtHelperService, private oAuth2Service: OAuth2Service, private appConfigService: AppConfigService) {}

    /**
     * Gets the name and other basic details of the current user.
     *
     * @returns The user's details
     */
    public getCurrentUserInfo(): IdentityUserModel {
        const familyName = this.jwtHelperService.getValueFromLocalToken<string>(JwtHelperService.FAMILY_NAME);
        const givenName = this.jwtHelperService.getValueFromLocalToken<string>(JwtHelperService.GIVEN_NAME);
        const email = this.jwtHelperService.getValueFromLocalToken<string>(JwtHelperService.USER_EMAIL);
        const username = this.jwtHelperService.getValueFromLocalToken<string>(JwtHelperService.USER_PREFERRED_USERNAME);
        return { firstName: givenName, lastName: familyName, email, username };
    }

    /**
     * Search users based on name input and filters.
     *
     * @param name Search query string
     * @param [filters] Search query filters
     * @returns List of users
     */
    public search(name?: string, filters?: IdentityUserFilterInterface): Observable<IdentityUserModel[]> {
        if (!name || name.trim() === '') {
            return EMPTY;
        } else if (filters?.groups && filters.groups?.length > 0) {
            return this.searchUsersWithGroups(name, filters);
        } else if (filters?.withinApplication) {
            return this.searchUsersWithinApp(name, filters.withinApplication, filters?.roles);
        } else if (filters?.roles && filters.roles?.length > 0) {
            return this.searchUsersWithGlobalRoles(name, filters.roles, filters.type);
        } else {
            return this.searchUsersByName(name);
        }
    }

    private searchUsersByName(name: string): Observable<IdentityUserModel[]> {
        this.buildQueryParam(name);

        return this.invokeIdentityUserApi().pipe(catchError((err) => this.handleError(err)));
    }

    private searchUsersWithGlobalRoles(
        name: string,
        roles: string[],
        type: UserSearchType = UserSearchType.INTERACTIVE
    ): Observable<IdentityUserModel[]> {
        this.buildQueryParam(name, { roles, type });

        return this.invokeIdentityUserApi().pipe(catchError((err) => this.handleError(err)));
    }

    private searchUsersWithinApp(name: string, withinApplication: string, roles?: string[]): Observable<IdentityUserModel[]> {
        this.buildQueryParam(name, { roles, withinApplication, type: UserSearchType.INTERACTIVE });

        return this.invokeIdentityUserApi().pipe(catchError((err) => this.handleError(err)));
    }

    private searchUsersWithGroups(name: string, filters: IdentityUserFilterInterface): Observable<IdentityUserModel[]> {
        this.buildQueryParam(name, filters);

        return this.invokeIdentityUserApi().pipe(catchError((err) => this.handleError(err)));
    }

    private invokeIdentityUserApi(): Observable<any> {
        const url = `${this.identityHost}/${IDENTITY_MICRO_SERVICE_INGRESS}/v1/users`;
        return this.oAuth2Service.get({ url, queryParams: this.queryParams });
    }

    private buildQueryParam(name: string, filters?: IdentityUserFilterInterface) {
        this.queryParams = { search: name };
        this.addOptionalValueToQueryParam('application', filters?.withinApplication);
        this.addOptionalValueToQueryParam('type', filters?.type);
        this.addOptionalCommaValueToQueryParam('role', filters?.roles);
        this.addOptionalCommaValueToQueryParam('group', filters?.groups);
    }

    private addOptionalCommaValueToQueryParam(key: queryParameter, values?: string[]) {
        if (values && values.length > 0) {
            const valuesNotEmpty = this.filterOutEmptyValue(values);
            if (valuesNotEmpty?.length > 0) {
                this.queryParams[key] = valuesNotEmpty.join(',');
            }
        }
    }

    private addOptionalValueToQueryParam(key: queryParameter, value?: string) {
        if (value?.trim()) {
            this.queryParams[key] = value;
        }
    }

    private filterOutEmptyValue(values: string[]): string[] {
        return values.filter((value) => (value.trim() ? true : false));
    }

    private get identityHost(): string {
        return `${this.appConfigService.get('bpmHost')}`;
    }

    private handleError(error: any) {
        return throwError(error || 'Server error');
    }
}
