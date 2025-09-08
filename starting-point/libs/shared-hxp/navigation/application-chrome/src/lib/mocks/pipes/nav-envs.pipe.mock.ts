/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppEnv } from '../../interfaces/app-env.interface';
import { NavEnv } from '../../interfaces/nav-env.interface';

export const mockAppEnvs: AppEnv[] = [
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

export const mockNavEnvs: NavEnv[] = [
    {
        value: 'mock-id-v1',
        label: 'mock-name-v1',
    },
    {
        value: 'mock-id-v2',
        label: 'mock-name-v2',
    },
    {
        value: 'mock-id-v3',
        label: 'mock-name-v3',
    },
];
