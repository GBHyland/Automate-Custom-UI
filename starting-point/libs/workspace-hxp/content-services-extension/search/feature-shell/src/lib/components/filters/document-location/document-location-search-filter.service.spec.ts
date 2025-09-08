/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DocumentLocationSearchFilterService } from './document-location-search-filter.service';
import { DocumentLocationSearchFilterData } from './document-location-search-filter.data';
import { MockService } from 'ng-mocks';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { of } from 'rxjs';
import { SearchService } from '@alfresco/adf-hx-content-services/services';

describe('DocumentLocationSearchFilterService', () => {
    const mockSearchService = MockService(SearchService);
    let searchInFilterService: DocumentLocationSearchFilterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                {
                    provide: SearchService,
                    useValue: mockSearchService,
                },
                DocumentLocationSearchFilterService,
            ],
        });
        searchInFilterService = TestBed.inject(DocumentLocationSearchFilterService);
    });

    it('should return an empty string if no path is provided', () => {
        const data = {
            values: [],
        } as unknown as DocumentLocationSearchFilterData;

        expect(searchInFilterService.toHXQL(data)).toEqual('');
    });

    it('should return correct HXQL for a single path', () => {
        const data = {
            values: [{ label: '', value: mocks.folderDocument.sys_path }],
        } as DocumentLocationSearchFilterData;

        const expectedHXQL = `(sys_path STARTSWITH '${mocks.folderDocument.sys_path}')`;
        expect(searchInFilterService.toHXQL(data)).toEqual(expectedHXQL);
    });

    it('should return correct HXQL for multiple paths', () => {
        const data = {
            values: [
                { label: '', value: mocks.nestedDocumentAncestors[0].sys_path },
                { label: '', value: mocks.nestedDocumentAncestors[1].sys_path },
            ],
        } as DocumentLocationSearchFilterData;

        const expectedHXQL = `(${data.values.map((document) => `sys_path STARTSWITH '${document.value}'`).join(' OR ')})`;
        expect(searchInFilterService.toHXQL(data)).toEqual(expectedHXQL);
    });

    it('should search for documents when search term is provided', async () => {
        spyOn(mockSearchService, 'sanitizeQuery').and.returnValue('folder');
        spyOn(mockSearchService, 'getDocumentsByQuery').and.returnValue(of(mocks.searchResults));

        expect(mockSearchService.getDocumentsByQuery).not.toHaveBeenCalled();

        const searchTerm = 'folder';
        const searchResultDocuments = await searchInFilterService.searchDocuments(searchTerm).toPromise();

        expect(searchResultDocuments).toBeTruthy();
        expect(searchResultDocuments).toHaveSize(mocks.searchResults.documents.length);
        expect(searchResultDocuments).toEqual(mocks.searchResults.documents);
        expect(mockSearchService.getDocumentsByQuery).toHaveBeenCalled();
    });
});
