/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ACE, Group, User } from '@hylandsoftware/hxcs-js-client';

export type NewPermission = 'Read' | 'ReadWrite' | 'Everything';

export type Permission = 'None' | NewPermission;

export type PermissionLabel = 'Blocked' | Permission;

export type IdentityType = 'group' | 'user';

export interface PermissionEntity {
    entityId: string;
    entityType: IdentityType;
    entityLabel: string;
    readonly entity: Group | User;
}

export interface InheritedPermissionEntity extends PermissionEntity {
    inheritedPermission?: NewPermission;
}

export interface NewPermissionEntity extends PermissionEntity {
    permission: NewPermission;
}

export interface PermissionsManagementRow extends PermissionEntity {
    index: number;
    permission?: Permission;
    inheritedPermission: Permission;
    isNew: boolean;
    edited: boolean;
    inherited: boolean;
    overridden: boolean;
    readonly originalACE?: ACE;
}
