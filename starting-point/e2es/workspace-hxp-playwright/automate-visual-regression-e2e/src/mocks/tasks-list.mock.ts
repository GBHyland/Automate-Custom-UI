/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseMock } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';

export class TasksListMock extends BaseMock {
    tasksListEndpoint = /query\/v1\/tasks\/search/;

    constructor(page: Page) {
        super(page);
    }

    async mockTasksListResponse(): Promise<void> {
        await this.page.route(this.tasksListEndpoint, async (route) => {
            const body = this.getTasksListResponse();
            await route.fulfill({ json: body });
        });
    }

    getTasksListResponse() {
        return {
            list: {
                entries: [
                    {
                        entry: {
                            serviceName: 'rb',
                            serviceFullName: 'rb',
                            serviceVersion: '',
                            appName: 'sys-workspace-cab2409f',
                            appVersion: '1',
                            id: 'mocked-task-id-1',
                            assignee: 'hruser',
                            name: 'mocked-process-name-1',
                            rootProcessInstanceId: 'mocked-root-process-id-1',
                            createdDate: '2025-07-30T13:32:53.166+0000',
                            priority: 0,
                            processDefinitionId: 'mocked-process-definition-id-1',
                            processInstanceId: 'mocked-process-instance-id-1',
                            processDefinitionVersion: 1,
                            processDefinitionName: 'mocked-process-definition-name-1',
                            taskDefinitionKey: 'mocked-task-definition-key-1',
                            status: 'ASSIGNED',
                            formKey: 'mocked-form-key-1',
                            lastModified: '2025-07-30T13:32:53.168+0000',
                            processVariables: [],
                            candidateUsers: [],
                            candidateGroups: [],
                            inFinalState: false,
                            standalone: false,
                        },
                    },
                    {
                        entry: {
                            serviceName: 'rb',
                            serviceFullName: 'rb',
                            serviceVersion: '',
                            appName: 'sys-workspace-cab2409f',
                            appVersion: '2',
                            id: 'mocked-task-id-2',
                            assignee: 'salesuser',
                            name: 'mocked-process-name-2',
                            rootProcessInstanceId: 'mocked-root-process-id-2',
                            createdDate: '2025-07-30T13:32:53.166+0000',
                            priority: 0,
                            processDefinitionId: 'mocked-process-definition-id-2',
                            processInstanceId: 'mocked-process-instance-id-2',
                            processDefinitionVersion: 1,
                            processDefinitionName: 'mocked-process-definition-name-2',
                            taskDefinitionKey: 'mocked-task-definition-key-2',
                            status: 'ASSIGNED',
                            formKey: 'mocked-form-key-2',
                            lastModified: '2025-07-30T13:32:53.168+0000',
                            processVariables: [],
                            candidateUsers: [],
                            candidateGroups: [],
                            inFinalState: false,
                            standalone: false,
                        },
                    },
                    {
                        entry: {
                            serviceName: 'rb',
                            serviceFullName: 'rb',
                            serviceVersion: '',
                            appName: 'sys-workspace-cab2409f',
                            appVersion: '3',
                            id: 'mocked-task-id-3',
                            assignee: 'hruser',
                            name: 'mocked-process-name-3',
                            rootProcessInstanceId: 'mocked-root-process-id-3',
                            createdDate: '2025-07-30T13:32:53.166+0000',
                            priority: 0,
                            processDefinitionId: 'mocked-process-definition-id-3',
                            processInstanceId: 'mocked-process-instance-id-3',
                            processDefinitionVersion: 1,
                            processDefinitionName: 'mocked-process-definition-name-3',
                            taskDefinitionKey: 'mocked-task-definition-key-3',
                            status: 'ASSIGNED',
                            formKey: 'mocked-form-key-3',
                            lastModified: '2025-07-30T13:32:53.168+0000',
                            processVariables: [],
                            candidateUsers: [],
                            candidateGroups: [],
                            inFinalState: false,
                            standalone: false,
                        },
                    },
                ],
                pagination: {
                    skipCount: 0,
                    maxItems: 25,
                    count: 3,
                    hasMoreItems: true,
                    totalItems: 3,
                },
            },
        };
    }
}
