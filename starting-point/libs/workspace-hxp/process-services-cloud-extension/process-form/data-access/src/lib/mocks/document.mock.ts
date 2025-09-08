/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewDateItemModel, CardViewItem, CardViewTextItemModel } from '@alfresco/adf-core';
import { DownloadData } from '../services/download/download.service';
import { USER_MOCK } from './user.mock';

export const DOCUMENT_MOCK = {
    sys_changeToken: '1-0',
    sys_fulltextBinary: '  ',
    sys_hasLegalHold: false,
    sys_id: '48891f41-7abe-4afe-ba4f-81457b12dfc3',
    sysver_isCheckedIn: false,
    sys_isFolderish: false,
    sys_isLatestVersion: false,
    sys_isRecord: false,
    sys_isTrashed: false,
    sysver_isVersion: false,
    sys_mixinTypes: ['SysVersionable', 'SysFilish'],
    sys_name: 'alfresco.png',
    sys_parentId: '632eec96-4ad9-4ff3-9a8b-009a7399c67e',
    sys_path: '/Folder/alfresco.png',
    sys_pathDepth: 4,
    sys_primaryType: 'SysFile',
    sys_repository: 'default',
    sys_title: 'alfresco.png',
    sys_version: 0,
    sys_contributors: [USER_MOCK],
    sys_created: '2023-03-27T08:55:48.386+00:00',
    sys_creator: USER_MOCK,
    sys_lastContributor: USER_MOCK,
    sys_modified: '2023-03-27T08:55:48.386+00:00',
    sysfile_blob: {
        digest: '0a4744c7c200d2bd1eb4f3bf7c5a762e',
        filename: 'alfresco.png',
        length: 2158,
        mimeType: 'image/png',
    },
};

export const DOCUMENT_PROPERTIES_MOCK: CardViewItem[] = [
    new CardViewTextItemModel({
        label: 'Name',
        value: DOCUMENT_MOCK.sysfile_blob.filename,
        key: 'name',
    }),
    new CardViewTextItemModel({
        label: 'Creator',
        value: `${DOCUMENT_MOCK.sys_creator.firstName} ${DOCUMENT_MOCK.sys_creator.lastName}`,
        key: 'creator',
    }),
    new CardViewDateItemModel({
        label: 'Created Date',
        value: DOCUMENT_MOCK.sys_created,
        key: 'createdDate',
        format: 'mediumDate',
    }),
    new CardViewTextItemModel({
        key: 'size',
        label: 'Size',
        value: DOCUMENT_MOCK.sysfile_blob.length,
    }),
    new CardViewTextItemModel({
        label: 'Last Contributor',
        value: `${DOCUMENT_MOCK.sys_lastContributor.firstName} ${DOCUMENT_MOCK.sys_lastContributor.lastName}`,
        key: 'lastContributor',
    }),
    new CardViewDateItemModel({
        label: 'Last Modified Date',
        value: '2023-03-27T08:55:48.386+00:00',
        key: DOCUMENT_MOCK.sys_modified,
        format: 'mediumDate',
    }),
    new CardViewTextItemModel({
        label: 'Mime Type',
        value: DOCUMENT_MOCK.sysfile_blob.mimeType,
        key: 'mimeType',
    }),
];

export const DOCUMENT_DOWNLOAD_DATA_MOCK: DownloadData = {
    name: DOCUMENT_MOCK.sysfile_blob.filename,
    blob: new Blob([''], { type: DOCUMENT_MOCK.sysfile_blob.mimeType }),
};
