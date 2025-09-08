/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Group, User } from '@hylandsoftware/hxcs-js-client';
import { PermissionEntity } from '../models/permissions-management-row.model';

export const getEntityPropertiesFromGroup = (entity: Group): PermissionEntity => {
    return {
        entityId: entity.id ?? '',
        entityType: 'group',
        entityLabel: `${entity.name || ''}`.trim(),
        entity,
    };
};

export const getEntityPropertiesFromUser = (entity: User): PermissionEntity => {
    return {
        entityId: entity.id ?? '',
        entityType: 'user',
        entityLabel: `${entity.firstName} ${entity.lastName}`.trim(),
        entity,
    };
};
