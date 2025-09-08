/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseMock } from '.';
import { formatISO } from 'date-fns';

type PreferenceMockType = 'processes-cloud-columns-visibility' | 'tasks-list-cloud-columns-visibility';

interface ColumnsPayloadType {
    key: string;
    value: { [key: string]: boolean };
}
interface PreferenceResponseEntry {
    entry: ColumnsPayloadType;
}
/* eslint-disable */
export class PreferenceMock extends BaseMock {

    public preferenceEndpoint = '**/preference/v1/preferences';
    public columnsWidthsEndpoint = /preference\/v1\/preferences\/.+-columns-widths/;
    public columnsOrderEndpoint = /preference\/v1\/preferences\/.+-columns-order/;

    constructor(page: Page) {
        super(page);
    }

    async mockColumnsVisibilityResponse(howManyTimes: number = 2): Promise<void> {
        await this.page.route(this.preferenceEndpoint, async (route) => {
            const body = this.getColumnsVisibilityResponseMock();
            await route.fulfill({ json: body });
        }, { times: howManyTimes });
    }

    async mockProcessColumnPreferences(howManyTimes: number = 1): Promise<void> {
        await this.page.route(this.preferenceEndpoint, async (route) => {
            const body = this.getProcessListPreferencesResponse();
            await route.fulfill({ json: body });
        }, { times: howManyTimes });
    }

    async mockCloudColumnsVisibility(columnNames: string[], key: PreferenceMockType): Promise<void> {
        this.page.on('request', (request) => {
        });
        await this.page.route('**/preference/v1/preferences', async (route) => {
            const response = await route.fetch();
            const json = await response.json();
            const columnsPayload: ColumnsPayloadType = { key, value: {} };
            const { entries, pagination } = json.list;

            for (let column of columnNames) {
                if (/\./.test(column)) {
                    column = column.replace('.', '');
                }

                columnsPayload.value[`${column}`] = true;
            }

            if (entries.some(({ entry }: PreferenceResponseEntry) => entry.key === key)) {
                entries.find(({ entry }: PreferenceResponseEntry) => entry.key === key).entry.value = JSON.stringify(columnsPayload.value);
            } else {
                entries.push({ entry: { key: columnsPayload.key, value: JSON.stringify(columnsPayload.value) } });
                pagination.totalItems++;
                pagination.count++;
            }

            console.log('🟢 mockCloudColumnsVisibility', JSON.stringify(json));

            await route.fulfill({
                body: JSON.stringify({
                    list: {
                        entries: entries,
                        pagination: pagination
                    }
                })
            });
        });
    }

    private getColumnsVisibilityResponseMock() {
        return {
            "list": {
                "entries": [
                    /* cspell: disable*/
                    {
                        "entry": {
                            "key": "tasks-list-cloud-columns-visibility",
                            "value": "{\"id\":true,\"name\":true,\"assignee\":true,\"status\":true,\"createdDate\":true,\"lastModified\":true,\"parentTaskId\":true,\"variable_column_Column A\":false,\"\":true,\"description\":false,\"variable_column_Column B\":true,\"variable_column_Column C\":false,\"variable_column_Column D\":false,\"variable_column_Column E\":false}"
                        }
                    },
                    {
                        "entry": {
                            "key": `process-filters-simpleapp-${process.env['PROCESS_ADMIN_EMAIL']}`,
                            "value": `[{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"94c6hdo\",\"name\":\"ADF_CLOUD_PROCESS_FILTERS.RUNNING_PROCESSES\",\"key\":\"running-processes\",\"icon\":\"inbox\",\"index\":null,\"appName\":\"simpleapp\",\"appVersion\":null,\"processInstanceId\":null,\"processName\":null,\"initiator\":null,\"status\":\"RUNNING\",\"sort\":\"startDate\",\"order\":\"DESC\",\"processDefinitionId\":null,\"processDefinitionName\":null,\"processDefinitionKey\":null,\"lastModified\":null,\"lastModifiedTo\":null,\"lastModifiedFrom\":null,\"startedDate\":null,\"_startFrom\":null,\"_startTo\":null,\"completedDateType\":null,\"startedDateType\":null,\"suspendedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"_suspendedFrom\":null,\"_suspendedTo\":null},{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"wrscrti\",\"name\":\"ADF_CLOUD_PROCESS_FILTERS.COMPLETED_PROCESSES\",\"key\":\"completed-processes\",\"icon\":\"done\",\"index\":null,\"appName\":\"simpleapp\",\"appVersion\":null,\"processInstanceId\":null,\"processName\":null,\"initiator\":null,\"status\":\"COMPLETED\",\"sort\":\"startDate\",\"order\":\"DESC\",\"processDefinitionId\":null,\"processDefinitionName\":null,\"processDefinitionKey\":null,\"lastModified\":null,\"lastModifiedTo\":null,\"lastModifiedFrom\":null,\"startedDate\":null,\"_startFrom\":null,\"_startTo\":null,\"completedDateType\":null,\"startedDateType\":null,\"suspendedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"_suspendedFrom\":null,\"_suspendedTo\":null},{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"v1rurty\",\"name\":\"ADF_CLOUD_PROCESS_FILTERS.ALL_PROCESSES\",\"key\":\"all-processes\",\"icon\":\"adjust\",\"index\":null,\"appName\":\"simpleapp\",\"appVersion\":null,\"processInstanceId\":null,\"processName\":null,\"initiator\":null,\"status\":null,\"sort\":\"startDate\",\"order\":\"DESC\",\"processDefinitionId\":null,\"processDefinitionName\":null,\"processDefinitionKey\":null,\"lastModified\":null,\"lastModifiedTo\":null,\"lastModifiedFrom\":null,\"startedDate\":null,\"_startFrom\":null,\"_startTo\":null,\"completedDateType\":null,\"startedDateType\":null,\"suspendedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"_suspendedFrom\":null,\"_suspendedTo\":null}]`
                        }
                    },
                    {
                        "entry": {
                            "key": "processes-cloud-columns-visibility",
                            "value": "{\"id\":true,\"name\":true,\"status\":true,\"initiator\":true,\"startDate\":true,\"appVersion\":true,\"\":true,\"variable_column_Column A\":false,\"variable_column_Column B\":true,\"variable_column_Column C\":false,\"variable_column_Column D\":false,\"variable_column_Column E\":false}"
                        }
                    },
                    {
                        "entry": {
                            "key": `task-filters-simpleapp-${process.env['PROCESS_ADMIN_EMAIL']}`,
                            "value": `[{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"1a5b52biw\",\"name\":\"ADF_CLOUD_TASK_FILTERS.MY_TASKS\",\"key\":\"my-tasks\",\"icon\":\"inbox\",\"index\":null,\"appName\":\"simpleapp\",\"status\":\"ASSIGNED\",\"sort\":\"createdDate\",\"assignee\":\"processadminuser\",\"assignedUsers\":null,\"order\":\"DESC\",\"owner\":null,\"processDefinitionName\":null,\"processDefinitionId\":null,\"processInstanceId\":null,\"createdDate\":null,\"dueDateType\":null,\"dueDate\":null,\"_dueDateFrom\":null,\"_dueDateTo\":null,\"taskName\":null,\"taskId\":null,\"parentTaskId\":null,\"priority\":null,\"standalone\":null,\"lastModifiedFrom\":null,\"lastModifiedTo\":null,\"completedBy\":null,\"completedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"createdDateType\":null,\"_createdFrom\":null,\"_createdTo\":null,\"candidateGroups\":null,\"showCounter\":true},{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"vdczu15mn\",\"name\":\"ADF_CLOUD_TASK_FILTERS.QUEUED_TASKS\",\"key\":\"queued-tasks\",\"icon\":\"queue\",\"index\":null,\"appName\":\"simpleapp\",\"status\":\"CREATED\",\"sort\":\"createdDate\",\"assignee\":null,\"assignedUsers\":null,\"order\":\"DESC\",\"owner\":null,\"processDefinitionName\":null,\"processDefinitionId\":null,\"processInstanceId\":null,\"createdDate\":null,\"dueDateType\":null,\"dueDate\":null,\"_dueDateFrom\":null,\"_dueDateTo\":null,\"taskName\":null,\"taskId\":null,\"parentTaskId\":null,\"priority\":null,\"standalone\":null,\"lastModifiedFrom\":null,\"lastModifiedTo\":null,\"completedBy\":null,\"completedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"createdDateType\":null,\"_createdFrom\":null,\"_createdTo\":null,\"candidateGroups\":null,\"showCounter\":true},{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"lhi4ba1tq\",\"name\":\"ADF_CLOUD_TASK_FILTERS.COMPLETED_TASKS\",\"key\":\"completed-tasks\",\"icon\":\"done\",\"index\":null,\"appName\":\"simpleapp\",\"status\":\"COMPLETED\",\"sort\":\"createdDate\",\"assignee\":null,\"assignedUsers\":null,\"order\":\"DESC\",\"owner\":null,\"processDefinitionName\":null,\"processDefinitionId\":null,\"processInstanceId\":null,\"createdDate\":null,\"dueDateType\":null,\"dueDate\":null,\"_dueDateFrom\":null,\"_dueDateTo\":null,\"taskName\":null,\"taskId\":null,\"parentTaskId\":null,\"priority\":null,\"standalone\":null,\"lastModifiedFrom\":null,\"lastModifiedTo\":null,\"completedBy\":null,\"completedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"createdDateType\":null,\"_createdFrom\":null,\"_createdTo\":null,\"candidateGroups\":null,\"showCounter\":false},{\"dateRangeFilterService\":{\"currentDate\":\"${formatISO(new Date())}\"},\"id\":\"ddowisk1u\",\"name\":\"TASK-LIST.FILTER.TITLE\",\"key\":\"admin-all-tasks\",\"icon\":\"inbox\",\"index\":null,\"appName\":\"simpleapp\",\"status\":null,\"sort\":\"createdDate\",\"assignee\":null,\"assignedUsers\":null,\"order\":\"DESC\",\"owner\":null,\"processDefinitionName\":null,\"processDefinitionId\":null,\"processInstanceId\":null,\"createdDate\":null,\"dueDateType\":null,\"dueDate\":null,\"_dueDateFrom\":null,\"_dueDateTo\":null,\"taskName\":null,\"taskId\":null,\"parentTaskId\":null,\"priority\":null,\"standalone\":null,\"lastModifiedFrom\":null,\"lastModifiedTo\":null,\"completedBy\":null,\"completedDateType\":null,\"_completedFrom\":null,\"_completedTo\":null,\"completedDate\":null,\"createdDateType\":null,\"_createdFrom\":null,\"_createdTo\":null,\"candidateGroups\":null,\"showCounter\":false}]`
                        }
                    }
                ],
                "pagination": {
                    "skipCount": 0,
                    "maxItems": 100,
                    "count": 4,
                    "hasMoreItems": false,
                    "totalItems": 4
                }
            }
        }
    }

    private getProcessListPreferencesResponse() {
        return {
            "list": {
                "entries": [
                    {
                        "entry": {
                            "key": "processes-cloud-list-columns-order",
                            "value": "[\"app.process.name\",\"app.process.processDefinitionName\",\"app.process.relatedProcess\",\"app.process.status\",\"app.process.startDate\",\"app.process.completedDate\",\"app.process.initiator\",\"app.process.appVersion\",\"string_var/417f39e2-0712-43b0-8e84-73e6fdd58d36\",\"integer_var/568d5933-8ed0-46de-92f6-53fa27b33246\",\"bigdecimal_var/b1e4dfee-60d8-450c-9699-07d3511a2d27\",\"date_var/3c586027-43f8-4a50-a2c6-339e0539f2c5\",\"datetime_var/42510e94-867f-4e81-9b6f-bdc2f04ed85e\",\"boolean_var/f00a5848-4b0d-42c8-9efb-e714962d5e9f\"]"
                        }
                    },
                    {
                        "entry": {
                            "key": "processes-cloud-columns-widths",
                            "value": "{\"app.process.name\":428,\"app.process.processDefinitionName\":137,\"app.process.relatedProcess\":100,\"app.process.startDate\":126,\"app.process.status\":126,\"app.process.completedDate\":184,\"app.process.initiator\":219,\"app.process.appVersion\":183,\"string_var/417f39e2-0712-43b0-8e84-73e6fdd58d36\":67,\"integer_var/568d5933-8ed0-46de-92f6-53fa27b33246\":67,\"bigdecimal_var/b1e4dfee-60d8-450c-9699-07d3511a2d27\":67,\"date_var/3c586027-43f8-4a50-a2c6-339e0539f2c5\":67,\"datetime_var/42510e94-867f-4e81-9b6f-bdc2f04ed85e\":67,\"boolean_var/f00a5848-4b0d-42c8-9efb-e714962d5e9f\":65}"
                        }
                    },
                    {
                        "entry": {
                            "key": "recent-process-definition-ids",
                            "value": "[\"Process_EwGkR8Rp\",\"Process_XBs53jwy\",\"Process_iJDbDH6z\"]"
                        }
                    },
                    {
                        "entry": {
                            "key": "processes-cloud-columns-visibility",
                            "value": "{\"string_var/417f39e2-0712-43b0-8e84-73e6fdd58d36\":false,\"integer_var/568d5933-8ed0-46de-92f6-53fa27b33246\":false,\"bigdecimal_var/b1e4dfee-60d8-450c-9699-07d3511a2d27\":false,\"date_var/3c586027-43f8-4a50-a2c6-339e0539f2c5\":false,\"datetime_var/42510e94-867f-4e81-9b6f-bdc2f04ed85e\":false,\"boolean_var/f00a5848-4b0d-42c8-9efb-e714962d5e9f\":false}"
                        }
                    }
                ],
                "pagination": {
                    "skipCount": 0,
                    "maxItems": 100,
                    "count": 4,
                    "hasMoreItems": false,
                    "totalItems": 4
                }
            }
        }
    }
}

