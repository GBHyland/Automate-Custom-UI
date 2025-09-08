/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CardViewItem } from '@alfresco/adf-core';

export interface ExtendedCardViewItem extends CardViewItem {
    isEmpty: () => boolean;
    isValid?: () => boolean;
}

export const defaultPropertiesMock: ExtendedCardViewItem[] = [
    {
        label: 'Title',
        value: 'Test-2024',
        key: 'sys_title',
        type: 'text',
        displayValue: 'Test-2024',
        editable: true,
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Filename',
        value: 'Test.pdf',
        key: 'sysfile_blob.filename',
        type: 'text',
        displayValue: 'Test.pdf',
        editable: true,
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Created',
        value: '2024-10-01T46:58.892+00:00',
        key: 'sys_created',
        type: 'date',
        displayValue: 'Oct 1, 2024',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'LastModified',
        value: '2024-10-01T46:58.892+00:00',
        key: 'sys_modified',
        type: 'date',
        displayValue: 'Oct 1, 2024',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Creator',
        value: 'Test user',
        key: 'sys_creator',
        type: 'text',
        displayValue: 'Test user',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Last Contributor',
        value: 'Test user',
        key: 'sys_lastContributor',
        type: 'text',
        displayValue: 'Test user',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Mime Type',
        value: 'application/pdf',
        key: 'sysfile_blob.mimeType',
        type: 'text',
        displayValue: 'application/pdf',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Size',
        value: '260.35 KB',
        key: 'sysfile_blob.filename',
        type: 'text',
        displayValue: '260.35 KB',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Contributors',
        value: 'Test user',
        key: 'sys_lastContributor',
        type: 'text',
        displayValue: 'Test user',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Path',
        value: '/test folder/Test.pdf',
        key: 'sys_path',
        type: 'text',
        displayValue: '/test folder/Test.pdf',
        isEmpty: () => false,
        isValid: () => true,
    },
    {
        label: 'Description',
        value: 'File description',
        key: 'sys_description',
        type: 'text',
        displayValue: 'File description',
        isEmpty: () => false,
        isValid: () => true,
    },
];
