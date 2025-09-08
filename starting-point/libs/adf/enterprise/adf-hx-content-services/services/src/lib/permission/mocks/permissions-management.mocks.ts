/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NewPermissionEntity, PermissionsManagementRow } from '../models/permissions-management-row.model';

export const newPermissionEntity: Readonly<NewPermissionEntity> = {
    permission: 'Everything',
    entityType: 'user',
    entity: {
        id: 'newId',
        firstName: 'Danny',
        lastName: 'Dan',
    },
    entityLabel: 'Danny Dan',
    entityId: 'newId',
};

export const newPermissionManagementRow: Readonly<PermissionsManagementRow> = {
    ...newPermissionEntity,
    isNew: true,
    edited: true,
    inherited: false,
    overridden: false,
    index: 0,
    inheritedPermission: 'None',
};

export const mockPermissionManagementRows: PermissionsManagementRow[] = [
    {
        index: 0,
        permission: 'ReadWrite',
        isNew: false,
        edited: false,
        entityType: 'group',
        entity: {
            id: 'id-group-1',
            name: 'groupName1',
        },
        entityLabel: 'groupName1',
        entityId: 'id-group-1',
        inherited: false,
        overridden: false,
        inheritedPermission: 'None',
    },
    {
        index: 1,
        permission: undefined,
        isNew: false,
        edited: false,
        entityType: 'user',
        entity: {
            id: 'id-user-1',
            firstName: 'John',
            lastName: 'Doe',
        },
        entityLabel: 'John Doe',
        entityId: 'id-user-1',
        inherited: true,
        overridden: false,
        inheritedPermission: 'Everything',
    },
    {
        index: 2,
        permission: undefined,
        isNew: false,
        edited: false,
        entityType: 'group',
        entity: {
            id: 'id-group-2',
            name: 'groupName2',
        },
        entityLabel: 'groupName2',
        entityId: 'id-group-2',
        inherited: true,
        overridden: false,
        inheritedPermission: 'Read',
    },
    {
        index: 3,
        permission: 'Read',
        isNew: false,
        edited: false,
        entityType: 'user',
        entity: {
            id: 'id-user-a',
            firstName: 'Johnny',
            lastName: 'Mox',
        },
        entityLabel: 'Johnny Mox',
        entityId: 'id-user-a',
        inherited: false,
        overridden: false,
        inheritedPermission: 'None',
    },
    {
        index: 4,
        permission: 'ReadWrite',
        isNew: false,
        edited: false,
        entityType: 'user',
        entity: {
            id: 'id-user-b',
            firstName: 'Johan',
            lastName: 'Strauss',
        },
        entityLabel: 'Johan Strauss',
        entityId: 'id-user-b',
        inherited: true,
        overridden: true,
        inheritedPermission: 'Read',
    },
    {
        index: 5,
        permission: undefined,
        isNew: false,
        edited: false,
        entityType: 'user',
        entity: {
            id: 'id-user-c',
            firstName: 'Johnny',
            lastName: 'Speccy',
        },
        entityLabel: 'Johnny Speccy',
        entityId: 'id-user-c',
        inherited: true,
        overridden: false,
        inheritedPermission: 'Read',
    },
];
