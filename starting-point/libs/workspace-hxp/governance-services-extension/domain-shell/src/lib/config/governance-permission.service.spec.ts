/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { GovernancePermissionService } from './governance-permission.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from './governance-discovery.service';
import { of } from 'rxjs';

describe('GovernancePermissionService', () => {
    let service: GovernancePermissionService;
    let httpMock: HttpTestingController;

    const mockJwtHelperService = {
        getAccessToken: () => 'test-access-token',
    };

    const mockGovernanceDiscoveryService = {
        getGovernanceApiContext: () =>
            of({
                govUrl: 'https://governance-url',
                environmentKey: 'env-key',
                environmentId: 'test-env-id',
            }),
    };

    const matchUserInfoRequest = (request: any) =>
        request.url === 'https://governance-url/api/userInfo' && request.params.get('environmentId') === 'test-env-id';

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                GovernancePermissionService,
                { provide: JwtHelperService, useValue: mockJwtHelperService },
                { provide: GovernanceDiscoveryService, useValue: mockGovernanceDiscoveryService },
            ],
        });

        service = TestBed.inject(GovernancePermissionService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should fetch and return user permissions from API', (done) => {
        const mockPermissions = ['governance-api.fileplan.read', 'governance-api.records.read'];

        service.loadPermissions().subscribe((permissions) => {
            expect(permissions).toEqual(mockPermissions);
            done();
        });

        const req = httpMock.expectOne(matchUserInfoRequest);
        expect(req.request.method).toBe('GET');
        expect(req.request.headers.get('Authorization')).toBe('Bearer test-access-token');
        expect(req.request.headers.get('x-environment-key')).toBe('env-key');
        req.flush(mockPermissions);
    });

    it('should cache the result after the first load', (done) => {
        const mockPermissions = ['governance-api.records.read'];

        service.loadPermissions().subscribe((permissions1) => {
            expect(permissions1).toEqual(mockPermissions);

            service.loadPermissions().subscribe((permissions2) => {
                expect(permissions2).toBe(permissions1);
                done();
            });
        });

        const req = httpMock.expectOne(matchUserInfoRequest);
        req.flush(mockPermissions);
    });

    it('should return false if required permissions are not present', (done) => {
        service.hasGovernanceAccess().subscribe((hasAccess) => {
            expect(hasAccess).toBe(false);
            done();
        });

        const req = httpMock.expectOne(matchUserInfoRequest);
        req.flush(['governance-api.fileplan.read']); // missing one required permission
    });

    it('should return true if all required permissions are present', (done) => {
        service.hasGovernanceAccess().subscribe((hasAccess) => {
            expect(hasAccess).toBe(true);
            done();
        });

        const req = httpMock.expectOne(matchUserInfoRequest);
        req.flush(['governance-api.fileplan.read', 'governance-api.records.read']);
    });

    it('should return an empty array if the HTTP call fails', (done) => {
        service.loadPermissions().subscribe((permissions) => {
            expect(permissions).toEqual([]);
            done();
        });

        const req = httpMock.expectOne(matchUserInfoRequest);
        req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
    });
});
