/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { GovernanceLegalHoldService } from './governance-legal-hold.service';
import { JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from '../../../../config/governance-discovery.service';
import { mockLegalHoldCasesData } from '../../../../mocks/mock-legal-hold-cases.mock';
import { DEFAULT_GOVERNANCE_SEARCH_LIMIT } from '../governance-search.constants';
describe('GovernanceLegalHoldService', () => {
    let service: GovernanceLegalHoldService;

    const mockGetAccessToken = jest.fn().mockReturnValue('mock-token');
    const mockGetGovernanceApiContext = jest.fn().mockReturnValue(
        of({
            govUrl: 'https://mock-gov-api.alfresco.com',
            environmentKey: 'mock-env-key',
        })
    );
    const mockHttpGet = jest.fn();

    const jwtHelperMock = {
        getAccessToken: mockGetAccessToken,
    };

    const discoveryServiceMock = {
        getGovernanceApiContext: mockGetGovernanceApiContext,
    };

    const httpClientMock = {
        get: mockHttpGet,
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GovernanceLegalHoldService,
                { provide: JwtHelperService, useValue: jwtHelperMock },
                { provide: GovernanceDiscoveryService, useValue: discoveryServiceMock },
                { provide: HttpClient, useValue: httpClientMock },
            ],
        });

        service = TestBed.inject(GovernanceLegalHoldService);
        jest.clearAllMocks();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should call the API with default limit and return legal cases', async () => {
        const mockResult = { entries: mockLegalHoldCasesData, lastEvalKey: null };
        mockHttpGet.mockReturnValue(of(mockResult));

        const result = await service.queryLegalCases().toPromise();

        expect(mockGetAccessToken).toHaveBeenCalled();
        expect(mockGetGovernanceApiContext).toHaveBeenCalled();

        const expectedUrl = 'https://mock-gov-api.alfresco.com/api/legal-cases';
        expect(mockHttpGet).toHaveBeenCalledWith(
            expectedUrl,
            expect.objectContaining({
                headers: expect.anything(),
                params: expect.anything(),
            })
        );

        expect(result).toEqual(mockResult);
    });

    it('should use custom limit and lastEvalKey in query params', async () => {
        const options = { limit: 5, lastEvalKey: 'abc123' };
        const mockResult = { entries: mockLegalHoldCasesData.slice(0, 5), lastEvalKey: 'abc123' };

        mockHttpGet.mockReturnValue(of(mockResult));

        const result = await service.queryLegalCases(options).toPromise();

        const callArgs = mockHttpGet.mock.calls[0];
        const params = callArgs[1].params;

        expect(params.get('limit')).toBe('5');
        expect(params.get('lastEvalKey')).toBe('abc123');
        expect(result).toEqual(mockResult);
    });

    it('should use default limit when no options are provided', async () => {
        const mockResult = { entries: mockLegalHoldCasesData, lastEvalKey: null };
        mockHttpGet.mockReturnValue(of(mockResult));

        await service.queryLegalCases().toPromise();

        const params = mockHttpGet.mock.calls[0][1].params;
        expect(params.get('limit')).toBe(DEFAULT_GOVERNANCE_SEARCH_LIMIT.toString());
    });
});
