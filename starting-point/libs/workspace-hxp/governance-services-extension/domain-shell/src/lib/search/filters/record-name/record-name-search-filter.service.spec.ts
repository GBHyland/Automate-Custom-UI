/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { RecordNameSearchFilterData } from './record-name-search-filter.data';
import { RecordNameSearchFilterService } from './record-name-search-filter.service';

describe('RecordNameSearchFilterService', () => {
    let service: RecordNameSearchFilterService;

    beforeEach(() => {
        service = new RecordNameSearchFilterService();
    });

    it('should return an empty object if data is undefined', () => {
        const result = service.toQueryParams(undefined as unknown as RecordNameSearchFilterData);
        expect(result).toEqual({});
    });

    it('should return an empty object if data.values is empty', () => {
        const data: RecordNameSearchFilterData = {
            values: [],
            isEquivalentTo: function (): boolean {
                throw new Error('Function not implemented.');
            },
        };
        const result = service.toQueryParams(data);
        expect(result).toEqual({});
    });

    it('should return query params with fileName when valid data is provided', () => {
        const data: RecordNameSearchFilterData = {
            values: [
                {
                    value: 'title-of-record',
                    label: '',
                },
            ],
            isEquivalentTo: function (): boolean {
                throw new Error('Function not implemented.');
            },
        };
        const result = service.toQueryParams(data);
        expect(result).toEqual({ fileName: 'title-of-record' });
    });
});
