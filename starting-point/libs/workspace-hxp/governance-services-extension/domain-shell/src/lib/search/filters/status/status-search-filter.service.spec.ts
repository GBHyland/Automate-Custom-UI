/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { StatusSearchFilterService } from './status-search-filter.service';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';
import { STATUS_OPTIONS } from './status-options.data';

describe('StatusSearchFilterService', () => {
    let service: StatusSearchFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [StatusSearchFilterService] });
        service = TestBed.inject(StatusSearchFilterService);
    });

    it('should return STATUS_OPTIONS as statuses', () => {
        const statuses = service.getStatuses();
        expect(statuses).toEqual(STATUS_OPTIONS.map((opt) => ({ label: opt.label, value: opt.value })));
    });

    it('toQueryParams should map selected items to status array', () => {
        const data: MultiSelectListSearchFilterData = new MultiSelectListSearchFilterData([
            { label: 'Ready', value: 'Ready' },
            { label: 'Unprocessed', value: 'Unprocessed' },
        ]);

        expect(service.toQueryParams(data)).toEqual({ status: ['Ready', 'Unprocessed'] });
    });
});
