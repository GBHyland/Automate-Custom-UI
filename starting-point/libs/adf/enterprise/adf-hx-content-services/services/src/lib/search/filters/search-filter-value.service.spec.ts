/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterValueService } from './search-filter-value.service';
import { SearchFilterData } from './models/search-filter.data';
import { AbstractControl } from '@angular/forms';
import { MockSearchFilterData } from './models/search-filter.data.mock';
import { FilterId } from './models/search-filter-id.type';
import { BaseSearchFilter } from './models/search-filter.interface';

class MockBaseSearchFilterDirective {
    constructor(protected searchFilterValueService: SearchFilterValueService) {}

    public get id(): FilterId {
        return 'MockFilter' as FilterId;
    }

    public toHXQL(data: SearchFilterData): string {
        return data.values.join(' AND ');
    }

    protected getFormControls(): { [key: string]: AbstractControl<any, any> } {
        return {};
    }

    protected setData(): void {
        return;
    }
}

describe('SearchFilterValueService', () => {
    let service: SearchFilterValueService;

    let filter1: BaseSearchFilter;
    let filter2: BaseSearchFilter;

    const filter1SearchData: SearchFilterData = new MockSearchFilterData([
        {
            label: 'Test label',
            value: "sys_created >= DATE '2023-01-01'",
        },
    ]);
    const filter2SearchData: SearchFilterData = new MockSearchFilterData([
        {
            label: 'Filter 2 label',
            value: "sys_modified <= DATE '2024-01-01'",
        },
    ]);

    beforeEach(() => {
        service = new SearchFilterValueService();
        filter1 = new MockBaseSearchFilterDirective(service) as unknown as BaseSearchFilter;
        filter2 = new MockBaseSearchFilterDirective(service) as unknown as BaseSearchFilter;
    });

    it('should return false if there are no filter values', () => {
        expect(service.hasFilters()).toBe(false);
    });

    it('should return true if there are filter values', () => {
        expect(service.hasFilters()).toBeFalsy();

        const filter: BaseSearchFilter = {} as BaseSearchFilter;
        service.filterApplied$.next({ filter, value: {} as SearchFilterData });

        expect(service.hasFilters()).toBe(true);
    });

    it('should remove filter value when filter is reset', () => {
        expect(service.hasFilters()).toBeFalsy();

        const filter: BaseSearchFilter = {} as BaseSearchFilter;
        service.filterApplied$.next({ filter, value: {} as SearchFilterData });

        expect(service.hasFilters()).toBeTruthy();

        service.filterReset$.next(filter);

        expect(service.hasFilters()).toBeFalsy();
    });

    it('should clear all filter values', () => {
        expect(service.hasFilters()).toBeFalsy();

        service.filterApplied$.next({ filter: filter1, value: {} as SearchFilterData });
        service.filterApplied$.next({ filter: filter2, value: {} as SearchFilterData });

        expect(service.hasFilters()).toBeTruthy();

        service.emptyFilters();

        expect(service.hasFilters()).toBeFalsy();
    });

    it('should generate HXQL query without filter values if none is provided', () => {
        const query = service.toHXQL();

        expect(query).toBe('SELECT * FROM SysContent');
    });

    it('should generate HXQL query with filter values', () => {
        service.filterApplied$.next({ filter: filter1, value: filter1SearchData });
        service.filterApplied$.next({ filter: filter2, value: filter2SearchData });
        const query = service.toHXQL();

        expect(query).toBe(`SELECT * FROM SysContent WHERE ${filter1SearchData.values} AND ${filter2SearchData.values}`);
    });
});
