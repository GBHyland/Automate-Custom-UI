/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RestorePermissionDialogComponent } from './restore-permission-dialog.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioGroupHarness } from '@angular/material/radio/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { UserType } from '@alfresco/adf-hx-content-services/services';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('RestorePermissionDialogComponent', () => {
    let fixture: ComponentFixture<RestorePermissionDialogComponent>;
    let loader: HarnessLoader;
    const mockDialogRef = {
        close: jest.fn(),
    };
    const mockDialogData = {
        dialogTitle: 'Restore Permissions',
        dialogDescription: 'Choose the type of permissions to restore.',
        dialogRejectButton: 'Cancel',
        dialogConfirmButton: 'Confirm',
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RestorePermissionDialogComponent, NoopAnimationsModule, NoopTranslateModule],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(RestorePermissionDialogComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should initialize with ALL as the default restore option', async () => {
        const radioGroup = await loader.getHarness(MatRadioGroupHarness);
        const selectedValue = await radioGroup.getCheckedValue();

        expect(selectedValue).toBe('ALL');
    });

    it('should allow selecting different restore options', async () => {
        const radioGroup = await loader.getHarness(MatRadioGroupHarness);
        const radioButtons = await radioGroup.getRadioButtons();

        // Select "GROUPS"
        await radioButtons[1].check();
        expect(await radioGroup.getCheckedValue()).toBe('GROUPS');

        // Select "USERS"
        await radioButtons[2].check();
        expect(await radioGroup.getCheckedValue()).toBe('USERS');
    });

    it('should close the dialog with restore: false when reject is clicked', async () => {
        const rejectButton = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-permission-dialog-reject-button' }));
        await rejectButton.click();

        expect(mockDialogRef.close).toHaveBeenCalledWith();
    });

    it('should close the dialog with restore: true and the selected option when confirm is clicked', async () => {
        const radioGroup = await loader.getHarness(MatRadioGroupHarness);
        const radioButtons = await radioGroup.getRadioButtons();

        // Select "USERS"
        await radioButtons[2].check();
        fixture.detectChanges();

        const confirmButton = await loader.getHarness(MatButtonHarness.with({ selector: '.hxp-permission-dialog-confirm-button' }));
        await confirmButton.click();

        expect(mockDialogRef.close).toHaveBeenCalledWith({ restore: true, option: UserType.USERS });
    });
});
