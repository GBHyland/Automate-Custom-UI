/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ExtensionColumnPreset } from '../../../models/extension-column-preset.interface';

export const fakeProcessCloudList = {
    list: {
        entries: [
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id',
                name: 'mockProcess',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a58646001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'RUNNING',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id-2',
                name: 'mockProcess2',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a534546001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'RUNNING',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
        ],
        pagination: {
            skipCount: 0,
            maxItems: 100,
            count: 1,
            hasMoreItems: false,
            totalItems: 1,
        },
    },
};

export const fakeCompletedProcessesMockList = {
    list: {
        entries: [
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id',
                name: 'mockProcess',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a58646001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'COMPLETED',
                lastModified: 1540381146276,
                completedDate: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id-2',
                name: 'mockProcess2',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a534546001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                completedDate: 1540381146276,
                status: 'COMPLETED',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
        ],
        pagination: {
            skipCount: 0,
            maxItems: 100,
            count: 1,
            hasMoreItems: false,
            totalItems: 1,
        },
    },
};

export const allProcessesMockList = {
    list: {
        entries: [
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id',
                name: 'runningProcess',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a58646001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'RUNNING',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id-2',
                name: 'suspendedProcess',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a534546001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'SUSPENDED',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id-2',
                name: 'completedProcess',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a534546001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'COMPLETED',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
            {
                appName: 'mock-appName',
                appVersion: 1,
                id: 'process-id-2',
                name: 'cancelledProcess',
                processDefinitionId: 'BasicProcess:1:d05062f1-c6fb-11e8-ae24-0a534546001fa',
                processDefinitionKey: 'BasicProcess',
                initiator: 'devops',
                startDate: 1540381146275,
                businessKey: 'MyBusinessKey',
                status: 'CANCELLED',
                lastModified: 1540381146276,
                lastModifiedTo: null,
                lastModifiedFrom: null,
            },
        ],
        pagination: {
            skipCount: 0,
            maxItems: 100,
            count: 1,
            hasMoreItems: false,
            totalItems: 1,
        },
    },
};

export const fakeProcessCloudFilterProperties = {
    'adf-cloud-process-filter-config': {
        filterProperties: ['status', 'sort', 'order', 'processName', 'processDefinitionName', 'initiator', 'suspendedDateRange'],
        sortProperties: ['name', 'status', 'startDate', 'initiator'],
        actions: ['save', 'saveAs', 'delete'],
    },
};

export const fakeDefaultPresetColumns = [
    {
        key: 'name',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.NAME',
        sortable: true,
    },
    {
        key: 'processDefinitionName',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.PROCESS_DEFINITION_NAME',
        sortable: true,
    },
    {
        key: 'relatedProcess',
        type: 'text',
        title: 'PROCESS_CLOUD_EXTENSION.PROCESS_LIST.PROPERTIES.RELATED_PROCESS',
        sortable: true,
    },
    {
        key: 'status',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.STATUS',
        sortable: true,
    },
    {
        key: 'startDate',
        type: 'date',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.START_DATE',
        sortable: true,
        format: 'timeAgo',
    },
    {
        key: 'completedDate',
        type: 'date',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.COMPLETED_DATE',
        sortable: true,
        format: 'mediumDate',
    },
    {
        key: 'initiator',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.INITIATOR',
        sortable: true,
    },
    {
        key: 'appVersion',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.APP_VERSION',
        sortable: true,
    },
];

export const fakeProcessCloudDatatableSchema = {
    'adf-cloud-process-list': {
        presets: {
            default: fakeDefaultPresetColumns,
        },
    },
} as any;

export const processListCustomColumnsPresets = [
    {
        id: 'name',
        key: 'name',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.NAME',
        template: 'process-services-cloud.process-name',
        sortable: true,
    },
    {
        id: 'processDefinitionName',
        key: 'processDefinitionName',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.PROCESS_DEFINITION_NAME',
        sortable: true,
    },
    {
        id: 'status',
        key: 'status',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.STATUS',
        template: 'process-services-cloud.process-status',
        sortable: true,
    },
    {
        id: 'startDate',
        key: 'startDate',
        type: 'date',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.START_DATE',
        sortable: true,
        format: 'timeAgo',
    },
    {
        id: 'initiator',
        key: 'initiator',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.INITIATOR',
        sortable: true,
    },
    {
        id: 'appVersion',
        key: 'appVersion',
        type: 'text',
        title: 'ADF_CLOUD_PROCESS_LIST.PROPERTIES.APP_VERSION',
        sortable: true,
    },
] as ExtensionColumnPreset[];
