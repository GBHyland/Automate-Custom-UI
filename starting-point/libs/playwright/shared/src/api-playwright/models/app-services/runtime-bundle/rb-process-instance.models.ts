/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export type TaskStatus = 'COMPLETED' | 'CREATED' | 'ASSIGNED' | 'SUSPENDED' | 'CANCELLED' | 'RUNNING';

export interface ProcessInstanceResponse {
    list: {
        entries: ProcessInstanceData[];
    };
}

export interface ProcessInstanceData {
    entry: ProcessInstanceDataEntry;
}

export interface ProcessInstanceDataEntry {
    serviceName: string;
    serviceFullName: string;
    serviceVersion: string;
    appName: string;
    appVersion: string;
    id: string;
    assignee: string;
    name: string;
    createdDate: string;
    priority: number;
    processDefinitionId: string;
    processDefinitionKey?: string;
    processInstanceId: string;
    processDefinitionVersion: number;
    processDefinitionName: string;
    status: TaskStatus;
    formKey: string;
    lastModified: string;
    standalone: boolean;
    inFinalState: boolean;
    candidateUsers: [];
    candidateGroups: [];
}
