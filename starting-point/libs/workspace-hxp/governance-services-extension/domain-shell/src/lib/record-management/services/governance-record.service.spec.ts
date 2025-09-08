/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { GovernanceRecordService } from './governance-record.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { JwtHelperService } from '@alfresco/adf-core';
import { GovernanceDiscoveryService } from '../../config/governance-discovery.service';
import { of } from 'rxjs';
import { GovernanceRecord } from '../../mocks/record.type';

describe('GovernanceRecordService', () => {
    let service: GovernanceRecordService;
    let httpMock: HttpTestingController;

    const mockAccessToken = 'mock-access-token';
    const mockContext = {
        govUrl: 'http://mock-api',
        environmentKey: 'mock-env-key',
        environmentId: 'mock-env-id',
    };

    const mockJwtHelperService = {
        getAccessToken: jest.fn().mockReturnValue(mockAccessToken),
    };

    const mockGovernanceDiscoveryService = {
        getGovernanceApiContext: jest.fn().mockReturnValue(of(mockContext)),
    };

    const verifyAuthHeaders = (req: any) => {
        expect(req.request.headers.get('Authorization')).toBe(`Bearer ${mockAccessToken}`);
        expect(req.request.headers.get('x-environment-key')).toBe(mockContext.environmentKey);
    };

    beforeEach(() => {
        jest.spyOn(console, 'error').mockImplementation(() => {});

        TestBed.configureTestingModule({
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                GovernanceRecordService,
                { provide: JwtHelperService, useValue: mockJwtHelperService },
                { provide: GovernanceDiscoveryService, useValue: mockGovernanceDiscoveryService },
            ],
        });

        service = TestBed.inject(GovernanceRecordService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should updates a record when save is requested', (done) => {
        const recordId = 'R%231234';
        const payload = {
            cutOffDate: '2025-12-31T00:00:00Z',
            environmentDataSourceId: 'EDS#3456',
            categoryId: 'C#1004',
        };

        service.editRecord(recordId, payload).subscribe((response) => {
            expect(response).toEqual({ success: true });
            done();
        });

        const req = httpMock.expectOne(`${mockContext.govUrl}/api/records/${recordId}?environmentId=${mockContext.environmentId}`);
        expect(req.request.method).toBe('PUT');
        expect(req.request.body).toEqual(payload);
        verifyAuthHeaders(req);
        req.flush({ success: true });
    });

    it('should removes a record when delete is triggered', (done) => {
        const recordId = 'Record123';
        const edsId = 'EDS456';
        const categoryId = 'CAT789';

        service.deleteRecord(recordId, edsId, categoryId).subscribe(() => done());

        const encodedUrl = `${mockContext.govUrl}/api/records/${encodeURIComponent(recordId)}?eds=${encodeURIComponent(
            edsId
        )}&categoryId=${encodeURIComponent(categoryId)}`;
        const req = httpMock.expectOne(encodedUrl);

        expect(req.request.method).toBe('DELETE');
        verifyAuthHeaders(req);
        req.flush({});
    });

    it('should notify when a record update is confirmed', (done) => {
        const updatedRecord = { id: '123' } as GovernanceRecord;

        service.updateConfirmed$.subscribe((record) => {
            expect(record).toEqual(updatedRecord);
            done();
        });

        service.emitUpdateConfirmed(updatedRecord);
    });

    it('should notify when a record deletion is confirmed', (done) => {
        service.deleteConfirmed$.subscribe(() => done());
        service.emitDeleteConfirmed();
    });
});
