/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ACE, Document } from '@hylandsoftware/hxcs-js-client';
import { Permission } from '../models/permissions-management-row.model';
import { UserType } from '../models/user-type.enum';

const levels: Permission[] = ['Read', 'ReadWrite', 'Everything'];

export const EVERYONE_USER_ID = '__Everyone__';
export const EVERYTHING_PERMISSION = 'Everything';
export const EFFECTIVE_STATUS = 'EFFECTIVE';

export const NOTIFICATION_MESSAGES = {
    restore: {
        success: {
            [UserType.GROUPS]: 'PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_GROUP_SUCCESS',
            [UserType.USERS]: 'PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_USER_SUCCESS',
            [UserType.ALL]: 'PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_SUCCESS',
        },
        error: 'PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_ERROR',
    },
    save: {
        success: 'PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.SAVE_SUCCESS',
        error: 'PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.SAVE_ERROR',
    },
};

export const getHighestAce = (acl: Array<ACE | undefined>): ACE | undefined => {
    acl.sort((ace1, ace2) => {
        const ace1Level = levels.indexOf(ace1?.permission as Permission);
        const ace2Level = levels.indexOf(ace2?.permission as Permission);
        return ace2Level - ace1Level;
    });
    return acl.length > 0 ? acl[0] : undefined;
};

export const getHighestPermission = (permission1: Permission, permission2: Permission): Permission => {
    const ace1Level = levels.indexOf(permission1);
    const ace2Level = levels.indexOf(permission2);
    return ace1Level > ace2Level ? permission1 : permission2;
};

export const isPermissionInheritanceEnabled = (document: Document): boolean => {
    const { sys_acl = [] } = document;
    return !sys_acl.some((ace) => isAclInheritanceBlocked(ace));
};

export const isAclInheritanceBlocked = (ace?: ACE): boolean => {
    return ace?.user?.id === EVERYONE_USER_ID && ace.permission === EVERYTHING_PERMISSION && ace.status === EFFECTIVE_STATUS && ace.granted === false;
};

export function removeUserTypeFromAcl(acl: ACE[], restoreOption: UserType): ACE[] {
    if (restoreOption === UserType.ALL) {
        return [];
    }

    return acl.filter((row) => {
        switch (restoreOption) {
            case UserType.GROUPS:
                return !row.group;
            case UserType.USERS:
                return !row.user;
            default:
                return false;
        }
    });
}

export function getNotificationMessage(isSuccess: boolean, restoreType?: UserType): string {
    const actionType = restoreType ? 'restore' : 'save';
    if (isSuccess) {
        return restoreType ? NOTIFICATION_MESSAGES.restore.success[restoreType] : NOTIFICATION_MESSAGES.save.success;
    }
    return NOTIFICATION_MESSAGES[actionType].error;
}
