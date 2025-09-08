/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterData, SearchFilterValue } from '../../../models/search-filter.data';

export class MultiSelectListSearchFilterValue implements SearchFilterValue {
    label = '';
    value = '';
    icon? = '';
    tooltip? = '';
}

const compareFn = (a: MultiSelectListSearchFilterValue, b: MultiSelectListSearchFilterValue) => a.value.localeCompare(b.value);

export class MultiSelectListSearchFilterData implements SearchFilterData {
    values: MultiSelectListSearchFilterValue[] = [];

    constructor(values: MultiSelectListSearchFilterValue[] = []) {
        this.values = values;
    }

    isEquivalentTo(data?: MultiSelectListSearchFilterData): boolean {
        if (!data || this.values.length !== data.values.length) {
            return false;
        }

        const sortedValues = this.values.sort(compareFn);
        const sortedDataValues = data.values.sort(compareFn);

        for (const [i, sortedValue] of sortedValues.entries()) {
            if (sortedValue.value !== sortedDataValues[i].value) {
                return false;
            }
        }

        return true;
    }
}
