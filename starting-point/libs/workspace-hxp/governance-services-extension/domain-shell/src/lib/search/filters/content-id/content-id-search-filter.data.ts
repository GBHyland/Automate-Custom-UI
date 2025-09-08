/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterValue, SearchFilterData } from '@alfresco/adf-hx-content-services/services';

export class ContentIdSearchFilterValue implements SearchFilterValue {
    label = '';
    value = '';
}

const compareFn = (a: ContentIdSearchFilterValue, b: ContentIdSearchFilterValue) => a.value.localeCompare(b.value);

export class ContentIdSearchFilterData implements SearchFilterData {
    values: ContentIdSearchFilterValue[] = [];

    constructor(values: ContentIdSearchFilterValue[] = []) {
        this.values = values;
    }

    isEquivalentTo(data?: ContentIdSearchFilterData): boolean {
        if (!data || this.values.length !== data.values.length) {
            return false;
        }

        const sortedValues = this.values.sort(compareFn);
        const sortedDataValues = data.values.sort(compareFn);

        return sortedValues.every((sortedValue, index) => sortedValue.value === sortedDataValues[index].value);
    }
}
