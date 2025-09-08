/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ACE } from '@hylandsoftware/hxcs-js-client';

export const acl: ReadonlyArray<ACE> = [
    {
        creator: 'creator-id-1',
        group: {
            id: 'id-1',
            name: 'groupName',
        },
        permission: 'Read',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-2',
        user: {
            id: 'id-2',
            lastName: 'Doe',
            firstName: 'John',
        },
        permission: 'ReadWrite',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-1',
        group: {
            id: 'id-3',
            name: 'groupName2',
        },
        permission: 'ReadWrite',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-1',
        group: {
            id: 'id-4',
            name: 'groupName4',
        },
        permission: 'Read',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-2',
        user: {
            id: 'id-5',
            lastName: 'Lenders',
            firstName: 'Mark',
        },
        permission: 'ReadWrite',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-1',
        group: {
            id: 'id-5',
            name: 'groupName5',
        },
        permission: 'ReadWrite',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-1',
        group: {
            id: 'id-7',
            name: 'groupName7',
        },
        permission: 'Read',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-2',
        group: {
            id: 'id-8',
            name: 'groupName8',
        },
        permission: 'ReadWrite',
        granted: true,
        status: 'EFFECTIVE',
    },
    {
        creator: 'creator-id-1',
        group: {
            id: 'id-9',
            name: 'groupName9',
        },
        permission: 'ReadWrite',
        granted: true,
        status: 'EFFECTIVE',
    },
];
