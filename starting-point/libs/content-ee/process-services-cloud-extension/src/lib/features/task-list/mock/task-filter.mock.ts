/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TaskFilterCloudModel, TaskListRequestModel, TaskListRequestSortingModel } from '@alfresco/adf-process-services-cloud';

export const fakeTaskFilter: TaskFilterCloudModel = new TaskFilterCloudModel({
    id: 'mockId',
    name: 'mockName',
    key: 'mockKey',
    environmentId: 'mockEnvironmentId',
    icon: 'mockIcon',
    index: 0,
    appName: 'mock-appName',
    sort: 'createdDate',
    order: 'ASC',
    standalone: false,
    showCounter: true,
});

export const fakeEditTaskFilter = {
    'adf-edit-task-filter': {
        filterProperties: [
            'status',
            'assignee',
            'sort',
            'order',
            'taskName',
            'priority',
            'processDefinitionName',
            'dueDate',
            'completedBy',
            'assignment',
        ],
        sortProperties: ['id', 'name', 'createdDate', 'priority', 'processDefinitionId', 'dueDate'],
        actions: ['save', 'saveAs', 'delete'],
    },
};

export const fakeTaskCloudFilters = <TaskFilterCloudModel[]>[
    {
        name: 'MY_TASKS',
        id: '1',
        key: 'my-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        statuses: ['ASSIGNED'],
        order: 'DESC',
    },
    {
        name: 'QUEUED_TASKS',
        id: '2',
        key: 'queued-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        statuses: ['CREATED'],
        order: 'DESC',
    },
    {
        name: 'COMPLETED_TASKS',
        id: '3',
        key: 'completed-tasks',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        statuses: ['COMPLETED'],
        order: 'DESC',
    },
];

const minimalTaskListRequest = {
    appName: 'mock-appName',
    pagination: { maxItems: 25, skipCount: 0 },
    sorting: new TaskListRequestSortingModel({ orderBy: 'createdDate', direction: 'ASC', isFieldProcessVariable: false }),
    processVariableFilters: [],
};

export const myTasksQueryRequestMock = new TaskListRequestModel({
    ...minimalTaskListRequest,
    status: ['ASSIGNED'],
});

export const queuedTasksQueryRequestMock = new TaskListRequestModel({
    ...minimalTaskListRequest,
    status: ['CREATED'],
});

export const completedTasksQueryRequestMock = new TaskListRequestModel({
    ...minimalTaskListRequest,
    status: ['COMPLETED'],
});
