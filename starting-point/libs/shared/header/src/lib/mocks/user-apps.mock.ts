/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UserApps, UserAppsResponse } from '../interfaces/apps.interface';

export const userAppsMock: UserApps[] = [
    {
        appKey: 'hxps-admin',
        launchUrl: 'fake-admin-url',
        localizedName: 'admin app',
    },
    {
        appKey: 'hxps-modeling',
        launchUrl: 'fake-modeling-url',
        localizedName: 'modeling app',
    },
];

export const userAppsResponseMock: UserAppsResponse[] = [
    {
        appKey: 'hxps-admin',
        id: '67fc2630-2cb9-4f12-8283-f0b359d7581d',
        status: 'PROVISIONED',
        launchUrl: 'fake-admin-url',
        app: {
            id: '9289c519-c224-46ee-9ed3-9dc320744586',
            localizedName: 'admin app',
            appType: 'STANDARD',
        },
        roles: ['admin'],
    },
    {
        appKey: 'hxps-modeling',
        id: '67fc2630-2cb9-sds-8283-36356456754',
        status: 'PROVISIONED',
        launchUrl: 'fake-modeling-url',
        app: {
            id: '9289c519-f845-46ee-9ed3-9dc320744586',
            localizedName: 'modeling app',
            appType: 'STANDARD',
        },
        roles: ['modeler'],
    },
];
