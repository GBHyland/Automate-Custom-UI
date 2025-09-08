/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

type ProcessInstanceStatuses = 'RUNNING' | 'COMPLETED' | 'SUSPENDED' | 'CANCELLED';

export interface QueryProcessInstanceFilters {
    id?: string;
    name?: string;
    processDefinitionKey?: string;
    status?: ProcessInstanceStatuses;
    sort?: string;
    appVersion?: string;
    initiator?: string;
    processDefinitionName?: string;
    startDate?: string;
    startFrom?: string;
    completedDate?: string;
    completedFrom?: string;
    suspendedDate?: string;
    suspendedFrom?: string;
    suspendedTo?: string;
}
