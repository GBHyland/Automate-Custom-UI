/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export type EventTypes =
    | 'VARIABLE_CREATED'
    | 'VARIABLE_UPDATED'
    | 'TASK_CREATED'
    | 'TASK_ASSIGNED'
    | 'ACTIVITY_CANCELLED'
    | 'ACTIVITY_STARTED'
    | 'ACTIVITY_COMPLETED'
    | 'MESSAGE_WAITING'
    | 'PROCESS_COMPLETED'
    | 'USER_ACTION_NAMED_EVENT'
    | 'TRIGGER_MATCHED'
    | 'PROCESS_CREATED'
    | 'APPLICATION_ROLLBACK'
    | 'INTEGRATION_RESULT_RECEIVED'
    | 'INTEGRATION_REQUESTED'
    | 'INTEGRATION_ERROR_RECEIVED';

export interface AuditFieldFilters {
    entityId?: string;
    processInstanceId?: string;
    eventType?: EventTypes;
}

export interface AuditRecords {
    list: AuditEntries;
}

export interface AuditEntries {
    entries: AuditEntry[];
}

export interface Entry {
    entry: {
        processInstanceId: string;
        eventType: string;
        entity: Entity;
    };
}

export interface Entity {
    [key: string]: any;
    value: any;
    name: string;
    type: string;
    activityName: string;
    activityType: string;
    id?: string;
    formKey?: string;
    standalone?: boolean;
    processInstanceId?: string;
    taskId?: string;
    taskVariable?: boolean;
    parentId?: string;
    action?: Action;
}

export interface Action {
    payload: {
        variables: {
            content: {
                sys_id: any;
            };
        };
    };
}

export interface AuditEntry {
    entry: AuditEntryData;
}

export interface AuditEntryData {
    id: string;
    timestamp: number;
    processInstanceId: string;
    processDefinitionId: string;
    processDefinitionKey: string;
    entity: Partial<Entity>;
    appName: string;
    serviceFullName: string;
    serviceName: string;
    serviceVersion: string;
    serviceType: string;
    entityId: string;
    sequenceNumber: number;
    messageId: string;
    eventType: EventTypes;
    previousValue: string;
}
