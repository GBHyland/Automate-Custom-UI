/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { ACE } from '@hylandsoftware/hxcs-js-client';
import { PermissionEntity } from '../models/permissions-management-row.model';
import { getEntityPropertiesFromGroup, getEntityPropertiesFromUser } from '../utils/permission-entity.utils';
import { DocumentAclData } from '../models/permission-checker.interface';

interface PermissionEntityAcl {
    entity: PermissionEntity;
    local: ACE[];
    inherited: ACE[];
}

@Injectable({
    providedIn: 'root',
})
export class PermissionsParserHelper {
    getAclGroupedByPermissionsEntity({ sys_acl = [], sys_effectiveAcl = [] }: DocumentAclData): PermissionEntityAcl[] {
        const aclGroupedByEntity = new Map<string, PermissionEntityAcl>();
        sys_effectiveAcl.forEach((ace) => {
            if (this.isValidAce(ace)) {
                const [entity] = this.getEntityFromAce(ace);
                const key = `${entity.entityType}_${entity.entityId}`;
                const entityAclData = aclGroupedByEntity.get(key) ?? { entity, local: [], inherited: [] };
                if (this.isAcePresentInAcl(ace, sys_acl)) {
                    const acl = entityAclData.local;
                    aclGroupedByEntity.set(key, { ...entityAclData, local: [...acl, ace] });
                } else {
                    const acl = entityAclData.inherited;
                    aclGroupedByEntity.set(key, { ...entityAclData, inherited: [...acl, ace] });
                }
            }
        });
        return [...aclGroupedByEntity.values()];
    }

    private isValidAce(ace: ACE) {
        return (ace.user || ace.group) && ace.granted && ace.status === 'EFFECTIVE';
    }

    private getEntityFromAce(ace: ACE): PermissionEntity[] {
        const permissionEntity = [];
        if (ace.user) {
            permissionEntity.push(getEntityPropertiesFromUser(ace.user));
        } else if (ace.group) {
            permissionEntity.push(getEntityPropertiesFromGroup(ace.group));
        }
        return permissionEntity;
    }

    private isAcePresentInAcl(aceToFind: ACE, acl: ACE[]): boolean {
        const entityToFind = this.getEntityFromAce(aceToFind);
        return acl.some(
            (ace) =>
                ace.granted === aceToFind.granted &&
                ace.permission === aceToFind.permission &&
                ace.begin === aceToFind.begin &&
                ace.creator === aceToFind.creator &&
                ace.end === aceToFind.end &&
                ace.status === aceToFind.status &&
                this.isSameEntity(entityToFind, this.getEntityFromAce(ace))
        );
    }

    private isSameEntity([entityToFind]: PermissionEntity[], [entity]: PermissionEntity[]): boolean {
        return entity.entityId === entityToFind.entityId && entity.entityType === entityToFind.entityType;
    }
}
