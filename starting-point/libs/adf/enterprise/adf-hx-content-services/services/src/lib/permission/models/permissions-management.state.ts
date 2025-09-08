/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Document, Group, User } from '@hylandsoftware/hxcs-js-client';
import { Observable } from 'rxjs';
import { IdentityType, PermissionsManagementRow } from './permissions-management-row.model';

export interface PermissionsManagementState {
    document?: Document;
    permissions: PermissionsManagementRow[]; // parsed Document Acl permissions
    loading: boolean; // enabled when loading suggestions
    activeTab: IdentityType; // which tab is active
    searchUserField: string; // text input to filter the user permissions list
    searchGroupField: string; // text input to filter the group permissions list
    newUserField: string; // new User to add
    newGroupField: string; // new Group to add
    suggestedUsers: User[]; // list of User that match newUserField
    suggestedGroups: Group[]; // list of Group that match newGroupField
    initialInheritance: boolean; // Initial state of inheritance
    isInheritanceEnabled: boolean; // State for inheritance
}

export interface PublicApi {
    title$: Observable<string>;
    loading$: Observable<boolean>;
    activePermissionsManagementRows$: Observable<PermissionsManagementRow[]>;
    suggestedUsers$: Observable<User[]>;
    suggestedGroups$: Observable<Group[]>;
    isUntouched$: Observable<boolean>;
    permissionsManagementRows$: Observable<PermissionsManagementRow[]>;
    sys_id$: Observable<string | undefined>;
    initialInheritance$: Observable<boolean>;
    isInheritanceEnabled$: Observable<boolean>;
    hasLocalPermission$: Observable<boolean>;
}

export const initialState: Readonly<PermissionsManagementState> = {
    permissions: [],
    loading: false,
    activeTab: 'group',
    searchUserField: '',
    searchGroupField: '',
    newUserField: '',
    newGroupField: '',
    suggestedUsers: [],
    suggestedGroups: [],
    initialInheritance: true,
    isInheritanceEnabled: true,
};
