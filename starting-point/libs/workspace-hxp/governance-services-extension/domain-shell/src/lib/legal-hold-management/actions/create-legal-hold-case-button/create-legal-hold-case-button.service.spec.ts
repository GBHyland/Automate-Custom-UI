/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { CreateLegalHoldCaseButtonService } from './create-legal-hold-case-button.service';
import { MatDialog } from '@angular/material/dialog';
import { CreateLegalHoldCaseComponent } from '../../dialogs/create-legal-hold-case/create-legal-hold-case.component';
import { DialogConfig } from '@alfresco/adf-hx-content-services/ui';
import { LegalHoldInitiator } from '../../config/legal-config.type';

describe('CreateLegalHoldCaseButtonService (Jest)', () => {
    let service: CreateLegalHoldCaseButtonService;
    let mockMatDialog: jest.Mocked<MatDialog>;

    beforeEach(() => {
        mockMatDialog = {
            open: jest.fn(),
        } as unknown as jest.Mocked<MatDialog>;

        TestBed.configureTestingModule({
            providers: [CreateLegalHoldCaseButtonService, { provide: MatDialog, useValue: mockMatDialog }],
        });

        service = TestBed.inject(CreateLegalHoldCaseButtonService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return true from isAvailable()', () => {
        expect(service.isAvailable()).toBe(true);
    });

    it('should open CreateLegalHoldCaseComponent with correct config', () => {
        service.execute(LegalHoldInitiator.Record);

        expect(mockMatDialog.open).toHaveBeenCalledWith(CreateLegalHoldCaseComponent, {
            width: DialogConfig.small.width,
            data: {
                clickedFrom: LegalHoldInitiator.Record,
            },
        });
    });
});
