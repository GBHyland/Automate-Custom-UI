/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter } from '@alfresco-dbp/shared-filters-services';
import { getAllFiltersMock, getStringFilterMock } from '../../mock/filters.mock';
import { FilterByPipe } from './filter-by.pipe';

describe('FilterByPipe', () => {
    let pipe: FilterByPipe;
    let allFilters: Filter[];
    let stringFilter: Filter;

    beforeEach(() => {
        pipe = new FilterByPipe();
        allFilters = getAllFiltersMock();
        stringFilter = getStringFilterMock();
    });

    it('should return the filters if the search phrase is empty', () => {
        const searchPhrase = '';

        const result = pipe.transform(allFilters, searchPhrase);

        expect(result).toEqual(allFilters);
    });

    it('should return the filters that match the search phrase', () => {
        const searchPhrase = stringFilter.label;

        const result = pipe.transform(allFilters, searchPhrase);

        expect(result).toEqual([stringFilter]);
    });

    it('should return the filters that match the search phrase case insensitive', () => {
        const searchPhrase = stringFilter.label.toUpperCase();

        const result = pipe.transform(allFilters, searchPhrase);

        expect(result).toEqual([stringFilter]);
    });
});
