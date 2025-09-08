/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Type } from '@angular/core';
import { Filter, FilterType } from '@alfresco-dbp/shared-filters-services';

import { FilterComponent } from './filter.component';
import { StringFilterComponent } from './string-filter/string-filter.component';
import { CheckboxFilterComponent } from './checkbox-filter/checkbox-filter.component';
import { RadioFilterComponent } from './radio-filter/radio-filter.component';
import { DateFilterComponent } from './date-filter/date-filter.component';
import { UserFilterComponent } from './user-filter/user-filter.component';
import { NumberFilterComponent } from './number-filter/number-filter.component';

type FilterComponentMap = {
    [key in FilterType]: Type<FilterComponent<any>>;
};

export function getFilterComponent<T = Filter>(type: FilterType): Type<FilterComponent<T>> {
    const map: FilterComponentMap = {
        [FilterType.STRING]: StringFilterComponent,
        [FilterType.NUMBER]: NumberFilterComponent,
        [FilterType.RADIO]: RadioFilterComponent,
        [FilterType.CHECKBOX]: CheckboxFilterComponent,
        [FilterType.DATE]: DateFilterComponent,
        [FilterType.USER]: UserFilterComponent,
    };

    return map[type] as Type<FilterComponent<T>>;
}
