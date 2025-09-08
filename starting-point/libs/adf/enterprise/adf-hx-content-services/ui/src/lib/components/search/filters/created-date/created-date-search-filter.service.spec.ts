/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { CreatedDateSearchFilterService } from './created-date-search-filter.service';
import { formatISO, sub } from 'date-fns';
import { CreatedDateSearchFilterData } from './created-date-search-filter.data';
import { MatTooltipModule } from '@angular/material/tooltip';

describe('CreatedDateSearchFilterService', () => {
    let service: CreatedDateSearchFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatTooltipModule],
            providers: [CreatedDateSearchFilterService],
        });
        service = TestBed.inject(CreatedDateSearchFilterService);
    });

    it('should return correct HXQL for custom date range with only after date', () => {
        const afterDate = new Date('2024-01-09');
        const data = new CreatedDateSearchFilterData([
            {
                label: '',
                afterDate,
                beforeDate: undefined,
            },
        ]);
        const expected = "sys_created >= DATE '2024-01-09'";
        expect(service.toHXQL(data)).toEqual(expected);
    });

    it('should return correct HXQL for custom date range with only before date', () => {
        const beforeDate = new Date('2024-01-10');
        const data = new CreatedDateSearchFilterData([
            {
                label: '',
                afterDate: undefined,
                beforeDate,
            },
        ]);
        const expected = "sys_created <= DATE '2024-01-10'";
        expect(service.toHXQL(data)).toEqual(expected);
    });

    it('should return correct HXQL for custom date range with both after and before dates', () => {
        const afterDate = new Date('2024-01-09');
        const beforeDate = new Date('2024-01-10');
        const data = new CreatedDateSearchFilterData([
            {
                label: '',
                afterDate,
                beforeDate,
            },
        ]);
        const expected = "sys_created >= DATE '2024-01-09' AND sys_created <= DATE '2024-01-10'";
        expect(service.toHXQL(data)).toEqual(expected);
    });

    it(`should return correct HXQL for default options`, () => {
        const testCases = [
            { id: 'LAST_7_DAYS', config: { days: 7 } },
            { id: 'LAST_30_DAYS', config: { months: 1 } },
            { id: 'LAST_6_MONTHS', config: { months: 6 } },
            { id: 'LAST_YEAR', config: { years: 1 } },
        ];

        for (const { id, config } of testCases) {
            const data = new CreatedDateSearchFilterData([{ label: id, date: id }]);
            const expected = `sys_created >= DATE '${formatISO(sub(new Date(), config), { representation: 'date' })}'`;
            expect(service.toHXQL(data)).toEqual(expected);
        }
    });
});
