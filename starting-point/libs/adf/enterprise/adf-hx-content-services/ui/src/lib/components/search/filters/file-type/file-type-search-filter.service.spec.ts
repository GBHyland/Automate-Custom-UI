/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { FileTypeSearchFilterService } from './file-type-search-filter.service';
import { FileTypeSearchFilterData } from './file-type-search-filter.data';

describe('FileTypeSearchFilterService', () => {
    let fileTypeSearchFilterService: FileTypeSearchFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [FileTypeSearchFilterService],
        });
        fileTypeSearchFilterService = TestBed.inject(FileTypeSearchFilterService);
    });

    it('should return an empty string if no data is provided', () => {
        const data = {
            values: [],
        } as unknown as FileTypeSearchFilterData;

        expect(fileTypeSearchFilterService.toHXQL(data)).toEqual('');
    });

    it('should return correct HXQL for a single value', () => {
        const data = {
            values: [{ label: 'Portable Document Format', value: ['application/pdf'] }],
        } as FileTypeSearchFilterData;

        const expectedHXQL = `sysfile_blob/mimeType IN ('application/pdf')`;
        expect(fileTypeSearchFilterService.toHXQL(data)).toEqual(expectedHXQL);
    });

    it('should return correct HXQL for multiple values', () => {
        const data = {
            values: [
                { label: 'Portable Document Format', value: ['application/pdf'] },
                { label: 'Word Document', value: ['application/msword'] },
            ],
        } as FileTypeSearchFilterData;

        const expectedHXQL = `sysfile_blob/mimeType IN ('application/pdf', 'application/msword')`;
        expect(fileTypeSearchFilterService.toHXQL(data)).toEqual(expectedHXQL);
    });
});
