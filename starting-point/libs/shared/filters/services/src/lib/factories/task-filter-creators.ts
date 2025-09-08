/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateCloudFilterType, IdentityUserModel, TaskPriorityOption, TaskStatusFilter } from '@alfresco/adf-process-services-cloud';
import { DateFilterValue, Option } from '../filter/filter.model';
import { CheckboxFilter } from '../filter/filter-models/checkbox-filter.model';
import { DateFilter, DATE_OPTIONS } from '../filter/filter-models/date-filter.model';
import { StringFilter } from '../filter/filter-models/string-filter.model';
import { UserFilter } from '../filter/filter-models/user-filter.model';

export const TASK_STATUS_OPTIONS: Option[] = [
    { value: TaskStatusFilter.CREATED, label: 'FILTERS.TASK_STATUS_FILTER.CREATED' },
    { value: TaskStatusFilter.ASSIGNED, label: 'FILTERS.TASK_STATUS_FILTER.ASSIGNED' },
    { value: TaskStatusFilter.SUSPENDED, label: 'FILTERS.TASK_STATUS_FILTER.SUSPENDED' },
    { value: TaskStatusFilter.CANCELLED, label: 'FILTERS.TASK_STATUS_FILTER.CANCELLED' },
    { value: TaskStatusFilter.COMPLETED, label: 'FILTERS.TASK_STATUS_FILTER.COMPLETED' },
];

export const TaskFilterKey = {
    APP_NAME: 'appName',
    TASK_NAMES: 'taskNames',
    TASK_IDS: 'taskIds',
    PROCESS_DEFINITION_NAMES: 'processDefinitionNames',
    PROCESS_NAMES: 'processNames',
    PROCESS_INSTANCE_IDS: 'processInstanceIds',
    PARENT_IDS: 'parentTaskIds',
    PRIORITIES: 'priorities',
    STATUSES: 'statuses',
    COMPLETED_BY_USERS: 'completedByUsers',
    ASSIGNEES: 'assignees',

    COMPLETED_DATE: 'completedDateType',
    COMPLETED_DATE_FROM: 'completedFrom',
    COMPLETED_DATE_TO: 'completedTo',

    CREATED_DATE: 'createdDateType',
    CREATED_DATE_FROM: 'createdFrom',
    CREATED_DATE_TO: 'createdTo',

    DUE_DATE: 'dueDateType',
    DUE_DATE_FROM: 'dueDateFrom',
    DUE_DATE_TO: 'dueDateTo',
} as const;
export type TaskFilterKey = typeof TaskFilterKey[keyof typeof TaskFilterKey];

export function createTaskProcessDefinitionNameFilter(defaultProcessDefinitionNames: string[], processDefinitionNames: string[]): CheckboxFilter {
    return new CheckboxFilter({
        name: TaskFilterKey.PROCESS_DEFINITION_NAMES,
        translationKey: 'FILTERS.LABELS.TASK.PROCESS_DEFINITION_NAME',
        value: defaultProcessDefinitionNames.map((name) => ({ value: name, label: name, checked: true })),
        options: processDefinitionNames.map((name) => ({ label: name, value: name })),
        visible: defaultProcessDefinitionNames.length > 0,
    });
}

export function createTaskProcessInstanceIdFilter(processInstanceIds: string[]): StringFilter {
    return new StringFilter({
        name: TaskFilterKey.PROCESS_INSTANCE_IDS,
        translationKey: 'FILTERS.LABELS.TASK.PROCESS_INSTANCE_ID',
        value: processInstanceIds,
        visible: processInstanceIds.length > 0,
    });
}

export function createTaskParentIdFilter(parentIds: string[]): StringFilter {
    return new StringFilter({
        name: TaskFilterKey.PARENT_IDS,
        translationKey: 'FILTERS.LABELS.TASK.PARENT_ID',
        value: parentIds,
        visible: parentIds.length > 0,
    });
}

export function createAssigneeFilter(defaultAssignees: IdentityUserModel[], appName: string): UserFilter {
    return new UserFilter({
        name: TaskFilterKey.ASSIGNEES,
        translationKey: 'FILTERS.LABELS.TASK.ASSIGNEE',
        value: defaultAssignees,
        appName: appName,
        visible: defaultAssignees.length > 0,
    });
}

export function createPriorityFilter(
    defaultPriorities: string[],
    priorities: TaskPriorityOption[],
    getPriorityLabel: (priority: number) => string
): CheckboxFilter {
    return new CheckboxFilter({
        name: TaskFilterKey.PRIORITIES,
        translationKey: 'FILTERS.LABELS.TASK.PRIORITY',
        value: defaultPriorities.map((priority) => ({
            value: priority,
            label: getPriorityLabel(Number.parseInt(priority || '', 10)),
            checked: true,
        })),
        options: priorities,
        visible: defaultPriorities.length > 0,
    });
}

export function createDueDateFilter(defaultDueDateType: DateCloudFilterType, defaultDueDateFrom: string, defaultDueDateTo: string): DateFilter {
    return new DateFilter({
        name: TaskFilterKey.DUE_DATE,
        translationKey: 'FILTERS.LABELS.TASK.DUE_DATE',
        value: getDateValue(defaultDueDateType, defaultDueDateFrom, defaultDueDateTo),
        options: DATE_OPTIONS,
        visible: !!defaultDueDateType,
    });
}

export function createTaskCompletedDateFilter(
    defaultCompletedDateType: DateCloudFilterType,
    defaultCompletedFrom: string,
    defaultCompletedTo: string
): DateFilter {
    return new DateFilter({
        name: TaskFilterKey.COMPLETED_DATE,
        translationKey: 'FILTERS.LABELS.TASK.COMPLETED_DATE',
        value: getDateValue(defaultCompletedDateType, defaultCompletedFrom, defaultCompletedTo),
        options: DATE_OPTIONS,
        visible: !!defaultCompletedDateType,
    });
}

export function createCreatedDateFilter(
    defaultCreatedDateType: DateCloudFilterType,
    defaultCreatedFrom: string,
    defaultCreatedTo: string
): DateFilter {
    return new DateFilter({
        name: TaskFilterKey.CREATED_DATE,
        translationKey: 'FILTERS.LABELS.TASK.CREATED_DATE',
        value: getDateValue(defaultCreatedDateType, defaultCreatedFrom, defaultCreatedTo),
        options: DATE_OPTIONS,
        visible: !!defaultCreatedDateType,
    });
}

export function createCompletedByFilter(defaultCompletedByUsers: IdentityUserModel[], appName: string): UserFilter {
    return new UserFilter({
        name: TaskFilterKey.COMPLETED_BY_USERS,
        translationKey: 'FILTERS.LABELS.TASK.COMPLETED_BY',
        value: defaultCompletedByUsers,
        appName: appName,
        visible: defaultCompletedByUsers.length > 0,
    });
}

export function createTaskNameFilter(defaultNames: string[]): StringFilter {
    return new StringFilter({
        name: TaskFilterKey.TASK_NAMES,
        translationKey: 'FILTERS.LABELS.TASK.TASK_NAME',
        value: defaultNames,
        visible: defaultNames.length > 0,
    });
}

export function createTaskIdFilter(defaultIds: string[]): StringFilter {
    return new StringFilter({
        name: TaskFilterKey.TASK_IDS,
        translationKey: 'FILTERS.LABELS.TASK.ID',
        value: defaultIds,
        visible: defaultIds.length > 0,
    });
}

export function createTaskStatusFilter(defaultStatuses: string[]): CheckboxFilter {
    return new CheckboxFilter({
        name: TaskFilterKey.STATUSES,
        translationKey: 'FILTERS.LABELS.TASK.STATUS',
        value: defaultStatuses.map((status) => ({ value: status, label: findStatusTranslationKey(status), checked: true })),
        options: TASK_STATUS_OPTIONS,
        visible: defaultStatuses.length > 0,
    });
}

function findStatusTranslationKey(statusValue: string) {
    return TASK_STATUS_OPTIONS.find((option) => option.value === statusValue)?.label || 'UNKNOWN_STATUS_OPTION';
}

function findDateTranslationKey(dateValue: DateCloudFilterType) {
    return DATE_OPTIONS.find((option) => option.value === dateValue)?.label || 'UNKNOWN_DATE_OPTION';
}

function getDateValue(dateType: DateCloudFilterType, dateFrom: string, dateTo: string): DateFilterValue | null {
    if (!dateType) {
        return null;
    }

    if (dateType === DateCloudFilterType.RANGE) {
        return {
            selectedOption: { label: findDateTranslationKey(dateType), value: dateType },
            range:
                dateFrom || dateTo
                    ? {
                          from: dateFrom ? new Date(dateFrom) : null,
                          to: dateTo ? new Date(dateTo) : null,
                      }
                    : null,
        };
    }

    return {
        selectedOption: { label: findDateTranslationKey(dateType), value: dateType },
        range: null,
    };
}
