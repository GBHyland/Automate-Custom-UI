/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DateSearchFilterService } from './date-search-filter.service';
import { SearchFilterData } from '../../../models/search-filter.data';
import * as df from 'date-fns';
import { DateSearchFilterData } from './date-search-filter.data';

describe('DateSearchFilterService', () => {
    let service: DateSearchFilterService;
    const FIELD = 'testDate';

    // Freeze "today" to May 28, 2025
    const base = new Date(2025, 4, 28);

    beforeEach(() => {
        jest.useFakeTimers();
        jest.setSystemTime(base);
        TestBed.configureTestingModule({ providers: [DateSearchFilterService] });
        service = TestBed.inject(DateSearchFilterService);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('should return {} when no values', () => {
        const result = service.toQueryParams(undefined as unknown as SearchFilterData, FIELD);

        expect(result).toEqual({});
    });

    it('should return a range of dates when date is TOMORROW', () => {
        const tomorrow = df.addDays(base, 1);
        const expected = {
            [`${FIELD}From`]: [df.startOfDay(tomorrow).toISOString()],
            [`${FIELD}To`]: [df.endOfDay(tomorrow).toISOString()],
        };
        const data = { values: [{ date: 'TOMORROW' }] } as unknown as SearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual(expected);
    });

    it('should return a range of dates when date is NEXT_WEEK', () => {
        const nextWeekDate = df.addWeeks(base, 1);
        const expected = {
            [`${FIELD}From`]: [df.startOfWeek(nextWeekDate).toISOString()],
            [`${FIELD}To`]: [df.endOfWeek(nextWeekDate).toISOString()],
        };
        const data = { values: [{ date: 'NEXT_WEEK' }] } as unknown as SearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual(expected);
    });

    it('should return a range of dates when date is NEXT_MONTH', () => {
        const m = df.addMonths(base, 1);
        const expected = {
            [`${FIELD}From`]: [df.startOfMonth(m).toISOString()],
            [`${FIELD}To`]: [df.endOfMonth(m).toISOString()],
        };
        const data = { values: [{ date: 'NEXT_MONTH' }] } as unknown as SearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual(expected);
    });

    it('should return a range of dates when date is NEXT_YEAR', () => {
        const y = df.addYears(base, 1);
        const expected = {
            [`${FIELD}From`]: [df.startOfYear(y).toISOString()],
            [`${FIELD}To`]: [df.endOfYear(y).toISOString()],
        };
        const data = { values: [{ date: 'NEXT_YEAR' }] } as unknown as SearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual(expected);
    });

    it('should return a range of dates when date is custom afterDate only', () => {
        const after = new Date(2020, 5, 15);
        const data = { values: [{ afterDate: after }] } as unknown as DateSearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual({
            [`${FIELD}From`]: [after.toISOString()],
        });
    });

    it('should return a range of dates when date is custom beforeDate only', () => {
        const before = new Date(2020, 8, 30);
        const data = { values: [{ beforeDate: before }] } as unknown as DateSearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual({
            [`${FIELD}To`]: [before.toISOString()],
        });
    });

    it('should return a range of dates when date is custom afterDate and beforeDate', () => {
        const after = new Date(2020, 5, 1);
        const before = new Date(2020, 5, 10);
        const data = { values: [{ afterDate: after, beforeDate: before }] } as unknown as DateSearchFilterData;

        expect(service.toQueryParams(data, FIELD)).toEqual({
            [`${FIELD}From`]: [after.toISOString()],
            [`${FIELD}To`]: [before.toISOString()],
        });
    });
});
