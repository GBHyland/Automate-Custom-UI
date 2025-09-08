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
    CustomAPIRequest,
    Options,
    ProcessInstanceData,
    ProcessVariableResponse,
    RetryMessage,
    StartMessageResponse,
    TaskListData,
} from '../../../../';
import { UtilRandom } from '../../../../../utils';
import { logger } from '../../../../../utils/node-logger';

export class ProcessInstancesEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string, adminService: boolean) {
        super(context);
        this.endpoint = `/${serviceUrl}/${adminService ? 'admin/' : ''}v1/process-instances`;
    }

    async startProcess(
        processDefinitionKey: string,
        options?: { name?: string; variables?: object }
    ): Promise<ProcessInstanceData | RequestResponse> {
        const response = await this.post(this.endpoint, {
            data: {
                processDefinitionId: undefined,
                processDefinitionKey,
                name: options?.name || `fe-e2e-${UtilRandom.generateAlphaLowerCase(10)}`,
                businessKey: undefined,
                variables: options?.variables || { ...options?.variables },
                payloadType: 'StartProcessPayload',
            },
        });

        if (!response.entry || response.entry.code < 200 || response.entry.code >= 300) {
            logger.error('Failed to start process');
            throw new Error(`Entry code: ${response.entry.code}, entry message: ${response.entry.message}`);
        }

        return response;
    }

    async startMessageEvent(startMessage: string, options?: any): Promise<StartMessageResponse | RequestResponse> {
        const postBody = {
            name: startMessage,
            variables: {},
            payloadType: 'StartMessagePayload',
            ...options,
        };

        return this.post(`${this.endpoint}/message`, {
            data: postBody,
        });
    }

    async receiveMessageEvent(messageName: string, options?: any): Promise<any> {
        const postBody = {
            name: messageName,
            variables: {},
            payloadType: 'ReceiveMessagePayload',
            ...options,
        };

        return this.put(`${this.endpoint}/message`, { data: postBody });
    }

    private async getTasksByProcessInstanceId(processInstanceId: string): Promise<TaskListData | RequestResponse> {
        return this.get(`${this.endpoint}/${processInstanceId}/tasks`);
    }

    async waitAndGetTasksByProcessInstanceId(
        processInstanceId: string,
        waitOptions?: { retry?: number; delay?: number }
    ): Promise<TaskListData | RequestResponse> {
        const apiCall = async () => (await this.getTasksByProcessInstanceId(processInstanceId)).list.entries;

        const retryMessage: RetryMessage = {
            waitingMessage: `Waiting for tasks for ${processInstanceId}`,
            errorMessage: `No user task found by filters ${processInstanceId} on the expected waiting time`,
        };

        return ApiUtils.waitForApi(apiCall, this.predicate, retryMessage, waitOptions?.retry, waitOptions?.delay);
    }

    async suspendProcessInstance(processInstanceId: string): Promise<any | RequestResponse> {
        const requestOptions: Options = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        return this.post(`${this.endpoint}/${processInstanceId}/suspend`, requestOptions);
    }

    async deleteProcessInstance(processInstanceId: string): Promise<any | RequestResponse> {
        return this.delete(`${this.endpoint}/${processInstanceId}`);
    }

    async deleteProcessesIfExist(...processInstanceIds: string[]): Promise<any | RequestResponse> {
        for (const processInstanceId of processInstanceIds) {
            if (processInstanceId) {
                await this.deleteProcessInstance(processInstanceId);
            }
        }
    }

    async cancelProcessInstance(processInstanceId: string): Promise<any | RequestResponse> {
        return this.delete(`${this.endpoint}/${processInstanceId}/destroy`);
    }

    async cancelProcessInstances(processInstanceIds: string[]): Promise<any | RequestResponse> {
        for (const processInstanceId of processInstanceIds) {
            await this.cancelProcessInstance(processInstanceId);
        }
    }

    getProcessVariableInstances(processInstanceId: string): Promise<ProcessVariableResponse | RequestResponse> {
        return this.get(`${this.endpoint}/${processInstanceId}/variables`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    async getProcessVariable(processInstanceId: string, variableName: string): Promise<any | RequestResponse> {
        const response = await this.getProcessVariableInstances(processInstanceId);
        if (!response || (response as RequestResponse).error) {
            return response;
        }
        const entries = response.list?.entries;
        if (!entries || !Array.isArray(entries)) {
            return null;
        }
        const foundEntry = entries.find((element: any) => element.entry?.name === variableName);
        return foundEntry ? foundEntry.entry.value : null;
    }

    private predicate = (result: any) => result?.length > 0;
}
