/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HttpErrorResponse } from '@angular/common/http';
import { IdentityUserFilterInterface } from '../models/identity-user-filter.interface';
import { UserSearchType } from '../models/user-search-type.enum';

export const mockSearchUserEmptyFilters: IdentityUserFilterInterface = {
    roles: [],
    groups: [],
    type: UserSearchType.INTERACTIVE,
    withinApplication: '',
};

export const mockSearchUserByGroups: IdentityUserFilterInterface = {
    roles: [],
    groups: ['fake-group-1', 'fake-group-2'],
    type: UserSearchType.INTERACTIVE,
    withinApplication: '',
};

export const mockSearchUserByGroupsAndRoles: IdentityUserFilterInterface = {
    roles: ['fake-role-1', 'fake-role-2'],
    groups: ['fake-group-1', 'fake-group-2'],
    type: UserSearchType.INTERACTIVE,
    withinApplication: '',
};

export const mockSearchUserByGroupsAndRolesAndApp: IdentityUserFilterInterface = {
    roles: ['fake-role-1', 'fake-role-2'],
    groups: ['fake-group-1', 'fake-group-2'],
    type: UserSearchType.INTERACTIVE,
    withinApplication: 'fake-app-name',
};

export const mockSearchUserByRoles: IdentityUserFilterInterface = {
    roles: ['fake-role-1', 'fake-role-2'],
    groups: [],
    type: UserSearchType.INTERACTIVE,
    withinApplication: '',
};

export const mockSearchUserByRolesAndType: IdentityUserFilterInterface = {
    type: UserSearchType.ALL,
    roles: ['fake-role-1'],
    groups: [],
    withinApplication: '',
};

export const mockSearchUserByRolesAndApp: IdentityUserFilterInterface = {
    roles: ['fake-role-1', 'fake-role-2'],
    groups: [],
    type: UserSearchType.INTERACTIVE,
    withinApplication: 'fake-app-name',
};

export const mockSearchUserByApp: IdentityUserFilterInterface = {
    roles: [],
    groups: [],
    type: UserSearchType.INTERACTIVE,
    withinApplication: 'fake-app-name',
};

export const mockSearchUserByAppAndGroups: IdentityUserFilterInterface = {
    roles: [],
    groups: ['fake-group-1', 'fake-group-2'],
    type: UserSearchType.INTERACTIVE,
    withinApplication: 'fake-app-name',
};

export const errorResponse = new HttpErrorResponse({
    error: 'Mock Error',
    status: 404,
    statusText: 'Not Found',
});
