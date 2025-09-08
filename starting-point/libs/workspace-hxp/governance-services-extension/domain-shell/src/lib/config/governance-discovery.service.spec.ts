/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AppConfigService, JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from './governance-discovery.service';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

// Mock AppConfigService
class MockAppConfigService {
    private config: Record<string, any> = {};
    get<T>(key: string): T | undefined {
        return this.config[key];
    }
    setConfig(key: string, value: any) {
        this.config[key] = value;
    }
}

describe('GovernanceDiscoveryService', () => {
    let service: GovernanceDiscoveryService;
    let appConfig: MockAppConfigService;
    let httpTestingController: HttpTestingController;

    const mockJwtHelperService = {
        getAccessToken: () => 'test-access-token',
        getValueFromLocalToken: () => ({ environment_id: 'test-environment-id' }),
    };

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});
        appConfig = new MockAppConfigService();
        TestBed.configureTestingModule({
            providers: [
                GovernanceDiscoveryService,
                { provide: AppConfigService, useValue: appConfig },
                {
                    provide: JwtHelperService,
                    useValue: mockJwtHelperService,
                },
                provideHttpClient(),
                provideHttpClientTesting(),
            ],
        });
        service = TestBed.inject(GovernanceDiscoveryService);
        httpTestingController = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpTestingController.verify();
    });

    it('should emit govUrl and environmentKey and environmentId when discovery is successful', (done) => {
        const testUrl = 'https://test-url';
        appConfig.setConfig('nucleusApiHost', testUrl);
        const mockResponse = {
            data: {
                currentUser: {
                    subscribedApps: [
                        {
                            app: { key: 'governance' },
                            launchUrl: 'https://governance-url',
                            environmentKey: 'env-key',
                            environmentId: 'test-environment-id',
                        },
                    ],
                },
            },
        };

        service.getGovernanceApiContext().subscribe((context) => {
            expect(context.govUrl).toBe('https://governance-url');
            expect(context.environmentKey).toBe('env-key');
            expect(context.environmentId).toBe('test-environment-id');
            done();
        });

        const req = httpTestingController.expectOne(`${testUrl}/graph/graphql`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should error if governance app is not found', (done) => {
        const testUrl = 'https://test-url';
        appConfig.setConfig('nucleusApiHost', testUrl);

        const mockResponse = {
            data: {
                currentUser: {
                    subscribedApps: [
                        {
                            app: { key: 'other' },
                            launchUrl: '',
                            environmentKey: '',
                            environmentId: 'test-environment-id',
                        },
                    ],
                },
            },
        };

        service.getGovernanceApiContext().subscribe({
            next: () => done('Should not emit'),
            error: (err) => {
                expect(err.message).toContain('Governance app not found');
                done();
            },
        });

        const req = httpTestingController.expectOne(`${testUrl}/graph/graphql`);
        expect(req.request.method).toBe('POST');
        req.flush(mockResponse);
    });

    it('should error if http.post throws', (done) => {
        const testUrl = 'https://test-url';
        appConfig.setConfig('nucleusApiHost', testUrl);

        service.getGovernanceApiContext().subscribe({
            next: () => done('Should not emit'),
            error: (err) => {
                expect(err.message).toContain('Network error');
                done();
            },
        });

        const req = httpTestingController.expectOne(`${testUrl}/graph/graphql`);
        expect(req.request.method).toBe('POST');

        req.flush('Network error', {
            status: 500,
            statusText: 'Network error',
        });
    });
});
