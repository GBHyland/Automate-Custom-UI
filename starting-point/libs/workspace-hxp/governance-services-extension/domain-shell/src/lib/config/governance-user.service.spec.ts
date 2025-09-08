/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { GovernanceUserService } from './governance-user.service';
import { JwtHelperService } from '@alfresco/adf-core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GovernanceDiscoveryService } from './governance-discovery.service';
import { of, throwError } from 'rxjs';
import { TestBed } from '@angular/core/testing';
import { mockUsers } from '../mocks/mock-users.data';

describe('GovernanceUserService', () => {
    let service: GovernanceUserService;
    let jwtHelperService: jest.Mocked<JwtHelperService>;
    let http: jest.Mocked<HttpClient>;
    let discoveryService: jest.Mocked<GovernanceDiscoveryService>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GovernanceUserService,
                { provide: JwtHelperService, useValue: { getAccessToken: jest.fn() } },
                { provide: HttpClient, useValue: { get: jest.fn() } },
                { provide: GovernanceDiscoveryService, useValue: { getGovernanceApiContext: jest.fn() } },
            ],
        });
        service = TestBed.inject(GovernanceUserService);
        jwtHelperService = TestBed.inject(JwtHelperService) as jest.Mocked<JwtHelperService>;
        http = TestBed.inject(HttpClient) as jest.Mocked<HttpClient>;
        discoveryService = TestBed.inject(GovernanceDiscoveryService) as jest.Mocked<GovernanceDiscoveryService>;

        discoveryService.getGovernanceApiContext.mockReturnValue(
            of({
                govUrl: 'http://gov-url',
                environmentKey: 'env-key',
                environmentId: 'env-id',
            })
        );
        jwtHelperService.getAccessToken.mockReturnValue('token');
    });

    it('should fetch users with correct headers and params', (done) => {
        http.get.mockReturnValue(of(mockUsers));

        service.getUsers().subscribe((users) => {
            expect(users).toEqual(mockUsers);
            // Check the actual call arguments
            const call = http.get.mock.calls[0];

            expect(call[0]).toBe('http://gov-url/api/users');

            const options = call[1] ?? {};

            expect(options.params).toEqual({ environmentId: 'env-id' });

            const headers = options.headers as HttpHeaders | undefined;

            expect(headers).toBeDefined();
            expect(headers.get('x-environment-key')).toBe('env-key');
            expect(headers.get('Authorization')).toBe('Bearer token');
            expect(headers.get('Content-Type')).toBe('application/json');
            done();
        });
    });

    it('should cache the users observable (shareReplay)', (done) => {
        http.get.mockReturnValue(of(mockUsers));

        const obs1 = service.getUsers();
        const obs2 = service.getUsers();

        expect(obs1).toBe(obs2);

        obs1.subscribe((users) => {
            expect(users).toEqual(mockUsers);
            expect(discoveryService.getGovernanceApiContext).toHaveBeenCalledTimes(1);
            done();
        });
    });

    it('should handle errors and rethrow', (done) => {
        const error = new Error('fail');
        http.get.mockReturnValue(throwError(() => error));

        service.getUsers().subscribe({
            next: () => {},
            error: (err) => {
                expect(err).toBe(error);
                done();
            },
        });
    });
});
