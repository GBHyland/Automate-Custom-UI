/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { GovernanceSearchService } from './governance-search.service';
import { of } from 'rxjs';
import { GovernanceDiscoveryService } from '../../../config/governance-discovery.service';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { JwtHelperService } from '@alfresco/adf-core';
import { mockGovernanceSearchResults } from '../../../mocks/mock-results.data';

describe('GovernanceSearchService', () => {
    let service: GovernanceSearchService;
    let httpMock: HttpTestingController;

    const mockGovUrl = 'https://mock-api.com';
    const mockToken = 'mock-token';
    const mockEnvKey = 'env-key';
    const mockQuery = { eds: 'EDS#test' };
    const mockOptions = { limit: 25 };

    const mockDiscoveryService = {
        getGovernanceApiContext: jest.fn().mockReturnValue(
            of({
                govUrl: mockGovUrl,
                environmentKey: mockEnvKey,
            })
        ),
    };

    const mockConfigService = {
        getConfig: jest.fn().mockReturnValue(
            of({
                dataSources: [{ id: 'test' }],
            })
        ),
    };

    const mockJwtService = {
        getAccessToken: jest.fn().mockReturnValue(mockToken),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: GovernanceDiscoveryService, useValue: mockDiscoveryService },
                { provide: GovernanceConfigurationService, useValue: mockConfigService },
                { provide: JwtHelperService, useValue: mockJwtService },
            ],
        });

        service = TestBed.inject(GovernanceSearchService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should clear cache', () => {
        (service as any).nextPageCache = { dummy: 'yes' };
        service.clearCache();
        expect((service as any).nextPageCache).toBeNull();
    });

    it('should cache excess records if response is larger than page size', (done) => {
        const baseRecords = mockGovernanceSearchResults;
        const pageSize = 2;
        const result = (service as any).combinePageResultSync(mockQuery, mockOptions, baseRecords, [], pageSize, 'key-123');

        expect(result.content.length).toBe(pageSize);
        expect((service as any).nextPageCache.cachedRecords.length).toBe(baseRecords.length - pageSize);
        done();
    });

    it('should trim to pageSize and cache excess using combinePageResultSync()', () => {
        const pageSize = 5;
        const allRecords = mockGovernanceSearchResults.slice(0, 8); // 8 items
        const expectedFirstPage = allRecords.slice(0, 5);
        const expectedExcess = allRecords.slice(5);

        const result = (service as any).combinePageResultSync(mockQuery, { limit: pageSize }, allRecords, [], pageSize, 'key-123');

        expect(result.content.length).toBe(5);
        expect(result.content.map((r) => r.contentID)).toEqual(expectedFirstPage.map((r) => r.contentID));

        const cache = (service as any).nextPageCache;
        expect(cache).toBeTruthy();
        expect(cache.cachedRecords.map((r) => r.contentID)).toEqual(expectedExcess.map((r) => r.contentID));
    });
});
