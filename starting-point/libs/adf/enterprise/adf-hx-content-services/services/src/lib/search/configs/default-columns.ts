/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ColumnConfig } from '../models/column-config-data.interface';
import { ColumnKeys } from './column-keys.enum';

export const DEFAULT_COLUMNS: ColumnConfig[] = [
    { key: ColumnKeys.Icon, title: 'File Type', sortable: false, removable: true },
    { key: ColumnKeys.SysTitle, title: 'DOCUMENT_LIST.COLUMNS.TITLE', sortable: true, removable: false },
    { key: ColumnKeys.SysFileBlobLength, title: 'DOCUMENT_LIST.COLUMNS.SIZE', sortable: true, removable: true },
    { key: ColumnKeys.SysCreated, title: 'DOCUMENT_LIST.COLUMNS.CREATED.LABEL', sortable: true, removable: true },
    { key: ColumnKeys.SysModified, title: 'DOCUMENT_LIST.COLUMNS.LAST_MODIFIED.LABEL', sortable: true, removable: true },
    { key: ColumnKeys.SysEffectivePermissions, title: 'DOCUMENT_LIST.COLUMNS.PERMISSION', sortable: true, removable: true },
    { key: ColumnKeys.SysParentPath, title: 'DOCUMENT_LIST.COLUMNS.LOCATION', sortable: true, removable: true },
    { key: ColumnKeys.SysPrimaryType, title: 'DOCUMENT_LIST.COLUMNS.DOCUMENT_CATEGORY', sortable: true, removable: true },
];
