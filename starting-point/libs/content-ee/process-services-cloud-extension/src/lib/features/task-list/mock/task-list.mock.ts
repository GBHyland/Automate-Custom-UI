/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable max-lines */

import { ExtensionColumnPreset } from '../../../models/extension-column-preset.interface';

export const fakeTaskCloudList = {
    list: {
        entries: [
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mockId',
                processInstanceId: 'mockProcessInstanceId',
                assignee: 'mock-assignee',
                name: 'nameFake1',
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

export const fakeTaskCloudDatatableSchema = {
    'adf-cloud-task-list': {
        presets: {
            default: [
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
            ],
        },
    },
} as any;

export const mockTaskListPresetColumns = [
    {
        id: 'name',
        key: 'name',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.NAME',
        template: 'app.taskList.columns.name',
        sortable: true,
        cssClass: 'full-width name-column ellipsis-cell',
    },
    {
        id: 'status',
        key: 'status',
        type: 'text',
        template: 'app.taskList.columns.status',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.STATUS',
    },
    {
        id: 'assignee',
        key: 'assignee',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.ASSIGNEE',
        sortable: true,
    },
    {
        id: 'createdDate',
        key: 'createdDate',
        type: 'date',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.CREATED_DATE',
        sortable: true,
        format: 'timeAgo',
    },
    {
        id: 'lastModified',
        key: 'lastModified',
        type: 'date',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.LAST_MODIFIED',
        sortable: true,
        format: 'timeAgo',
    },
    {
        id: 'dueDate',
        key: 'dueDate',
        type: 'date',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.DUE_DATE',
        sortable: true,
        format: 'timeAgo',
    },
    {
        id: 'priority',
        key: 'priority',
        type: 'text',
        title: 'ADF_CLOUD_TASK_LIST.PROPERTIES.PRIORITY',
    },
] as ExtensionColumnPreset[];

export const myTasksMockList = {
    list: {
        entries: [
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mock-id-1',
                assignee: 'mock-assignee',
                name: 'mock-task-name-1',
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
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mock-id-2',
                assignee: 'mock-assignee',
                name: 'mock-task-name-2',
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

export const queuedTasksMockList = {
    list: {
        entries: [
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mock-id-1',
                assignee: 'mock-assignee',
                name: 'mock-task-name-1',
                createdDate: new Date(),
                claimedDate: new Date(),
                priority: 0,
                status: 'CREATED',
                owner: 'user',
                lastModified: new Date(),
                standalone: true,
                inFinalState: false,
                candidateUsers: [],
                candidateGroups: [],
            },
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mock-id-2',
                assignee: 'mock-assignee',
                name: 'mock-task-name-2',
                createdDate: new Date(),
                claimedDate: new Date(),
                priority: 0,
                status: 'CREATED',
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

export const completedTasksMockList = {
    list: {
        entries: [
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mock-id-1',
                assignee: 'mock-assignee',
                name: 'mock-task-name-1',
                createdDate: new Date(),
                claimedDate: new Date(),
                priority: 0,
                status: 'COMPLETED',
                owner: 'user',
                lastModified: new Date(),
                standalone: true,
                inFinalState: false,
                candidateUsers: [],
                candidateGroups: [],
            },
            {
                serviceName: 'mockApp',
                serviceFullName: 'mockApp',
                serviceVersion: 1,
                appName: 'mockApp',
                appVersion: 1,
                id: 'mock-id-2',
                assignee: 'mock-assignee',
                name: 'mock-task-name-2',
                createdDate: new Date(),
                claimedDate: new Date(),
                priority: 0,
                status: 'COMPLETED',
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
