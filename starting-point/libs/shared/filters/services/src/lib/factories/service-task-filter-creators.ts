/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateFilterValue, Option } from '../filter/filter.model';
import { StringFilter } from '../filter/filter-models/string-filter.model';
import { RadioFilter } from '../filter/filter-models/radio-filter.model';
import { DATE_OPTIONS, DateFilter } from '../filter/filter-models/date-filter.model';
import { DateCloudFilterType } from '@alfresco/adf-process-services-cloud';

export const SERVICE_TASK_STATUS_OPTIONS: Option[] = [
    { value: 'STARTED', label: 'ADF_CLOUD_SERVICE_TASK_FILTERS.STATUS.STARTED' },
    { value: 'COMPLETED', label: 'ADF_CLOUD_SERVICE_TASK_FILTERS.STATUS.COMPLETED' },
    { value: 'CANCELLED', label: 'ADF_CLOUD_SERVICE_TASK_FILTERS.STATUS.CANCELLED' },
    { value: 'ERROR', label: 'ADF_CLOUD_SERVICE_TASK_FILTERS.STATUS.ERROR' },
];

export const ServiceTaskFilterKey = {
    APP_NAME: 'appName',
    PROCESS_INSTANCE_ID: 'processInstanceId',
    SERVICE_TASK_ID: 'serviceTaskId',
    SERVICE_TASK_ACTIVITY_NAME: 'activityName',
    STATUS: 'status',

    COMPLETED_DATE: 'completedDateType',
    COMPLETED_DATE_FROM: 'completedFrom',
    COMPLETED_DATE_TO: 'completedTo',

    STARTED_DATE: 'startedDateType',
    STARTED_DATE_FROM: 'startedFrom',
    STARTED_DATE_TO: 'startedTo',
} as const;
export type ServiceTaskFilterKey = typeof ServiceTaskFilterKey[keyof typeof ServiceTaskFilterKey];

export function createServiceTaskProcessInstanceIdFilter(processInstanceId: string | null): StringFilter {
    return new StringFilter({
        name: ServiceTaskFilterKey.PROCESS_INSTANCE_ID,
        translationKey: 'FILTERS.LABELS.SERVICE_TASK.PROCESS_INSTANCE_ID',
        value: processInstanceId ? [processInstanceId] : null,
        visible: !!processInstanceId,
    });
}

export function createServiceTaskIdFilter(serviceTaskId: string | null): StringFilter {
    return new StringFilter({
        name: ServiceTaskFilterKey.SERVICE_TASK_ID,
        translationKey: 'FILTERS.LABELS.SERVICE_TASK.ID',
        value: serviceTaskId ? [serviceTaskId] : null,
        visible: !!serviceTaskId,
    });
}

export function createServiceTaskActivityNameFilter(activityName: string | null): StringFilter {
    return new StringFilter({
        name: ServiceTaskFilterKey.SERVICE_TASK_ACTIVITY_NAME,
        translationKey: 'FILTERS.LABELS.SERVICE_TASK.ACTIVITY_NAME',
        value: activityName ? [activityName] : null,
        visible: !!activityName,
    });
}

export function createServiceTaskStatusFilter(defaultStatus: string | null): RadioFilter {
    return new RadioFilter({
        name: ServiceTaskFilterKey.STATUS,
        translationKey: 'FILTERS.LABELS.SERVICE_TASK.STATUS',
        value: defaultStatus ? { label: findStatusTranslationKey(defaultStatus), value: defaultStatus } : null,
        options: SERVICE_TASK_STATUS_OPTIONS,
        visible: !!defaultStatus,
    });
}

export function createServiceTaskStartedDateFilter(
    defaultStartedDateType: DateCloudFilterType,
    defaultStartedFrom: string,
    defaultStartedTo: string
): DateFilter {
    return new DateFilter({
        name: ServiceTaskFilterKey.STARTED_DATE,
        translationKey: 'FILTERS.LABELS.SERVICE_TASK.STARTED_DATE',
        value: getDateValue(defaultStartedDateType, defaultStartedFrom, defaultStartedTo),
        options: DATE_OPTIONS,
        visible: !!defaultStartedDateType,
    });
}

export function createServiceTaskCompletedDateFilter(
    defaultCompletedDateType: DateCloudFilterType,
    defaultCompletedFrom: string,
    defaultCompletedTo: string
): DateFilter {
    return new DateFilter({
        name: ServiceTaskFilterKey.COMPLETED_DATE,
        translationKey: 'FILTERS.LABELS.SERVICE_TASK.COMPLETED_DATE',
        value: getDateValue(defaultCompletedDateType, defaultCompletedFrom, defaultCompletedTo),
        options: DATE_OPTIONS,
        visible: !!defaultCompletedDateType,
    });
}

function findStatusTranslationKey(statusValue: string) {
    return SERVICE_TASK_STATUS_OPTIONS.find((option) => option.value === statusValue)?.label || 'UNKNOWN_STATUS_OPTION';
}

function findDateTranslationKey(dateValue: string) {
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
