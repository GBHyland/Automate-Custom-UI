/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreateLegalHoldCaseButtonComponent } from './create-legal-hold-case-button.component';
import { CreateLegalHoldCaseButtonService } from './create-legal-hold-case-button.service';
import { MatButtonHarness } from '@angular/material/button/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatDialogRef } from '@angular/material/dialog';
import { LegalHoldInitiator } from '../../config/legal-config.type';
import { LegalHoldListComponent } from '../../../record-management/dialogs/legal-hold-list/legal-hold-list.component';

describe('CreateLegalHoldCaseButtonComponent (Harness)', () => {
    let fixture: ComponentFixture<CreateLegalHoldCaseButtonComponent>;
    let component: CreateLegalHoldCaseButtonComponent;
    let loader: HarnessLoader;

    const mockService = {
        isAvailable: jest.fn(),
        execute: jest.fn(),
    };

    const mockDialogRef = {
        close: jest.fn(),
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CreateLegalHoldCaseButtonComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                { provide: CreateLegalHoldCaseButtonService, useValue: mockService },
                { provide: MatDialogRef<LegalHoldListComponent>, useValue: mockDialogRef },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(CreateLegalHoldCaseButtonComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should render the button when isAvailable is true', async () => {
        mockService.isAvailable.mockReturnValue(true);
        component.clickedFrom = LegalHoldInitiator.Record;

        fixture.detectChanges();

        const button = await loader.getHarness(MatButtonHarness.with({ selector: 'button[mat-stroked-button]' }));
        expect(await button.getText()).toContain('GOVERNANCE.LEGAL_HOLD.CREATE_BUTTON');
    });

    it('should not render the button when isAvailable is false', async () => {
        mockService.isAvailable.mockReturnValue(false);
        component.clickedFrom = LegalHoldInitiator.Legal;

        fixture.detectChanges();

        const buttons = await loader.getAllHarnesses(MatButtonHarness.with({ selector: 'button[mat-stroked-button]' }));
        expect(buttons.length).toBe(0);
    });

    it('should close dialog and call execute when clickedFrom is Record', async () => {
        mockService.isAvailable.mockReturnValue(true);
        component.clickedFrom = LegalHoldInitiator.Record;

        fixture.detectChanges();

        const button = await loader.getHarness(MatButtonHarness.with({ selector: 'button[mat-stroked-button]' }));
        await button.click();

        expect(mockDialogRef.close).toHaveBeenCalled();
        expect(mockService.execute).toHaveBeenCalledWith(LegalHoldInitiator.Record);
    });

    it('should not close dialog but still call execute when clickedFrom is Legal', async () => {
        mockService.isAvailable.mockReturnValue(true);
        component.clickedFrom = LegalHoldInitiator.Legal;

        fixture.detectChanges();

        const button = await loader.getHarness(MatButtonHarness.with({ selector: 'button[mat-stroked-button]' }));
        await button.click();

        expect(mockDialogRef.close).not.toHaveBeenCalled();
        expect(mockService.execute).toHaveBeenCalledWith(LegalHoldInitiator.Legal);
    });
});
