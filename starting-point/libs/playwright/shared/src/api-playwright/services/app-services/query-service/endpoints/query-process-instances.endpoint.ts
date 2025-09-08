/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ProcessInstanceResponse,
    ProcessInstanceData,
    ProcessVariableEntry,
    QueryProcessInstanceFilters,
    RetryMessage,
    ApiUtils,
    CustomAPIRequest,
} from '../../../../';
import { BaseService, RequestResponse } from '../../../base.service';

export interface ProcessInstanceEndpointParameters {
    context: CustomAPIRequest;
    serviceUrl: string;
    admin?: boolean;
}

export interface ProcessInstanceFilteringParameters {
    filters: QueryProcessInstanceFilters;
    retryCallOptions?: { delay: number; retry: number };
}

export class ProcessInstanceEndpoint extends BaseService {
    private endpoint: string;

    constructor(parameters: ProcessInstanceEndpointParameters) {
        super(parameters.context);

        this.endpoint = `/${parameters.serviceUrl}/`;
        this.endpoint += `${parameters.admin ? 'admin/' : ''}`;
        this.endpoint += `v1/process-instances`;
    }

    async getProcessInstanceByFilters(fieldFilters: Partial<QueryProcessInstanceFilters>): Promise<ProcessInstanceResponse | RequestResponse> {
        fieldFilters = {
            sort: 'startDate,DESC',
            ...fieldFilters,
        };
        return this.get(`${this.endpoint}`, { params: fieldFilters });
    }

    async getProcessInstance(processInstanceId: string): Promise<ProcessInstanceData | RequestResponse> {
        return this.get(`${this.endpoint}/${processInstanceId}`);
    }

    async getProcessInstanceVariables(processInstanceId: string): Promise<ProcessVariableEntry[]> {
        return (await this.get(`${this.endpoint}/${processInstanceId}/variables`)).list.entries;
    }

    async waitAndGetProcessInstanceByFilters(
        { filters, retryCallOptions }: ProcessInstanceFilteringParameters,
        returnAllInstances = false
    ): Promise<ProcessInstanceData> {
        const apiCall = async () => {
            const response = await this.getProcessInstanceByFilters(filters);

            return returnAllInstances ? response.list.entries : response.list.entries.shift();
        };

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for process instances ${JSON.stringify(filters)}`,
            errorMessage: `No process instance found by filters ${JSON.stringify(filters)} on the expected waiting time`,
        };
        return ApiUtils.waitForApi(apiCall, this.predicate, retryMessage, retryCallOptions?.retry, retryCallOptions?.delay);
    }

    async waitAndGetSubprocesses(processInstanceId: string, retryCallOptions?: { delay: number; retry: number }): Promise<ProcessInstanceData[]> {
        const apiCall = async () => (await this.getSubprocesses(processInstanceId)).list.entries;

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for subprocesses of process instance ${processInstanceId}`,
            errorMessage: `No subprocesses found for process instance ${processInstanceId} on the expected waiting time`,
        };
        return ApiUtils.waitForApi(apiCall, this.predicate, retryMessage, retryCallOptions?.retry, retryCallOptions?.delay);
    }

    async getSubprocesses(processInstanceId: string): Promise<ProcessInstanceResponse | RequestResponse> {
        return this.get(`${this.endpoint}/${processInstanceId}/subprocesses`);
    }

    private predicate = (result: ProcessInstanceData[] | ProcessInstanceData): boolean =>
        Array.isArray(result) ? result.length > 0 : !!result.entry;
}
