/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { AddLegalHoldButtonService } from './add-legal-hold-button.service';
import { MatDialog } from '@angular/material/dialog';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { of } from 'rxjs';
import { ActionContext, GovernanceRecord } from '../../../mocks/record.type';
import { LegalHoldListComponent } from '../../dialogs/legal-hold-list/legal-hold-list.component';

describe('AddLegalHoldButtonService', () => {
    let service: AddLegalHoldButtonService;
    let mockDialog: jest.Mocked<MatDialog>;
    let mockFeaturesService: jest.Mocked<IFeaturesService>;

    const mockRecords: GovernanceRecord[] = [
        {
            id: 'rec-001',
            contentID: 'doc-001',
            fileName: 'Test Record',
            status: 'Ready',
            environmentDataSourceId: '',
            cutOffDate: new Date().toISOString(),
            categoryId: '',
            retainUntil: new Date().toISOString(),
        },
    ];

    const mockContext: ActionContext = {
        records: mockRecords,
    };

    beforeEach(() => {
        mockDialog = {
            open: jest.fn(),
        } as unknown as jest.Mocked<MatDialog>;

        mockFeaturesService = {
            isOn$: jest.fn(),
        } as unknown as jest.Mocked<IFeaturesService>;

        TestBed.configureTestingModule({
            providers: [
                AddLegalHoldButtonService,
                { provide: MatDialog, useValue: mockDialog },
                { provide: FeaturesServiceToken, useValue: mockFeaturesService },
            ],
        });

        service = TestBed.inject(AddLegalHoldButtonService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return true when feature flag is ON and records exist', (done) => {
        mockFeaturesService.isOn$.mockReturnValue(of(true));

        service.isAvailable(mockRecords).subscribe((result) => {
            expect(result).toBe(true);
            expect(mockFeaturesService.isOn$).toHaveBeenCalledWith(ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_GOVERNANCE_WORKSPACE_LEGAL_HOLD);
            done();
        });
    });

    it('should return false when feature flag is OFF', (done) => {
        mockFeaturesService.isOn$.mockReturnValue(of(false));

        service.isAvailable(mockRecords).subscribe((result) => {
            expect(result).toBe(false);
            done();
        });
    });

    it('should return false when records array is empty', (done) => {
        mockFeaturesService.isOn$.mockReturnValue(of(true));

        service.isAvailable([]).subscribe((result) => {
            expect(result).toBe(false);
            done();
        });
    });

    it('should open the LegalHoldListComponent dialog', () => {
        service.execute(mockContext);
        expect(mockDialog.open).toHaveBeenCalledWith(LegalHoldListComponent, {
            width: '1200px',
            data: mockContext,
        });
    });
});
