/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionColumnPreset } from '../../../models/extension-column-preset.interface';

export const processDetailsCloudMock = {
    appName: 'mock-appName',
    businessKey: 'MyBusinessKey',
    id: '00fcc4ab-4290-11e9-b133-0a586460016a',
    initiator: 'mockuser',
    lastModified: new Date(),
    name: 'new name',
    parentId: '00fcc4ab-4290-11e9-b133-0a586460016b',
    startDate: new Date(),
    status: 'RUNNING',
    processDefinitionId: 'mock-id',
    processDefinitionKey: 'mock-key',
    processDefinitionName: 'mock-process-definition-name',
};

export const completedProcessDetailsCloudMock = {
    appName: 'mock-appName',
    businessKey: 'MyBusinessKey',
    id: '00fcc4ab-4290-11e9-b133-0a586460016a',
    initiator: 'mockuser',
    lastModified: new Date(),
    name: 'new name',
    parentId: '00fcc4ab-4290-11e9-b133-0a586460016b',
    startDate: new Date(),
    status: 'COMPLETED',
    processDefinitionId: 'mock-id',
    processDefinitionKey: 'mock-key',
    processDefinitionName: 'mock-process-definition-name',
};

export const processWithInitiator = {
    appName: 'mock-appName',
    businessKey: 'MyBusinessKey',
    id: '00fcc4ab-4290-11e9-b133-0a586460016a',
    initiator: 'process-initiator',
    lastModified: new Date(),
    name: 'new name',
    parentId: '00fcc4ab-4290-11e9-b133-0a586460016b',
    startDate: new Date(),
    status: 'RUNNING',
    processDefinitionId: 'mock-id',
    processDefinitionKey: 'mock-key',
    processDefinitionName: 'mock-process-definition-name',
};

export const fakeProcessCloudFilter = {
    name: 'MOCK_PROCESS_NAME_1',
    id: '1',
    key: 'all-mock-process',
    icon: 'adjust',
    appName: 'mock-appName',
    sort: 'startDate',
    status: 'RUNNING',
    order: 'DESC',
    index: 2,
    processName: 'process-name',
    processInstanceId: 'processInstanceId',
    initiator: 'mockuser',
    processDefinitionId: 'processDefinitionId',
    processDefinitionKey: 'processDefinitionKey',
    lastModified: null,
    lastModifiedTo: null,
    lastModifiedFrom: null,
    loaded: true,
};

export const fakeTaskCloudList = {
    list: {
        entries: [
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mock-appName',
                appVersion: 1,
                id: 'mockId',
                assignee: 'mock-assignee',
                name: 'mockTask',
                createdDate: new Date(),
                claimedDate: new Date(),
                priority: 0,
                status: 'ASSIGNED',
                owner: 'user',
                lastModified: new Date(),
                standalone: true,
                inFinalState: false,
                candidateUsers: [],
                candidateGroups: [],
            },
        ],
        pagination: {
            skipCount: 0,
            maxItems: 25,
            count: 25,
            hasMoreItems: true,
            totalItems: 424,
        },
    },
};

export const fakeTaskCloudDatatableSchema = [
    {
        key: 'name',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.NAME',
        sortable: true,
        cssClass: 'full-width name-column ellipsis-cell',
    },
    {
        key: 'status',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS',
    },
    {
        key: 'assignee',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE',
        sortable: true,
    },
    {
        key: 'createdDate',
        type: 'date',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE',
        sortable: true,
        format: 'timeAgo',
    },
    {
        key: 'lastModified',
        type: 'date',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED',
        sortable: true,
        format: 'timeAgo',
    },
    {
        key: 'dueDate',
        type: 'date',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE',
        sortable: true,
        format: 'timeAgo',
    },
    {
        key: 'priority',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY',
    },
] as ExtensionColumnPreset[];
