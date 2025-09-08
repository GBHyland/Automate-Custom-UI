/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseMock } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';

export class ProcessListMock extends BaseMock {
    processListEndpoint = /query\/v1\/process-instances\/search/;

    constructor(page: Page) {
        super(page);
    }

    async mockProcessListResponse(): Promise<void> {
        await this.page.route(this.processListEndpoint, async (route) => {
            const body = this.getProcessListResponse();
            await route.fulfill({ json: body });
        });
    }

    getProcessListResponse() {
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
                            id: 'mocked-process-id-1',
                            name: 'mocked-process-name-1',
                            processDefinitionId: 'Process_mocked1:1:mocked-process-def-id-1',
                            processDefinitionKey: 'Process_mocked1',
                            initiator: 'hruser',
                            startDate: '2025-08-11T08:08:42.931+0000',
                            status: 'RUNNING',
                            processDefinitionVersion: 1,
                            processDefinitionName: 'mocked-process-def-name-1',
                            lastModified: '2025-08-11T08:08:42.932+0000',
                            variables: [],
                            rootProcessInstanceId: 'mocked-process-id-1',
                            subprocesses: [],
                            inFinalState: false,
                        },
                    },
                    {
                        entry: {
                            serviceName: 'rb',
                            serviceFullName: 'rb',
                            serviceVersion: '',
                            appName: 'sys-workspace-cab2409f',
                            appVersion: '1',
                            id: 'mocked-process-id-2',
                            name: 'mocked-process-name-2',
                            processDefinitionId: 'Process_mocked2:1:mocked-process-def-id-2',
                            processDefinitionKey: 'Process_mocked2',
                            initiator: 'hruser',
                            startDate: '2025-08-11T08:08:42.931+0000',
                            status: 'RUNNING',
                            processDefinitionVersion: 1,
                            processDefinitionName: 'mocked-process-def-name-2',
                            lastModified: '2025-08-11T08:08:42.932+0000',
                            variables: [],
                            rootProcessInstanceId: 'mocked-process-id-2',
                            subprocesses: [],
                            inFinalState: false,
                        },
                    },
                    {
                        entry: {
                            serviceName: 'rb',
                            serviceFullName: 'rb',
                            serviceVersion: '',
                            appName: 'sys-workspace-cab2409f',
                            appVersion: '1',
                            id: 'mocked-process-id-3',
                            name: 'mocked-process-name-3',
                            processDefinitionId: 'Process_mocked3:1:mocked-process-def-id-3',
                            processDefinitionKey: 'Process_mocked3',
                            initiator: 'hruser',
                            startDate: '2025-08-11T08:08:42.931+0000',
                            status: 'RUNNING',
                            processDefinitionVersion: 1,
                            processDefinitionName: 'mocked-process-def-name-3',
                            lastModified: '2025-08-11T08:08:42.932+0000',
                            variables: [],
                            rootProcessInstanceId: 'mocked-process-id-3',
                            subprocesses: [],
                            inFinalState: false,
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
