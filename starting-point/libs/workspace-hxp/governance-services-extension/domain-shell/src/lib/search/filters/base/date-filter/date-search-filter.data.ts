/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterData, SearchFilterValue } from '@alfresco/adf-hx-content-services/services';

export class DateSearchFilterValue implements SearchFilterValue {
    label = '';
    date?: string;
    beforeDate?: Date;
    afterDate?: Date;
}

export class DateSearchFilterData implements SearchFilterData {
    values: DateSearchFilterValue[] = [];

    constructor(values: DateSearchFilterValue[] = []) {
        this.values = values;
    }

    isEquivalentTo(data?: DateSearchFilterData): boolean {
        if (!data || this.values.length !== data.values.length) {
            return false;
        }

        // only single selection is supported for this data type
        const val = this.values[0];
        const dataVal = data.values[0];

        return (
            val.date === dataVal.date &&
            val.beforeDate?.toISOString() === dataVal.beforeDate?.toISOString() &&
            val.afterDate?.toISOString() === dataVal.afterDate?.toISOString()
        );
    }
}
