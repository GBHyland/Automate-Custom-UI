/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFilterCloudModel, TaskFilterCloudModel } from '@alfresco/adf-process-services-cloud';

export const mockProcessCloudFilters = <ProcessFilterCloudModel[]>[
    {
        name: 'MOCK_PROCESS_NAME_1',
        id: '14',
        key: 'all-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: '',
        order: 'DESC',
    },
    {
        name: 'MOCK_PROCESS_NAME_2',
        id: '2',
        key: 'running-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'RUNNING',
        order: 'DESC',
    },
];

export const mockTaskCloudFilters = <TaskFilterCloudModel[]>[
    {
        name: 'MY_TASKS',
        id: '199',
        key: 'my-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'ASSIGNED',
        order: 'DESC',
    },
    {
        name: 'QUEUED_TASKS',
        id: '2',
        key: 'queued-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        status: 'CREATED',
        order: 'DESC',
    },
];
