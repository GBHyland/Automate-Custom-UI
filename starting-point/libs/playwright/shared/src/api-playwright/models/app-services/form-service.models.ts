/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TaskStatus } from './runtime-bundle/rb-process-instance.models';

export interface StartProcessData {
    entry: StartProcessDataEntry;
}

export interface StartProcessDataEntry {
    appVersion: string;
    appName: string;
    serviceName: string;
    serviceFullName: string;
    serviceType: string;
    serviceVersion: string;
    id: string;
    startDate: string;
    status: string;
    processDefinitionId: string;
    processDefinitionKey: string;
    processDefinitionVersion: number;
    processDefinitionName: string;
}

export interface FormRepresentation {
    formRepresentation: {
        id: string;
        name: string;
        version: number;
        formDefinition: FormDefinition;
    };
}

export interface FormDefinition {
    tabs: [];
    fields: Container[];
    outcomes: Outcomes[];
    metadata: GenericType;
    variables: Variables[];
}

export interface Container {
    id: string;
    type: string;
    name: string;
    numberOfColumns: string;
    tab: any;
    fields: FormField[];
}

export interface FormField {
    id: string;
    name: string;
    type: string;
    required: boolean;
    colspan: number;
    optionType: string;
    options: FieldOptions[];
    restUrl: any;
    restResponsePath: any;
    restIdProperty: any;
    restLabelProperty: any;
    params: any;
}

export interface Outcomes {
    id: string;
    name: string;
}

export type FieldOptions = Outcomes;

export interface GenericType {
    [key: string]: string;
}

export interface Variables {
    name: string;
    type: string;
    value: string;
}

export interface TaskDetails {
    appVersion: string;
    appName: string;
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
    formKey: string;
    status: TaskStatus;
    taskDefinitionKey: string;
    candidateUsers: any[];
    candidateGroups: any[];
    standalone: boolean;
}
