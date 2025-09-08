/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { BaseSearchFilter } from '../../models/search-filter.interface';
import { SearchFilterData } from '../../models/search-filter.data';

interface AppliedFilterData {
    filter: BaseSearchFilter;
    value: SearchFilterData;
}

@Injectable({
    providedIn: 'root',
})
export class SearchFilterValueService {
    public filterReset$ = new Subject<BaseSearchFilter>();
    public filterApplied$ = new Subject<AppliedFilterData>();

    protected filterValuesByType = new Map<BaseSearchFilter, SearchFilterData>();

    constructor() {
        this.filterApplied$.subscribe({
            next: (filterApplied) => this.filterValuesByType.set(filterApplied.filter, filterApplied.value),
        });

        this.filterReset$.subscribe({
            next: (filterToReset) => this.filterValuesByType.delete(filterToReset),
        });
    }

    public emptyFilters(): void {
        this.filterValuesByType.clear();
    }

    public clearFilters(): void {
        for (const appliedFilter of this.filterValuesByType.keys()) {
            appliedFilter.clearFilter();
        }
        this.filterValuesByType.clear();
    }

    public clearFilter(filter: BaseSearchFilter): void {
        filter.clearFilter();
        this.filterValuesByType.delete(filter);
    }

    public hasFilters(): boolean {
        return this.filterValuesByType.size > 0;
    }

    public toQueryParams() {
        const appliedFilters = [...this.filterValuesByType.entries()];
        let query = {};
        for (const [filter, filterData] of appliedFilters) {
            query = { ...query, ...filter.toQueryParams(filterData) };
        }
        return query;
    }
}
