/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateCloudFilterType } from '@alfresco/adf-process-services-cloud';
import { DATE_OPTIONS, DateFilter } from '../filter/filter-models/date-filter.model';
import { DateFilterValue } from '../filter/filter.model';
import { StringFilter } from '../filter/filter-models/string-filter.model';

export const AuditFilterKey = {
    APP_NAME: 'appName',
    ENTITY_ID: 'entityId',
    EVENT_TYPE: 'eventType',
    PROCESS_INSTANCE_ID: 'processInstanceId',
    EVENT_TIME: 'eventTime',
    EVENT_TIME_FROM: 'eventTimeFrom',
    EVENT_TIME_TO: 'eventTimeTo',
} as const;
export type AuditFilterKey = typeof AuditFilterKey[keyof typeof AuditFilterKey];

export function createAuditEntityIdFilter(defaultEntityId: string): StringFilter {
    return new StringFilter({
        name: AuditFilterKey.ENTITY_ID,
        translationKey: 'FILTERS.LABELS.AUDIT.ENTITY_ID',
        value: defaultEntityId ? [defaultEntityId] : null,
        visible: !!defaultEntityId,
    });
}

export function createAuditEventTypeFilter(defaultEventType: string): StringFilter {
    return new StringFilter({
        name: AuditFilterKey.EVENT_TYPE,
        translationKey: 'FILTERS.LABELS.AUDIT.EVENT_TYPE',
        value: defaultEventType ? [defaultEventType] : null,
        visible: !!defaultEventType,
    });
}

export function createAuditProcessInstanceIdFilter(defaultProcessInstanceId: string): StringFilter {
    return new StringFilter({
        name: AuditFilterKey.PROCESS_INSTANCE_ID,
        translationKey: 'FILTERS.LABELS.AUDIT.PROCESS_INSTANCE_ID',
        value: defaultProcessInstanceId ? [defaultProcessInstanceId] : null,
        visible: !!defaultProcessInstanceId,
    });
}
export function createAuditEventTimeFilter(
    defaultEventTimeType: DateCloudFilterType,
    defaultEventTimeFrom: string,
    defaultEventTimeTo: string
): DateFilter {
    return new DateFilter({
        name: AuditFilterKey.EVENT_TIME,
        translationKey: 'FILTERS.LABELS.AUDIT.EVENT_TIME',
        value: getDateValue(defaultEventTimeType, defaultEventTimeFrom, defaultEventTimeTo),
        options: DATE_OPTIONS,
        visible: !!defaultEventTimeFrom || !!defaultEventTimeTo,
        useTime: true,
    });
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
