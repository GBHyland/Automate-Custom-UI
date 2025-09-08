/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentCategorySearchFilterData } from './document-category-search-filter.data';

describe('DocumentCategorySearchFilterData', () => {
    it('should correctly compare two instances', () => {
        const data1 = new DocumentCategorySearchFilterData([
            { label: 'SysFile', value: 'SysFile' },
            { label: 'SysFolder', value: 'SysFolder' },
            { label: 'Other', value: 'Other' },
        ]);
        const data2 = new DocumentCategorySearchFilterData([
            { label: 'SysFile', value: 'SysFile' },

            { label: 'Other', value: 'Other' },
            { label: 'SysFolder', value: 'SysFolder' },
        ]);
        const data3 = new DocumentCategorySearchFilterData([
            { label: 'SysFile', value: 'SysFile' },
            { label: 'SysFolder', value: 'SysFolder' },
        ]);

        expect(data1.isEquivalentTo(data2)).toBe(true);
        expect(data1.isEquivalentTo(data3)).toBe(false);
        expect(data1.isEquivalentTo(undefined)).toBe(false);
    });
});
