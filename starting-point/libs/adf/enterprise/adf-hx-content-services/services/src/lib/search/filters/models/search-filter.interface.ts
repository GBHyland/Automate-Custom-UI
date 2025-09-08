/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EventEmitter } from '@angular/core';
import { SearchFilterData } from '../models/search-filter.data';
import { FilterId } from '../models/search-filter-id.type';

export interface BaseSearchFilter {
    selectedValue?: SearchFilterData;
    filterCleared: EventEmitter<void>;
    filterApplied: EventEmitter<SearchFilterData | undefined>;
    value?: SearchFilterData;

    /**
     * Gets the unique identifier of the filter.
     * Note that filters should contribute their own id to the FilterId type.
     */
    id: FilterId;

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
     * Populates whatever properties the filter needs with the provided data.
     */
    populateWith(data: SearchFilterData): void;

    /**
     * Converts the provided data value to an HXQL string.
     */
    toHXQL(data: SearchFilterData): string;
}
