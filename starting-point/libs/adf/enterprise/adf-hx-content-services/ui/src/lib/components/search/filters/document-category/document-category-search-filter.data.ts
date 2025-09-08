/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterValue, SearchFilterData } from '@alfresco/adf-hx-content-services/services';

export class DocumentCategorySearchFilterValue implements SearchFilterValue {
    label = '';
    value = '';
}

const compareFn = (a: DocumentCategorySearchFilterValue, b: DocumentCategorySearchFilterValue) => a.value.localeCompare(b.value);

export class DocumentCategorySearchFilterData implements SearchFilterData {
    values: DocumentCategorySearchFilterValue[] = [];

    constructor(values: DocumentCategorySearchFilterValue[] = []) {
        this.values = values;
    }

    isEquivalentTo(data?: DocumentCategorySearchFilterData): boolean {
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
