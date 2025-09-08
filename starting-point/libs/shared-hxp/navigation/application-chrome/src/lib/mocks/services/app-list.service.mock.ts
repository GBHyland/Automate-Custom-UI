/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

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
                    provisioningStatus: 'PROVISIONED',
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
                    provisioningStatus: 'PROVISIONED',
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
                    provisioningStatus: 'PROVISIONING',
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
                    provisioningStatus: 'PROVISIONING',
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
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v5',
                        localizedName: 'mock-app-localized-name-v5',
                        appType: 'mock-app-app-type-v5',
                    },
                },
                {
                    id: 'mock-id-v6',
                    launchUrl: 'mock-launch-url-v6',
                    appKey: 'mock-app-key-v6',
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v6',
                        localizedName: 'mock-app-localized-name-v6',
                        appType: 'mock-app-app-type-v6',
                    },
                },
                {
                    id: 'mock-id-v7',
                    launchUrl: 'mock-launch-url-v7',
                    appKey: 'mock-app-key-v7',
                    provisioningStatus: 'PROVISIONING',
                    app: {
                        id: 'mock-app-id-v7',
                        localizedName: 'mock-app-localized-name-v7',
                        appType: 'mock-app-app-type-v7',
                    },
                },
                {
                    id: 'mock-id-v8',
                    launchUrl: 'mock-launch-url-v8',
                    appKey: 'mock-app-key-v8',
                    provisioningStatus: 'PROVISIONING',
                    app: {
                        id: 'mock-app-id-v8',
                        localizedName: 'mock-app-localized-name-v8',
                        appType: 'mock-app-app-type-v8',
                    },
                },
                {
                    id: 'mock-id-v9',
                    launchUrl: 'mock-launch-url-v9',
                    appKey: 'mock-app-key-v9',
                    provisioningStatus: 'PROVISIONING',
                    app: {
                        id: 'mock-app-id-v9',
                        localizedName: 'mock-app-localized-name-v9',
                        appType: 'mock-app-app-type-v9',
                    },
                },
                {
                    id: 'mock-id-v10',
                    launchUrl: 'mock-launch-url-v10',
                    appKey: 'mock-app-key-v10',
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v10',
                        localizedName: 'mock-app-localized-name-v10',
                        appType: 'mock-app-app-type-v10',
                    },
                },
            ],
            subscribedApps: [
                {
                    id: 'mock-id-v1',
                    launchUrl: 'mock-launch-url-v1',
                    appKey: 'mock-app-key-v1',
                    provisioningStatus: 'PROVISIONED',
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
                    provisioningStatus: 'CARRIEDOVER',
                    environment: {
                        id: 'mock-environment-id-v1',
                        name: 'mock-environment-name-v1',
                    },
                    app: {
                        id: 'mock-app-id-v2',
                        localizedName: 'mock-app-localized-name-v2',
                        appType: 'TEMPLATE',
                    },
                },
                {
                    id: 'mock-id-v3',
                    launchUrl: 'mock-launch-url-v3',
                    appKey: 'mock-app-key-v3',
                    provisioningStatus: 'PROVISIONED',
                    environment: {
                        id: 'mock-environment-id-v2',
                        name: 'mock-environment-name-v2',
                    },
                    app: {
                        id: 'mock-app-id-v3',
                        localizedName: 'mock-app-localized-name-v3',
                        appType: 'SERVICE',
                    },
                },
                {
                    id: 'mock-id-v4',
                    launchUrl: 'mock-launch-url-v4',
                    appKey: 'mock-app-key-v4',
                    provisioningStatus: 'PROVISIONED',
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
                    provisioningStatus: 'CARRIEDOVER',
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
                {
                    id: 'mock-id-v6',
                    launchUrl: 'mock-launch-url-v6',
                    appKey: 'mock-app-key-v6',
                    provisioningStatus: 'PROVISIONING',
                    environment: {
                        id: 'mock-environment-id-v1',
                        name: 'mock-environment-name-v1',
                    },
                    app: {
                        id: 'mock-app-id-v6',
                        localizedName: 'mock-app-localized-name-v6',
                        appType: 'mock-app-app-type-v6',
                    },
                },
                {
                    id: 'mock-id-v7',
                    launchUrl: 'mock-launch-url-v7',
                    appKey: 'mock-app-key-v7',
                    provisioningStatus: 'PROVISIONED',
                    environment: {
                        id: 'mock-environment-id-v1',
                        name: 'mock-environment-name-v1',
                    },
                    app: {
                        id: 'mock-app-id-v7',
                        localizedName: 'mock-app-localized-name-v7',
                        appType: 'mock-app-app-type-v7',
                    },
                },
                {
                    id: 'mock-id-v8',
                    launchUrl: 'mock-launch-url-v8',
                    appKey: 'mock-app-key-v8',
                    provisioningStatus: 'PROVISIONING',
                    environment: {
                        id: 'mock-environment-id-v2',
                        name: 'mock-environment-name-v2',
                    },
                    app: {
                        id: 'mock-app-id-v8',
                        localizedName: 'mock-app-localized-name-v8',
                        appType: 'mock-app-app-type-v8',
                    },
                },
                {
                    id: 'mock-id-v9',
                    launchUrl: 'mock-launch-url-v9',
                    appKey: 'mock-app-key-v9',
                    provisioningStatus: 'PROVISIONED',
                    environment: {
                        id: 'mock-environment-id-v2',
                        name: 'mock-environment-name-v2',
                    },
                    app: {
                        id: 'mock-app-id-v9',
                        localizedName: 'mock-app-localized-name-v9',
                        appType: 'SERVICE',
                    },
                },
                {
                    id: 'mock-id-v10',
                    launchUrl: 'mock-launch-url-v10',
                    appKey: 'mock-app-key-v10',
                    provisioningStatus: 'PROVISIONED',
                    environment: {
                        id: 'mock-environment-id-v3',
                        name: 'mock-environment-name-v3',
                    },
                    app: {
                        id: 'mock-app-id-v10',
                        localizedName: 'mock-app-localized-name-v10',
                        appType: 'mock-app-app-type-v10',
                    },
                },
            ],
            platformHomeUrl: 'mock-platform-home-url',
        },
    },
};

export const mockFilteredGlobalApps: GlobalApps = {
    data: {
        currentUser: {
            id: 'mock-id',
            accountApps: [
                {
                    id: 'mock-id-v1',
                    launchUrl: 'mock-launch-url-v1',
                    appKey: 'mock-app-key-v1',
                    provisioningStatus: 'PROVISIONED',
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
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v2',
                        localizedName: 'mock-app-localized-name-v2',
                        appType: 'mock-app-app-type-v2',
                    },
                },
                {
                    id: 'mock-id-v5',
                    launchUrl: 'mock-launch-url-v5',
                    appKey: 'mock-app-key-v5',
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v5',
                        localizedName: 'mock-app-localized-name-v5',
                        appType: 'mock-app-app-type-v5',
                    },
                },
                {
                    id: 'mock-id-v6',
                    launchUrl: 'mock-launch-url-v6',
                    appKey: 'mock-app-key-v6',
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v6',
                        localizedName: 'mock-app-localized-name-v6',
                        appType: 'mock-app-app-type-v6',
                    },
                },
                {
                    id: 'mock-id-v10',
                    launchUrl: 'mock-launch-url-v10',
                    appKey: 'mock-app-key-v10',
                    provisioningStatus: 'PROVISIONED',
                    app: {
                        id: 'mock-app-id-v10',
                        localizedName: 'mock-app-localized-name-v10',
                        appType: 'mock-app-app-type-v10',
                    },
                },
            ],
            subscribedApps: [
                {
                    id: 'mock-id-v1',
                    launchUrl: 'mock-launch-url-v1',
                    appKey: 'mock-app-key-v1',
                    provisioningStatus: 'PROVISIONED',
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
                    id: 'mock-id-v4',
                    launchUrl: 'mock-launch-url-v4',
                    appKey: 'mock-app-key-v4',
                    provisioningStatus: 'PROVISIONED',
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
                    provisioningStatus: 'CARRIEDOVER',
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
                {
                    id: 'mock-id-v7',
                    launchUrl: 'mock-launch-url-v7',
                    appKey: 'mock-app-key-v7',
                    provisioningStatus: 'PROVISIONED',
                    environment: {
                        id: 'mock-environment-id-v1',
                        name: 'mock-environment-name-v1',
                    },
                    app: {
                        id: 'mock-app-id-v7',
                        localizedName: 'mock-app-localized-name-v7',
                        appType: 'mock-app-app-type-v7',
                    },
                },
                {
                    id: 'mock-id-v10',
                    launchUrl: 'mock-launch-url-v10',
                    appKey: 'mock-app-key-v10',
                    provisioningStatus: 'PROVISIONED',
                    environment: {
                        id: 'mock-environment-id-v3',
                        name: 'mock-environment-name-v3',
                    },
                    app: {
                        id: 'mock-app-id-v10',
                        localizedName: 'mock-app-localized-name-v10',
                        appType: 'mock-app-app-type-v10',
                    },
                },
            ],
            platformHomeUrl: 'mock-platform-home-url',
        },
    },
};

export const mockAppsError = 'mock-apps-error';
