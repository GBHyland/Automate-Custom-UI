/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface ProcessVariableResponse {
    list: {
        entries: ProcessVariableEntry[];
    };
}

export interface ProcessVariableEntry {
    entry: {
        appName: string;
        createTime: string;
        id: string;
        lastUpdatedTime: string;
        markedAsDeleted: boolean;
        name: string;
        processDefinitionKey: string;
        processInstanceId: string;
        serviceFullName: string;
        serviceName: string;
        serviceVersion: string;
        taskVariable: boolean;
        type: string;
        value: any;
    };
}

export interface StartMessageResponse {
    entry: {
        appVersion: string;
        appName: string;
        serviceName: string;
        serviceFullName: string;
        serviceType: string;
        serviceVersion: string;
        id: string;
        startDate: string;
        initiator: string;
        status: string;
        processDefinitionId: string;
        processDefinitionKey: string;
        processDefinitionVersion: number;
        processDefinitionName: string;
    };
}

export interface StandaloneTaskData {
    entry: StandaloneTaskEntry;
}

export interface StandaloneTaskEntry {
    appVersion: string;
    appName: string;
    serviceName: string;
    serviceFullName: string;
    serviceType: string;
    serviceVersion: string;
    id: string;
    owner: string;
    assignee: string;
    name: string;
    createdDate: string;
    priority: number;
    status: string;
    standalone: boolean;
}

export interface StandaloneListData {
    list: {
        entries: StandaloneTaskEntry[];
    };
}

export interface TaskData {
    entry: TaskDataEntry;
}
export interface TaskDataEntry {
    appVersion: string;
    appName: string;
    serviceName: string;
    serviceFullName: string;
    serviceType: string;
    serviceVersion: string;
    id: string;
    assignee: string;
    name: string;
    createdDate: string;
    priority: number;
    processDefinitionId: string;
    processInstanceId: string;
    status: string;
    taskDefinitionKey: string;
    standalone: false;
    formKey: string;
}

export interface TaskListData {
    list: {
        entries: TaskDataEntry[];
    };
}

export interface StandaloneTaskOptions {
    payloadType: 'CreateTaskPayload';
    assignee: string;
    parentTaskId: string;
}
