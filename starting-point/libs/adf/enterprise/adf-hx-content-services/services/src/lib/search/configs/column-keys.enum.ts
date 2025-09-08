/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export const ColumnKeys = {
    Icon: 'icon',
    SysTitle: 'sys_title',
    SysFileBlobLength: 'sysfile_blob/length',
    SysCreated: 'sys_created',
    SysModified: 'sys_modified',
    SysEffectivePermissions: 'sys_effectivePermissions',
    SysParentPath: 'sys_parentPath',
    SysPrimaryType: 'sys_primaryType',
} as const;

export type ColumnKeys = typeof ColumnKeys[keyof typeof ColumnKeys];
