/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { DateSearchFilterData } from './date-search-filter.data';
import {
    endOfWeek,
    addMonths,
    addYears,
    addDays,
    startOfDay,
    endOfDay,
    addWeeks,
    startOfWeek,
    startOfMonth,
    endOfMonth,
    startOfYear,
    endOfYear,
} from 'date-fns';

@Injectable({ providedIn: 'root' })
export class DateSearchFilterService {
    toQueryParams(data: DateSearchFilterData, fieldName: string): Record<string, any> {
        if (!data || !data.values?.length) {
            return {};
        }

        const date = data.values[0].date;

        let from: Date | undefined;
        let to: Date | undefined;

        switch (date) {
            case 'TOMORROW': {
                const d = addDays(new Date(), 1);
                from = startOfDay(d);
                to = endOfDay(d);
                break;
            }
            case 'NEXT_WEEK': {
                const d = addWeeks(new Date(), 1);
                from = startOfWeek(d);
                to = endOfWeek(d);
                break;
            }
            case 'NEXT_MONTH': {
                const d = addMonths(new Date(), 1);
                from = startOfMonth(d);
                to = endOfMonth(d);
                break;
            }
            case 'NEXT_YEAR': {
                const d = addYears(new Date(), 1);
                from = startOfYear(d);
                to = endOfYear(d);
                break;
            }
            default: {
                from = data.values[0].afterDate;
                to = data.values[0].beforeDate;
            }
        }

        if (from && to) {
            return { [`${fieldName}From`]: [from.toISOString()], [`${fieldName}To`]: [to.toISOString()] };
        } else if (from) {
            return { [`${fieldName}From`]: [from.toISOString()] };
        } else if (to) {
            return { [`${fieldName}To`]: [to.toISOString()] };
        }

        // Fallback: If neither 'from' nor 'to' dates are defined (e.g., in the default case with no custom dates)
        return {};
    }
}
