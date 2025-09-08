/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface QueryUserTasksFilters {
    name: string;
    parentTaskId: string;
    standalone: boolean;
    processInstanceId: string;
    processDefinitionName: string;
    completedBy: string;
    completedFrom: string;
    createdFrom: string;
    createdTo: string;
    priority: number;
    status: string;
    sort?: string;
    appVersion: string;
}
