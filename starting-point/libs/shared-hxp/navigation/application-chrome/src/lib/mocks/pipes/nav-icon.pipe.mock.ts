/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContextApp } from '../../interfaces/context-app.interface';
import { NavIcon } from '../../interfaces/nav-icon.interface';

export const mockAppV1: ContextApp = {
    id: 'mock-id-v1',
    name: 'mock-name-v1',
    launchUrl: 'mock-launch-url-v1',
};

export const mockAppV2: ContextApp = {
    id: 'mock-id-v2',
    name: 'mock-name-v2',
    launchUrl: 'mock-launch-url-v2',
};

export const mockAppV3: ContextApp = {
    id: 'mock-id-v3',
    name: 'mock-name-v3',
    launchUrl: 'mock-launch-url-v3',
};

export const mockNavIcons: NavIcon[] = [
    {
        id: 'mock-id-v1',
        icon: 'mock-icon-v1',
    },
    {
        id: 'mock-id-v2',
        icon: 'mock-icon-v2',
    },
];

export const mockIconV1 = 'mock-icon-v1';

export const mockIconV2 = 'mock-icon-v2';
