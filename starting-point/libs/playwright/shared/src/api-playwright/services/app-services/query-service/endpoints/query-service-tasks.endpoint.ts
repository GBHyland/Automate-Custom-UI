/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ApiUtils } from '../../../../utils';
import { BaseService, RequestResponse } from '../../../base.service';
import { ProcessInstanceResponse, QueryServiceTasksFilters, RetryMessage } from '../../../../models';
import { CustomAPIRequest } from '../../../../context-factory/context.models';
import { logger } from '../../../../../utils/node-logger';

export class ServiceTasksEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `/${serviceUrl}/admin/v1/service-tasks`;
    }

    private async getServiceTasksByFilters(fieldFilters: Partial<QueryServiceTasksFilters>): Promise<ProcessInstanceResponse | RequestResponse> {
        fieldFilters = {
            sort: 'startedDate,DESC',
            ...fieldFilters,
        };
        const result = await this.get(`${this.endpoint}`, { params: fieldFilters });

        if (result.list.entries.length > 1) {
            logger.info(`Found ${result.list.entries.length} service tasks by filters ${JSON.stringify(fieldFilters)}`);
        }

        return result;
    }

    async waitAndGetServiceTasksByFilters(fieldFilters: QueryServiceTasksFilters): Promise<any> {
        const apiCall = async () => (await this.getServiceTasksByFilters(fieldFilters)).list.entries.shift();

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for events ${JSON.stringify(fieldFilters)}`,
            errorMessage: `No service task found by filters ${JSON.stringify(fieldFilters)} on the expected waiting time`,
        };
        let filteredTask: any;

        try {
            filteredTask = await ApiUtils.waitForApi(apiCall, this.predicate, retryMessage);
        } catch {
            await this.checkIfServiceTaskIsErrored(fieldFilters.processInstanceId);
        }

        return filteredTask;
    }

    async getErrorDetails(id: string): Promise<any> {
        return this.get(`${this.endpoint}/${id}/integration-context`);
    }

    async checkIfServiceTaskIsErrored(processInstanceId: string) {
        const serviceTasksByProcessInstance = (await this.getServiceTasksByFilters({ processInstanceId, status: 'ERROR' })).list.entries.shift();
        const error = await this.getErrorDetails(serviceTasksByProcessInstance.entry.id);
        throw new Error(`${serviceTasksByProcessInstance.entry.activityName} - ${error.entry.errorCode} - ${error.entry.errorMessage}`);
    }

    private predicate = (result: any) => !!result;
}
