/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DispositionSearchFilterService } from './disposition-search-filter.service';
import { DateSearchFilterService } from '../base/date-filter/date-search-filter.service';
import { SearchFilterData } from '../../models/search-filter.data';

describe('DispositionSearchFilterService', () => {
    let service: DispositionSearchFilterService;
    let dateService: { toQueryParams: jest.Mock };

    beforeEach(() => {
        const dateSpy = { toQueryParams: jest.fn() };

        TestBed.configureTestingModule({
            providers: [DispositionSearchFilterService, { provide: DateSearchFilterService, useValue: dateSpy }],
        });

        service = TestBed.inject(DispositionSearchFilterService);
        dateService = TestBed.inject(DateSearchFilterService) as any;
    });

    it('should call DateSearchFilterService with retainedUntil params', () => {
        const data = { from: '2021-01-01', to: '2021-12-31' } as unknown as SearchFilterData;
        const expected = { retainedUntil: '2021-12-31' };
        dateService.toQueryParams.mockReturnValue(expected);

        const result = service.toQueryParams(data);

        expect(dateService.toQueryParams).toHaveBeenCalledWith(data, 'dispositionDate');
        expect(result).toBe(expected);
    });
});
