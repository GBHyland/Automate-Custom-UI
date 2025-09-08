/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { DocumentPermissions } from '../document/configs/document-permissions.enum';

interface PermissionInfo {
    value: string;
    class: string;
}

type PermissionsMap = Partial<Record<DocumentPermissions | '', { value: string; class: string }>>;

const permissionMap: PermissionsMap = {
    [DocumentPermissions.MANAGE_SECURITY]: { value: 'PERMISSION_LEVEL.LABEL.EVERYTHING', class: 'everything' },
    [DocumentPermissions.READ_WRITE]: { value: 'PERMISSION_LEVEL.LABEL.READ_WRITE', class: 'readWrite' },
    [DocumentPermissions.READ]: { value: 'PERMISSION_LEVEL.LABEL.READ', class: 'read' },
};

/**
 * Transforms an array of effective permissions into a PermissionInfo object.
 *
 * @param effectivePermissions - The array of effective permissions.
 * @returns The PermissionInfo object representing the permission level, or undefined if the array is empty or no matching permission is found.
 *
 * @example
 * ```html
 * <div>{{ effectivePermissions | permissionLevel }}</div>
 * ```
 */
@Pipe({
    name: 'permissionLevel',
    standalone: true,
})
export class PermissionLevelPipe implements PipeTransform {
    transform(effectivePermissions: string[] = []): PermissionInfo | undefined {
        const emptyPermission = { value: '', class: '' };
        if (effectivePermissions.length === 0) {
            return emptyPermission;
        }
        if (effectivePermissions.includes(DocumentPermissions.MANAGE_SECURITY)) {
            return permissionMap[DocumentPermissions.MANAGE_SECURITY];
        }
        if (effectivePermissions.includes(DocumentPermissions.READ_WRITE)) {
            return permissionMap[DocumentPermissions.READ_WRITE];
        }
        if (effectivePermissions.includes(DocumentPermissions.READ)) {
            return permissionMap[DocumentPermissions.READ];
        }
        return emptyPermission;
    }
}
