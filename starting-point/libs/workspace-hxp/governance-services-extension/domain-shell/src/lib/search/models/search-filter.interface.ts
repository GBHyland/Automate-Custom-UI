/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EventEmitter } from '@angular/core';
import { SearchFilterData } from './search-filter.data';

export interface BaseSearchFilter {
    selectedValue?: SearchFilterData;
    filterCleared: EventEmitter<void>;
    filterApplied: EventEmitter<SearchFilterData | undefined>;
    value?: SearchFilterData;

    clearFilter(): void;
    applyFilter(): void;
    applyChanges(): void;
    clearChanges(): void;

    /**
     * A change is pending if the currently selected value is different from the value already applied.
     */
    hasPendingChanges(): boolean;

    /**
     * Discards pending changes by resetting the selected value to the applied value.
     */
    discardPendingChanges(): void;

    /**
     * Converts the provided data value to a string compatible with Governance API
     */
    toQueryParams(data: SearchFilterData): Record<string, any>;
}
