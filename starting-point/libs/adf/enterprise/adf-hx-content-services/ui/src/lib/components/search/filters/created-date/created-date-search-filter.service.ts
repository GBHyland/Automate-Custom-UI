/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { formatISO, sub } from 'date-fns';
import { SearchFilterService } from '@alfresco/adf-hx-content-services/services';
import { CreatedDateSearchFilterData } from './created-date-search-filter.data';

@Injectable()
export class CreatedDateSearchFilterService implements SearchFilterService {
    public toHXQL(data: CreatedDateSearchFilterData): string {
        const valuesArray = data?.values;
        if (!valuesArray || valuesArray?.length === 0) {
            return '';
        }
        const createdDateValue = valuesArray[0];

        switch (createdDateValue.date) {
            case 'LAST_7_DAYS': {
                return this.formatCreatedDateToHXQL('after', sub(new Date(), { days: 7 }));
            }
            case 'LAST_30_DAYS': {
                return this.formatCreatedDateToHXQL('after', sub(new Date(), { months: 1 }));
            }
            case 'LAST_6_MONTHS': {
                return this.formatCreatedDateToHXQL('after', sub(new Date(), { months: 6 }));
            }
            case 'LAST_YEAR': {
                return this.formatCreatedDateToHXQL('after', sub(new Date(), { years: 1 }));
            }
            default: {
                const { afterDate, beforeDate } = createdDateValue;

                if (afterDate && beforeDate) {
                    const afterDateValue = this.formatCreatedDateToHXQL('after', afterDate);
                    const beforeDateValue = this.formatCreatedDateToHXQL('before', beforeDate);
                    return `${afterDateValue} AND ${beforeDateValue}`;
                } else if (afterDate && !beforeDate) {
                    return this.formatCreatedDateToHXQL('after', afterDate);
                } else if (!afterDate && beforeDate) {
                    return this.formatCreatedDateToHXQL('before', beforeDate);
                }
            }
        }

        return '';
    }

    private formatCreatedDateToHXQL(type: 'after' | 'before', date: Date) {
        const formattedDate = formatISO(date, { representation: 'date' });
        return type === 'before' ? `sys_created <= DATE '${formattedDate}'` : `sys_created >= DATE '${formattedDate}'`;
    }
}
