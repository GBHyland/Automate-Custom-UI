/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { GovernanceLegalHoldManagementService } from './governance-legal-hold-management.service';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from '../../config/governance-discovery.service';
import { of } from 'rxjs';
import { LegalHoldCaseIdentity } from '../config/legal-config.type';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('GovernanceLegalHoldManagementService', () => {
    let service: GovernanceLegalHoldManagementService;
    let httpMock: HttpTestingController;

    const mockJwtHelperService = {
        getAccessToken: jest.fn().mockReturnValue('mock-token'),
    };

    const mockGovernanceDiscoveryService = {
        getGovernanceApiContext: jest.fn().mockReturnValue(
            of({
                govUrl: 'https://gov-url',
                environmentKey: 'env-key',
                environmentId: 'env-id',
            })
        ),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(withInterceptorsFromDi()),
                provideHttpClientTesting(),
                GovernanceLegalHoldManagementService,
                { provide: JwtHelperService, useValue: mockJwtHelperService },
                { provide: GovernanceDiscoveryService, useValue: mockGovernanceDiscoveryService },
            ],
        });

        service = TestBed.inject(GovernanceLegalHoldManagementService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should create legal hold case with proper request', () => {
        const body: LegalHoldCaseIdentity = {
            legalCaseName: 'test-case-id',
            legalCaseReason: 'Test case reason',
            legalCaseDescription: 'This is a test case description',
        };

        service.createLegalHoldCase(body).subscribe({
            next: () => {},
            error: () => {},
            complete: () => {},
        });

        const req = httpMock.expectOne(
            (request) => request.url === 'https://gov-url/api/legal-cases' && request.params.get('environmentId') === 'env-id'
        );

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(body);
        expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
        expect(req.request.headers.get('x-environment-key')).toBe('env-key');

        req.flush({});
    });

    it('should assign records to legal case with proper request', () => {
        const body = { recordIds: ['rec-1'] };

        service.assignRecordToLegalCase(body).subscribe({
            next: () => {},
            error: () => {},
            complete: () => {},
        });

        const req = httpMock.expectOne(
            (request) => request.url === 'https://gov-url/api/legal-records' && request.params.get('environmentId') === 'env-id'
        );

        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(body);
        expect(req.request.headers.get('Authorization')).toBe('Bearer mock-token');
        expect(req.request.headers.get('x-environment-key')).toBe('env-key');

        req.flush({});
    });

    it('should emit true on emitRefreshList()', (done) => {
        service.shouldRefreshList$.subscribe((val) => {
            expect(val).toBe(true);
            done();
        });

        service.emitRefreshList();
    });

    it('should emit true on emitRecordAssignmentComplete()', (done) => {
        service.recordAssigned$.subscribe((val) => {
            expect(val).toBe(true);
            done();
        });

        service.emitRecordAssignmentComplete();
    });
});
