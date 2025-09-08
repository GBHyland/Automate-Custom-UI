/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppEnv } from '../../interfaces/app-env.interface';
import { ContextApp } from '../../interfaces/context-app.interface';
import { ContextName } from '../../interfaces/context-name.interface';
import { GlobalApps } from '../../interfaces/global-apps.interface';

export const mockGlobalApps: GlobalApps = {
    data: {
        currentUser: {
            id: 'mock-id',
            accountApps: [
                {
                    id: 'mock-id-v1',
                    launchUrl: 'mock-launch-url-v1',
                    appKey: 'mock-app-key-v1',
                    provisioningStatus: 'mock-provisioning-status-v1',
                    app: {
                        id: 'mock-app-id-v1',
                        localizedName: 'mock-app-localized-name-v1',
                        appType: 'mock-app-app-type-v1',
                    },
                },
                {
                    id: 'mock-id-v2',
                    launchUrl: 'mock-launch-url-v2',
                    appKey: 'mock-app-key-v2',
                    provisioningStatus: 'mock-provisioning-status-v2',
                    app: {
                        id: 'mock-app-id-v2',
                        localizedName: 'mock-app-localized-name-v2',
                        appType: 'mock-app-app-type-v2',
                    },
                },
                {
                    id: 'mock-id-v3',
                    launchUrl: 'mock-launch-url-v3',
                    appKey: 'mock-app-key-v3',
                    provisioningStatus: 'mock-provisioning-status-v3',
                    app: {
                        id: 'mock-app-id-v3',
                        localizedName: 'mock-app-localized-name-v3',
                        appType: 'mock-app-app-type-v3',
                    },
                },
                {
                    id: 'mock-id-v4',
                    launchUrl: 'mock-launch-url-v4',
                    appKey: 'mock-app-key-v4',
                    provisioningStatus: 'mock-provisioning-status-v4',
                    app: {
                        id: 'mock-app-id-v4',
                        localizedName: 'mock-app-localized-name-v4',
                        appType: 'mock-app-app-type-v4',
                    },
                },
                {
                    id: 'mock-id-v5',
                    launchUrl: 'mock-launch-url-v5',
                    appKey: 'mock-app-key-v5',
                    provisioningStatus: 'mock-provisioning-status-v5',
                    app: {
                        id: 'mock-app-id-v5',
                        localizedName: 'mock-app-localized-name-v5',
                        appType: 'mock-app-app-type-v5',
                    },
                },
            ],
            subscribedApps: [
                {
                    id: 'mock-id-v1',
                    launchUrl: 'mock-launch-url-v1',
                    appKey: 'mock-app-key-v1',
                    provisioningStatus: 'mock-provisioning-status-v1',
                    environment: {
                        id: 'mock-environment-id-v1',
                        name: 'mock-environment-name-v1',
                    },
                    app: {
                        id: 'mock-app-id-v1',
                        localizedName: 'mock-app-localized-name-v1',
                        appType: 'mock-app-app-type-v1',
                    },
                },
                {
                    id: 'mock-id-v2',
                    launchUrl: 'mock-launch-url-v2',
                    appKey: 'mock-app-key-v2',
                    provisioningStatus: 'mock-provisioning-status-v2',
                    environment: {
                        id: 'mock-environment-id-v1',
                        name: 'mock-environment-name-v1',
                    },
                    app: {
                        id: 'mock-app-id-v2',
                        localizedName: 'mock-app-localized-name-v2',
                        appType: 'mock-app-app-type-v2',
                    },
                },
                {
                    id: 'mock-id-v3',
                    launchUrl: 'mock-launch-url-v3',
                    appKey: 'mock-app-key-v3',
                    provisioningStatus: 'mock-provisioning-status-v3',
                    environment: {
                        id: 'mock-environment-id-v2',
                        name: 'mock-environment-name-v2',
                    },
                    app: {
                        id: 'mock-app-id-v3',
                        localizedName: 'mock-app-localized-name-v3',
                        appType: 'mock-app-app-type-v3',
                    },
                },
                {
                    id: 'mock-id-v4',
                    launchUrl: 'mock-launch-url-v4',
                    appKey: 'mock-app-key-v4',
                    provisioningStatus: 'mock-provisioning-status-v4',
                    environment: {
                        id: 'mock-environment-id-v2',
                        name: 'mock-environment-name-v2',
                    },
                    app: {
                        id: 'mock-app-id-v4',
                        localizedName: 'mock-app-localized-name-v4',
                        appType: 'mock-app-app-type-v4',
                    },
                },
                {
                    id: 'mock-id-v5',
                    launchUrl: 'mock-launch-url-v5',
                    appKey: 'mock-app-key-v5',
                    provisioningStatus: 'mock-provisioning-status-v5',
                    environment: {
                        id: 'mock-environment-id-v3',
                        name: 'mock-environment-name-v3',
                    },
                    app: {
                        id: 'mock-app-id-v5',
                        localizedName: 'mock-app-localized-name-v5',
                        appType: 'mock-app-app-type-v5',
                    },
                },
            ],
            platformHomeUrl: 'mock-platform-home-url',
        },
    },
};

export const mockApps: ContextApp[] = [
    {
        id: 'mock-home-id',
        name: 'mock-home-name',
        launchUrl: 'mock-platform-home-url',
    },
    {
        id: 'mock-id-v1',
        name: 'mock-app-localized-name-v1',
        launchUrl: 'mock-launch-url-v1',
        appKey: 'mock-app-key-v1',
        environment: {
            id: 'mock-control-center-id',
            name: 'mock-control-center-name',
        },
    },
    {
        id: 'mock-id-v2',
        name: 'mock-app-localized-name-v2',
        launchUrl: 'mock-launch-url-v2',
        appKey: 'mock-app-key-v2',
        environment: {
            id: 'mock-control-center-id',
            name: 'mock-control-center-name',
        },
    },
    {
        id: 'mock-id-v3',
        name: 'mock-app-localized-name-v3',
        launchUrl: 'mock-launch-url-v3',
        appKey: 'mock-app-key-v3',
        environment: {
            id: 'mock-control-center-id',
            name: 'mock-control-center-name',
        },
    },
    {
        id: 'mock-id-v4',
        name: 'mock-app-localized-name-v4',
        launchUrl: 'mock-launch-url-v4',
        appKey: 'mock-app-key-v4',
        environment: {
            id: 'mock-control-center-id',
            name: 'mock-control-center-name',
        },
    },
    {
        id: 'mock-id-v5',
        name: 'mock-app-localized-name-v5',
        launchUrl: 'mock-launch-url-v5',
        appKey: 'mock-app-key-v5',
        environment: {
            id: 'mock-control-center-id',
            name: 'mock-control-center-name',
        },
    },
    {
        id: 'mock-id-v1',
        name: 'mock-app-localized-name-v1',
        launchUrl: 'mock-launch-url-v1',
        appKey: 'mock-app-key-v1',
        environment: {
            id: 'mock-environment-id-v1',
            name: 'mock-environment-name-v1',
        },
    },
    {
        id: 'mock-id-v2',
        name: 'mock-app-localized-name-v2',
        launchUrl: 'mock-launch-url-v2',
        appKey: 'mock-app-key-v2',
        environment: {
            id: 'mock-environment-id-v1',
            name: 'mock-environment-name-v1',
        },
    },
    {
        id: 'mock-id-v3',
        name: 'mock-app-localized-name-v3',
        launchUrl: 'mock-launch-url-v3',
        appKey: 'mock-app-key-v3',
        environment: {
            id: 'mock-environment-id-v2',
            name: 'mock-environment-name-v2',
        },
    },
    {
        id: 'mock-id-v4',
        name: 'mock-app-localized-name-v4',
        launchUrl: 'mock-launch-url-v4',
        appKey: 'mock-app-key-v4',
        environment: {
            id: 'mock-environment-id-v2',
            name: 'mock-environment-name-v2',
        },
    },
    {
        id: 'mock-id-v5',
        name: 'mock-app-localized-name-v5',
        launchUrl: 'mock-launch-url-v5',
        appKey: 'mock-app-key-v5',
        environment: {
            id: 'mock-environment-id-v3',
            name: 'mock-environment-name-v3',
        },
    },
];

export const mockControlCenterEnv: AppEnv = {
    id: 'mock-control-center-id',
    name: 'mock-control-center-name',
};

export const mockHomeName: ContextName = {
    id: 'mock-home-id',
    name: 'mock-home-name',
};
