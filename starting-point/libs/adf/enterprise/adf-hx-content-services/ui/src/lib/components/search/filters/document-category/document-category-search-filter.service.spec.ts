/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DocumentCategorySearchFilterService } from './document-category-search-filter.service';
import { DocumentCategorySearchFilterData } from './document-category-search-filter.data';

describe('DocumentCategorySearchFilterService', () => {
    let service: DocumentCategorySearchFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DocumentCategorySearchFilterService],
        });
        service = TestBed.inject(DocumentCategorySearchFilterService);
    });

    it('should return correct HXQL query', () => {
        const data = new DocumentCategorySearchFilterData([
            {
                label: 'SysFile',
                value: 'SysFile',
            },
        ]);
        expect(service.toHXQL(data)).toEqual("sys_primaryType IN ('SysFile')");
    });

    it('should return correct HXQL query with multiple values', () => {
        const data = new DocumentCategorySearchFilterData([
            { label: 'SysFile', value: 'SysFile' },
            { label: 'SysFolder', value: 'SysFolder' },
            { label: 'SpecialFile', value: 'SpecialFile' },
        ]);
        expect(service.toHXQL(data)).toEqual("sys_primaryType IN ('SysFile','SysFolder','SpecialFile')");
    });
});
