/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../../base.service';
import {
    ApiUtils,
    ProcessInstanceResponse,
    ProcessVariableResponse,
    QueryUserTasksFilters,
    RetryMessage,
    TaskData,
    CustomAPIRequest,
} from '../../../../';
import { logger } from '../../../../../utils/node-logger';

export class UserTasksEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string, admin: boolean) {
        super(context);
        this.endpoint = `/${serviceUrl}/${admin ? 'admin/' : ''}v1/tasks`;
    }

    async getTasks(): Promise<ProcessInstanceResponse> {
        const result = await this.get(this.endpoint);
        return result.list;
    }

    async getTaskVariables(taskId: string): Promise<ProcessVariableResponse | RequestResponse> {
        return this.get(`${this.endpoint}/${taskId}/variables`);
    }

    async getUserTasksByFilters(fieldFilters: Partial<QueryUserTasksFilters>): Promise<ProcessInstanceResponse | RequestResponse> {
        if (this.endpoint.includes('admin')) {
            fieldFilters = { standalone: false, sort: 'createdDate,DESC', ...fieldFilters };
        }

        const result = await this.get(`${this.endpoint}`, { params: fieldFilters });
        if (result.list.entries.length > 1) {
            logger.info(`Found ${result.list.entries.length} user tasks by filters ${JSON.stringify(fieldFilters)}`);
        }
        return result;
    }

    async waitAndGetTasksByFilters(fieldFilters: Partial<QueryUserTasksFilters>, returnAllTasks = false): Promise<TaskData> {
        const apiCall = async () => {
            const response = await this.getUserTasksByFilters(fieldFilters);
            return returnAllTasks ? response.list.entries : response.list.entries.shift();
        };

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for events ${JSON.stringify(fieldFilters)}`,
            errorMessage: `No user task found by filters ${JSON.stringify(fieldFilters)} on the expected waiting time`,
        };

        return ApiUtils.waitForApi(apiCall, this.predicate, retryMessage);
    }

    private predicate = (input: string | any[]): boolean => (Array.isArray(input as any[]) ? (input as any[]).length > 0 : !!input);
}
