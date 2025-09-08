/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppEnv } from '../../interfaces/app-env.interface';
import { ContextApp } from '../../interfaces/context-app.interface';

export const mockApps: ContextApp[] = [
    {
        id: 'mock-id-v1',
        name: 'mock-name-v1',
        launchUrl: 'mock-launch-url-v1',
        appKey: 'mock-app-key-v1',
    },
    {
        id: 'mock-id-v2',
        name: 'mock-name-v2',
        launchUrl: 'mock-launch-url-v2',
        appKey: 'mock-app-key-v2',
        environment: {
            id: 'mock-id-v1',
            name: 'mock-name-v1',
        },
    },
    {
        id: 'mock-id-v3',
        name: 'mock-name-v3',
        launchUrl: 'mock-launch-url-v3',
        appKey: 'mock-app-key-v3',
        environment: {
            id: 'mock-id-v1',
            name: 'mock-name-v1',
        },
    },
    {
        id: 'mock-id-v4',
        name: 'mock-name-v4',
        launchUrl: 'mock-launch-url-v4',
        appKey: 'mock-app-key-v4',
        environment: {
            id: 'mock-id-v2',
            name: 'mock-name-v2',
        },
    },
    {
        id: 'mock-id-v5',
        name: 'mock-name-v5',
        launchUrl: 'mock-launch-url-v5',
        appKey: 'mock-app-key-v5',
        environment: {
            id: 'mock-id-v3',
            name: 'mock-name-v3',
        },
    },
    {
        id: 'mock-id-v6',
        name: 'mock-name-v6',
        launchUrl: 'mock-launch-url-v6',
        appKey: 'mock-app-key-v6',
    },
    {
        id: 'mock-id-v7',
        name: 'mock-name-v7',
        launchUrl: 'mock-launch-url-v7',
        appKey: 'mock-app-key-v7',
        environment: {
            id: 'mock-id-v1',
            name: 'mock-name-v1',
        },
    },
    {
        id: 'mock-id-v8',
        name: 'mock-name-v8',
        launchUrl: 'mock-launch-url-v8',
        appKey: 'mock-app-key-v8',
        environment: {
            id: 'mock-id-v1',
            name: 'mock-name-v1',
        },
    },
    {
        id: 'mock-id-v9',
        name: 'mock-name-v9',
        launchUrl: 'mock-launch-url-v9',
        appKey: 'mock-app-key-v9',
        environment: {
            id: 'mock-id-v2',
            name: 'mock-name-v2',
        },
    },
    {
        id: 'mock-id-v10',
        name: 'mock-name-v10',
        launchUrl: 'mock-launch-url-v10',
        appKey: 'mock-app-key-v10',
        environment: {
            id: 'mock-id-v3',
            name: 'mock-name-v3',
        },
    },
];

export const mockUniqueEnvs: AppEnv[] = [
    {
        id: 'mock-id-v1',
        name: 'mock-name-v1',
    },
    {
        id: 'mock-id-v2',
        name: 'mock-name-v2',
    },
    {
        id: 'mock-id-v3',
        name: 'mock-name-v3',
    },
];
