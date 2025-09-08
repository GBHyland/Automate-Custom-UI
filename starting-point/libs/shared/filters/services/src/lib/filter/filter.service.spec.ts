/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { TranslateService } from '@ngx-translate/core';
import { MockProvider } from 'ng-mocks';
import { ALL_FILTERS_MOCK, RADIO_FILTER_MOCK } from './mock/filters.mock';
import { take } from 'rxjs/operators';

describe('FilterService', () => {
    let service: FilterService;
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                MockProvider(TranslateService, {
                    instant: (key: string) => key,
                }),
                FilterService,
            ],
        });
        service = TestBed.inject(FilterService);
    });

    it('should set and get filters', async () => {
        service.setFilters(ALL_FILTERS_MOCK);

        service
            .getAllFilters()
            .pipe(take(1))
            .subscribe((filters) => {
                expect(filters).toEqual(ALL_FILTERS_MOCK);
            });

        service.filtersDirty$.pipe(take(1)).subscribe((dirty) => {
            expect(dirty).toBe(false);
        });

        service.filterValuesChanged$.pipe(take(1)).subscribe((changed) => {
            expect(changed).toBe(false);
        });
    });

    it('should reset filters', async () => {
        service.setFilters(ALL_FILTERS_MOCK);
        service.updateFilter({
            ...ALL_FILTERS_MOCK[0],
            visible: !ALL_FILTERS_MOCK[0].visible,
        });

        service.resetFilters();

        service
            .getAllFilters()
            .pipe(take(1))
            .subscribe((filters) => {
                expect(filters).toEqual(ALL_FILTERS_MOCK);
            });
    });

    it('should update filter', async () => {
        service.setFilters(ALL_FILTERS_MOCK);
        const updatedFilter = {
            ...RADIO_FILTER_MOCK,
            value: { label: 'mockLabel2', value: 'mockValue2' },
        };

        service.updateFilter(updatedFilter);

        service.filtersDirty$.pipe(take(1)).subscribe((dirty) => {
            expect(dirty).toBe(true);
        });

        service.filterValuesChanged$.pipe(take(1)).subscribe((changed) => {
            expect(changed).toBe(true);
        });

        service
            .getAllFilters()
            .pipe(take(1))
            .subscribe((filters) => {
                expect(filters[0].value).toEqual(updatedFilter.value);
            });
    });
});
