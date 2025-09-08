/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseService, RequestResponse } from '../../../base.service';
import { CustomAPIRequest, StandaloneTaskData, StandaloneListData, StandaloneTaskOptions, Options } from '../../../../';

export class TasksEndpoint extends BaseService {
    private endpoint: string;

    constructor(context: CustomAPIRequest, serviceUrl: string) {
        super(context);
        this.endpoint = `/${serviceUrl}/v1/tasks`;
    }

    async createStandaloneTask(taskName: string, options?: Partial<StandaloneTaskOptions>): Promise<StandaloneTaskData | RequestResponse> {
        const postBody = {
            name: taskName,
            payloadType: 'CreateTaskPayload',
            ...options,
        };
        return this.post(`${this.endpoint}`, { data: postBody });
    }

    async createStandaloneTasks(tasksNames: string[], options?: Partial<StandaloneTaskOptions>): Promise<StandaloneListData | RequestResponse> {
        const childTasks = {
            list: {
                entries: [],
            },
        };

        for (const name of tasksNames) {
            childTasks.list.entries.push(await this.createStandaloneTask(name, options));
        }
        return childTasks;
    }

    async completeTask(taskId: string): Promise<RequestResponse> {
        const requestOptions: Options = {
            data: {
                payloadType: 'CompleteTaskPayload',
            },
        };

        return this.post(`${this.endpoint}/${taskId}/complete`, requestOptions);
    }

    async assignTaskToUser(processInstanceId: string, taskId: string, username: string): Promise<RequestResponse> {
        const postBody = {
            id: processInstanceId,
            taskId,
            assignee: username,
            payloadType: 'AssignTaskPayload',
        };

        return this.post(`${this.endpoint}/${taskId}/assign`, { data: postBody });
    }

    async claimTask(taskId: string, username: string): Promise<void> {
        await this.post(`${this.endpoint}/${taskId}/claim?assignee=${username}`);
    }

    async updateTaskPriority(taskId: string, priority: number): Promise<RequestResponse> {
        const data = { payloadType: 'UpdateTaskPayload', priority };

        return this.put(`${this.endpoint}/${taskId}`, { data });
    }

    async deleteTask(taskId: string): Promise<void> {
        await this.delete(`${this.endpoint}/${taskId}`);
    }

    async deleteTasks(taskEntires: RequestResponse[]): Promise<void> {
        const projectIds = [];
        projectIds.push(...taskEntires.map((i) => i.entry.id));

        await Promise.all(projectIds.map((id) => this.deleteTask(id)));
    }
}
