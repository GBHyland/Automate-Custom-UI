/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFilterOperators } from '@alfresco/adf-process-services-cloud';
import { NumberFilterOperatorType } from '../filter/filter.model';
import { addMinutes } from 'date-fns';

export const mapProcessFilterOperatorToNumberOperator = (operator: ProcessFilterOperators): NumberFilterOperatorType => {
    switch (operator) {
        case 'eq': {
            return NumberFilterOperatorType.EQUALS;
        }
        case 'ne': {
            return NumberFilterOperatorType.NOT_EQUALS;
        }
        case 'gt': {
            return NumberFilterOperatorType.GREATER_THAN;
        }
        case 'gte': {
            return NumberFilterOperatorType.GREATER_THAN_OR_EQUALS;
        }
        case 'lt': {
            return NumberFilterOperatorType.LESS_THAN;
        }
        case 'lte': {
            return NumberFilterOperatorType.LESS_THAN_OR_EQUALS;
        }
        default: {
            return NumberFilterOperatorType.EQUALS;
        }
    }
};

export const mapNumberOperatorsToProcessFilterOperator = (numberOperator: NumberFilterOperatorType): ProcessFilterOperators => {
    switch (numberOperator) {
        case NumberFilterOperatorType.EQUALS: {
            return 'eq';
        }
        case NumberFilterOperatorType.NOT_EQUALS: {
            return 'ne';
        }
        case NumberFilterOperatorType.GREATER_THAN: {
            return 'gt';
        }
        case NumberFilterOperatorType.GREATER_THAN_OR_EQUALS: {
            return 'gte';
        }
        case NumberFilterOperatorType.LESS_THAN: {
            return 'lt';
        }
        case NumberFilterOperatorType.LESS_THAN_OR_EQUALS: {
            return 'lte';
        }
        default: {
            return 'eq';
        }
    }
};

export function mapDateToLocalTimeZone(isoDateString: string): string {
    const timeZoneOffset = new Date().getTimezoneOffset();
    const isoDate = new Date(isoDateString);
    const localDate = addMinutes(isoDate, -timeZoneOffset);
    const isoDateWithoutTime = localDate.toISOString().slice(0, 10);

    return isoDateWithoutTime;
}
