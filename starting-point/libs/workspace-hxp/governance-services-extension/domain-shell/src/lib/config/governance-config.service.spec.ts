/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { GovernanceConfigurationService } from './governance-config.service';
import { GovernanceDiscoveryService } from './governance-discovery.service';
import { JwtHelperService } from '@alfresco/adf-core';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { mockConfigEndpointData } from '../mocks/mock-configuration.data';
import { TestBed } from '@angular/core/testing';
import { lastValueFrom, of } from 'rxjs';

describe('GovernanceConfigurationService', () => {
    let service: GovernanceConfigurationService;
    let httpMock: HttpTestingController;

    const mockDiscoveryService = {
        getGovernanceApiContext: () => {
            return of({
                govUrl: 'http://test-launch-url',
                environmentKey: 'test-environment-key',
                environmentId: 'test-environment-id',
            });
        },
    };

    const mockJwtHelperService = {
        getAccessToken: () => 'test-access-token',
        getValueFromLocalToken: () => ({ environment_id: 'test-environment-id' }),
    };

    function flushConfigRequest() {
        const requests = httpMock.match((request) => request.url.includes('/api/config'));
        for (const req of requests) {
            if (!req.cancelled) {
                req.flush(mockConfigEndpointData);
            }
        }
    }

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                GovernanceConfigurationService,
                {
                    provide: GovernanceDiscoveryService,
                    useValue: mockDiscoveryService,
                },
                {
                    provide: JwtHelperService,
                    useValue: mockJwtHelperService,
                },
            ],
        });
        service = TestBed.inject(GovernanceConfigurationService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it('should return data from configuration endpoint', async () => {
        const promise = lastValueFrom(service.getConfig());
        flushConfigRequest();
        const config = await promise;

        expect(config).toBeTruthy();
        expect(config.dataSources).toBeTruthy();
        expect(config.filePlans).toBeTruthy();
        expect(config.categories).toBeTruthy();
    });

    it('should return all the datasources', async () => {
        const promise = lastValueFrom(service.getConfig());
        flushConfigRequest();
        const config = await promise;

        expect(config.dataSources.length).toBe(1);
        expect(config.dataSources[0].name).toBe('Production');
    });

    it('should collect all categories including nested ones', async () => {
        const promise = lastValueFrom(service.getConfig());
        flushConfigRequest();
        const config = await promise;

        expect(config.categories.length).toBe(3);
        expect(config.categories[0].name).toBe('Retention Category HR APAC');
        expect(config.categories[1].name).toBe('Retention Category HR EU');
        expect(config.categories[2].name).toBe('Sub Retention Category HR EU');
    });
});
