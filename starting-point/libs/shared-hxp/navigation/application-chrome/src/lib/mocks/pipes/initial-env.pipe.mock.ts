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
        environment: {
            id: 'mock-environment-id-v1',
            name: 'mock-environment-name-v1',
        },
    },
    {
        id: 'mock-id-v2',
        name: 'mock-name-v2',
        launchUrl: 'mock-launch-url-v2',
        appKey: 'mock-app-key-v2',
    },
    {
        id: 'mock-id-v3',
        name: 'mock-name-v3',
        launchUrl: 'mock-launch-url-v3',
        appKey: 'mock-app-key-v3',
    },
];

export const mockCurrentAppKeyV1 = 'mock-app-key-v1';

export const mockCurrentAppKeyV2 = 'mock-app-key-v2';

export const mockCurrentAppKeyNotListed = 'mock-app-key-not-listed';

export const mockControlCenterEnv: AppEnv = {
    id: 'mock-control-center-id',
    name: 'mock-control-center-name',
};

export const mockAppEnv: AppEnv = {
    id: 'mock-environment-id-v1',
    name: 'mock-environment-name-v1',
};
