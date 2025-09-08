/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterData, SearchFilterValue } from '@alfresco/adf-hx-content-services/services';

export class DocumentLocationSearchFilterValue implements SearchFilterValue {
    label = '';
    value = '';
    docId = '';
}

const compareFn = (a: DocumentLocationSearchFilterValue, b: DocumentLocationSearchFilterValue) => a.value.localeCompare(b.value);

export class DocumentLocationSearchFilterData implements SearchFilterData {
    values: DocumentLocationSearchFilterValue[] = [];

    constructor(values: DocumentLocationSearchFilterValue[] = []) {
        this.values = values;
    }

    isEquivalentTo(data?: DocumentLocationSearchFilterData): boolean {
        if (!data || this.values.length !== data.values.length) {
            return false;
        }

        const sortedValues = this.values.sort(compareFn);
        const sortedDataValues = data.values.sort(compareFn);

        return sortedValues.every((sortedValue, index) => sortedValue.value === sortedDataValues[index].value);
    }
}
