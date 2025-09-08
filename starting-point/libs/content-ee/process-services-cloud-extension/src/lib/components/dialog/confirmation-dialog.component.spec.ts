/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfirmationDialogComponent, ConfirmDialogSettings } from './confirmation-dialog.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogSection } from '@angular/material/dialog/testing';
import { By } from '@angular/platform-browser';
import { ButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;

    const mockDialogRef = {
        close: jasmine.createSpy('close'),
        open: jasmine.createSpy('open'),
    };

    const mockDialogData: ConfirmDialogSettings = {
        title: 'mock-title',
        message: 'mock-message',
        action: 'mock-action',
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ConfirmationDialogComponent],
            providers: [
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
            ],
        });

        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should get data from MAT_DIALOG_DATA as an input to the dialog', () => {
        const data = component.data;
        expect(data).toEqual(mockDialogData);
    });

    it('should be able to display title', () => {
        const dialogTitle = fixture.debugElement.query(By.css(MatDialogSection.TITLE)).nativeElement.textContent.trim();
        expect(dialogTitle).toEqual(mockDialogData.title);
    });

    it('should be able to display message', () => {
        const dialogMessage = fixture.debugElement.query(By.css(MatDialogSection.CONTENT)).nativeElement.textContent.trim();
        expect(dialogMessage).toEqual(mockDialogData.message);
    });

    it('should be able close dialog with true on confirm button clicked', async () => {
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '[data-automation-id="apa-dialog-confirmation-yes"]',
            },
        });
        expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    });

    it('should be able close dialog with false on close button clicked', async () => {
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '[data-automation-id="apa-dialog-confirmation-no"]',
            },
        });
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });
});
