/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NavBarGroupRef } from '@alfresco/adf-extensions';

export const mockSidenavItems: NavBarGroupRef[] = [
    {
        id: 'app.navbar.primary',
        items: [
            {
                id: 'mock-sidenav-item-my-files',
                icon: 'file',
                route: 'my-files-mock-route',
                title: 'my files mock',
                rules: {
                    visible: 'mock-my-files-evaluator',
                },
            },
            {
                id: 'mock-sidenav-item-shared-files',
                icon: 'file',
                route: 'shared-files-mock-route',
                title: 'shared files mock',
                rules: {
                    visible: 'mock-shared-files-evaluator',
                },
            },
        ],
        rules: {
            visible: 'primary-sidenav-evaluator',
        },
    },
    {
        id: 'app.navbar.secondary',
        items: [
            {
                id: 'mock-sidenav-item-my-tasks',
                icon: 'task',
                route: 'my-tasks-mock-route',
                title: 'my tasks mock',
                rules: {
                    visible: 'mock-my-tasks-evaluator',
                },
            },
            {
                id: 'mock-sidenav-item-my-processes',
                icon: 'process',
                route: 'my-processes-mock-route',
                title: 'my processes mock',
                rules: {
                    visible: 'mock-shared-my-processes-evaluator',
                },
            },
        ],
        rules: {
            visible: 'secondary-sidenav-evaluator',
        },
    },
];
