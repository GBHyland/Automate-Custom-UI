/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { Group, User } from '@hylandsoftware/hxcs-js-client';
import { Permission, PermissionEntity, PermissionsManagementRow } from '../models/permissions-management-row.model';
import { RequiredAce } from '../models/required-ace.model';
import { PermissionsParserHelper } from './permissions-parser.helper';
import { getEntityPropertiesFromGroup, getEntityPropertiesFromUser } from '../utils/permission-entity.utils';
import { IDENTITY_USER_SERVICE_TOKEN, IIdentityUserService } from '../../identity-user/identity-user.service';
import { getHighestAce, getHighestPermission } from '../utils/permissions-utils';
import { DocumentAclData } from '../models/permission-checker.interface';

@Injectable({
    providedIn: 'root',
})
export class PermissionsParserService {
    constructor(@Inject(IDENTITY_USER_SERVICE_TOKEN) private identityUserService: IIdentityUserService, private helper: PermissionsParserHelper) {}

    aclToPermissionsManagementRows(document: DocumentAclData): PermissionsManagementRow[] {
        const permissionsManagementRows: PermissionsManagementRow[] = [];
        const aclGroupedByEntity = this.helper.getAclGroupedByPermissionsEntity(document);

        for (const [index, entityAces] of aclGroupedByEntity.entries()) {
            const { entity, local, inherited } = entityAces;
            const localPermission = getHighestAce(local);
            const inheritedPermission = getHighestAce(inherited);
            permissionsManagementRows.push({
                index,
                ...entity,
                permission: localPermission?.permission as Permission,
                isNew: false,
                edited: false,
                inherited: inherited.length > 0,
                inheritedPermission: inheritedPermission ? (inheritedPermission.permission as Permission) : 'None',
                overridden: local.length > 0 && inherited.length > 0,
                originalACE: localPermission ?? inheritedPermission,
            });
        }

        return permissionsManagementRows;
    }

    permissionsManagementRowsToAcl(permissionsManagementRow: PermissionsManagementRow[], isInheritanceEnabled = true): RequiredAce[] {
        const { id } = this.identityUserService.getCurrentUserInfo();

        return permissionsManagementRow
            .filter((row) => row.permission && row.permission !== 'None' && (!isInheritanceEnabled || this.isPermissionHigherThanInherited(row)))
            .map((row) => {
                const appliedEntity = this.getEntityFromPermissionsManagementRow(row);
                const creator = row.edited || row.isNew ? id : row.originalACE?.creator;
                const granted = row.isNew || row.originalACE?.granted;
                return {
                    ...row.originalACE,
                    creator,
                    granted,
                    permission: row.permission,
                    ...appliedEntity,
                };
            });
    }

    getEntityPropertiesFromGroups(entities: Group[]): PermissionEntity[] {
        return entities.map((element) => getEntityPropertiesFromGroup(element));
    }

    getEntityPropertiesFromUsers(entities: User[]): PermissionEntity[] {
        return entities.map((element) => getEntityPropertiesFromUser(element));
    }

    private getEntityFromPermissionsManagementRow(row: PermissionsManagementRow) {
        let entity: any = {};
        if (row.entityType === 'user') {
            entity = { user: row.entity as User };
        } else if (row.entityType === 'group') {
            entity = { group: row.entity as Group };
        }
        return entity;
    }

    private isPermissionHigherThanInherited(row: PermissionsManagementRow): boolean {
        if (!row.permission) {
            return false;
        }
        return row.permission && getHighestPermission(row.permission, row.inheritedPermission) !== row.inheritedPermission;
    }
}
