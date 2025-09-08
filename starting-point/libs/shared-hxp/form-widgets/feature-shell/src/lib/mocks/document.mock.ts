/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewDateItemModel, CardViewItem, CardViewTextItemModel } from '@alfresco/adf-core';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DownloadData } from '@hxp/shared-hxp/services';

export const DOCUMENT_WITH_NO_BLOB_MOCK: Document = {
    sys_id: 'DOCUMENT_WITH_NO_BLOB_MOCK_ID',
    sys_name: 'alfresco logo',
    sys_primaryType: 'SysFile',
    sys_path: '/alfresco.png',
    sys_title: 'alfresco title',
};

export const DOCUMENT_MOCK: Document = {
    sys_id: 'DOCUMENT_MOCK_ID',
    sys_name: 'alfresco logo',
    sys_title: 'alfresco title',
    sys_primaryType: 'SysFile',
    sys_path: '/alfresco.png',
    sysfile_blob: {
        digest: '0a4744c7c200d2bd1eb4f3bf7c5a762e',
        filename: 'alfresco.png',
        title: 'alfresco title',
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
        value: `${DOCUMENT_MOCK.sys_creator?.firstName} ${DOCUMENT_MOCK.sys_creator?.lastName}`,
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
        value: `${DOCUMENT_MOCK.sys_lastContributor?.firstName} ${DOCUMENT_MOCK.sys_lastContributor?.lastName}`,
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
    blob: DOCUMENT_MOCK.sysfile_blob,
    title: DOCUMENT_MOCK.sysfile_blob.title,
};
