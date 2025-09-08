/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { of, throwError, firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentVersionsService } from './document-versions.service';
import { SearchService } from '../search/search.service';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { versionsMocks } from './versions.mocks';
import { DocumentService } from '../document/document.service';

describe('DocumentVersionsService', () => {
    let documentVersionsService: DocumentVersionsService;
    const searchServiceMock = {
        getDocumentsByQuery: jest.fn(),
    };
    const documentServiceMock = {
        getDocumentById: jest.fn(),
    };
    const expectedQuery = `SELECT * FROM SysContent WHERE sys_parentId = '${jestMocks.fileDocument.sys_id}' AND sysver_isVersion = 1 ORDER BY sysver_created DESC`;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DocumentVersionsService,
                { provide: SearchService, useValue: searchServiceMock },
                { provide: DocumentService, useValue: documentServiceMock },
            ],
        });

        documentVersionsService = TestBed.inject(DocumentVersionsService);
    });

    afterEach(() => {
        searchServiceMock.getDocumentsByQuery.mockClear();
        documentServiceMock.getDocumentById.mockClear();
    });

    it('should return document versions on success', async () => {
        searchServiceMock.getDocumentsByQuery.mockReturnValue(of({ documents: versionsMocks }));
        const versions = await firstValueFrom(documentVersionsService.getVersions(jestMocks.fileDocument));

        expect(versions).toEqual(versionsMocks);
        expect(searchServiceMock.getDocumentsByQuery).toHaveBeenCalledTimes(1);
        expect(searchServiceMock.getDocumentsByQuery).toHaveBeenCalledWith(expectedQuery);
    });

    it('should handle error and return empty array', async () => {
        searchServiceMock.getDocumentsByQuery.mockReturnValue(throwError('Error'));
        const versions = await firstValueFrom(documentVersionsService.getVersions(jestMocks.fileDocument).pipe(catchError(() => of([]))));
        expect(versions).toEqual([]);
        expect(searchServiceMock.getDocumentsByQuery).toHaveBeenCalledTimes(1);
    });
});
