/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';
import { STATUS_OPTIONS } from './status-options.data';

@Injectable({
    providedIn: 'root',
})
export class StatusSearchFilterService {
    getStatuses(): { label: string; value: string }[] {
        return STATUS_OPTIONS.map((option) => ({ label: option.label, value: option.value }));
    }

    toQueryParams(data: MultiSelectListSearchFilterData): any {
        return {
            status: data.values.map((item) => item.value),
        };
    }
}
