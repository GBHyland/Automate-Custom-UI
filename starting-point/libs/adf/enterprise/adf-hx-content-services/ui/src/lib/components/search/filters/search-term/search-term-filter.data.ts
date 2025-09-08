/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterData, SearchFilterValue, SearchType } from '@alfresco/adf-hx-content-services/services';

export class SearchTermFilterValue implements SearchFilterValue {
    label = '';
    term = '';
    type: SearchType = SearchType.BASIC;
}

const compareFn = (a: SearchTermFilterValue, b: SearchTermFilterValue) => a.term.localeCompare(b.term) && a.type.localeCompare(b.type);

export class SearchTermFilterData implements SearchFilterData {
    values: SearchTermFilterValue[] = [];

    constructor(values: SearchTermFilterValue[] = []) {
        this.values = values;
    }

    isEquivalentTo(data?: SearchTermFilterData): boolean {
        if (!data || this.values.length !== data.values.length) {
            return false;
        }

        const sortedValues = this.values.sort(compareFn);
        const sortedDataValues = data.values.sort(compareFn);

        for (const [i, sortedValue] of sortedValues.entries()) {
            if (sortedValue.term !== sortedDataValues[i].term && sortedValue.type !== sortedDataValues[i].type) {
                return false;
            }
        }

        return true;
    }
}
