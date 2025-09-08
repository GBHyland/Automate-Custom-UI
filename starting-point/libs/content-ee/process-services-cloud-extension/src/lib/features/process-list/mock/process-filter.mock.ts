/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFilterCloudModel, ProcessListRequestSortingModel, ProcessListRequestModel } from '@alfresco/adf-process-services-cloud';

export const fakeProcessCloudFilter: ProcessFilterCloudModel = new ProcessFilterCloudModel({
    id: 'mockId',
    name: 'mockName',
    key: 'mockKey',
    icon: 'mockIcon',
    index: 0,
    appName: 'mock-appName',
    sort: 'startDate',
    order: 'DESC',
});

export const fakeProcessCloudFilters = <ProcessFilterCloudModel[]>[
    {
        name: 'MOCK_PROCESS_NAME_1',
        id: 'all-processes-mock-id',
        key: 'all-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        statuses: [''],
        order: 'DESC',
    },
    {
        name: 'MOCK_PROCESS_NAME_2',
        id: 'running-processes-mock-id',
        key: 'running-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        statuses: ['RUNNING'],
        order: 'DESC',
    },
    {
        name: 'MOCK_PROCESS_NAME_3',
        id: 'completed-processes-mock-id',
        key: 'completed-processes',
        icon: 'adjust',
        appName: 'mock-appName',
        sort: 'startDate',
        statuses: ['COMPLETED'],
        order: 'DESC',
    },
];

const minimalProcessListRequest = {
    appName: 'mock-appName',
    pagination: { maxItems: 25, skipCount: 0 },
    sorting: new ProcessListRequestSortingModel({ orderBy: 'startDate', direction: 'DESC', isFieldProcessVariable: false }),
    processVariableFilters: [],
    lastModifiedFrom: '',
    lasModifiedTo: '',
};

export const allProcessesQueryRequestMock = new ProcessListRequestModel({
    ...minimalProcessListRequest,
    status: [''],
});

export const runningProcessesQueryRequestMock = new ProcessListRequestModel({
    ...minimalProcessListRequest,
    status: ['RUNNING'],
});

export const completedProcessesQueryRequestMock = new ProcessListRequestModel({
    ...minimalProcessListRequest,
    status: ['COMPLETED'],
});
