/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const DocumentPermissions = {
    CREATE_CHILD: 'CreateChild',
    CREATE_VERSION: 'CreateVersion',
    DELETE: 'Delete',
    DELETE_CHILD: 'DeleteChild',
    EVERYTHING: 'Everything',
    MANAGE_LOCK: 'ManageLock',
    MANAGE_RETENTION: 'ManageRetention',
    READ: 'Read',
    READ_WRITE: 'ReadWrite',
    WRITE: 'Write',
    WRITE_VERSION: 'WriteVersion',
    MANAGE_SECURITY: 'ManageSecurity',
    READ_VERSION: 'ReadVersion',
} as const;

export type DocumentPermissions = typeof DocumentPermissions[keyof typeof DocumentPermissions];
