/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CreatedDateSearchFilterData } from './created-date-search-filter.data';

describe('CreatedDateSearchFilterData', () => {
    it('should correctly compare two instances', () => {
        const data1 = new CreatedDateSearchFilterData([{ label: 'some-date-1', date: 'now' }]);
        const data2 = new CreatedDateSearchFilterData([{ label: 'some-date-2', beforeDate: new Date('2023-12-12') }]);
        const data3 = new CreatedDateSearchFilterData([{ label: 'some-date-3', beforeDate: new Date('2023-12-12') }]);

        expect(data1.isEquivalentTo(data2)).toBe(false);
        expect(data2.isEquivalentTo(data3)).toBe(true);
        expect(data1.isEquivalentTo(undefined)).toBe(false);
    });
});
