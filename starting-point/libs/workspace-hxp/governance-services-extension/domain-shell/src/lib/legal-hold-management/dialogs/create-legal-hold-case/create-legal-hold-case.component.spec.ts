/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { CreateLegalHoldCaseComponent } from './create-legal-hold-case.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { GovernanceLegalHoldManagementService } from '../../services/governance-legal-hold-management.service';
import { of, Subject, throwError } from 'rxjs';
import { CreateLegalHoldCaseDialogData, LegalHoldCase } from '../../config/legal-config.type';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';

describe('CreateLegalHoldCaseComponent', () => {
    let component: CreateLegalHoldCaseComponent;
    let fixture: ComponentFixture<CreateLegalHoldCaseComponent>;
    let loader: HarnessLoader;
    let notificationServiceMock: jest.Mocked<HxpNotificationService>;
    let governanceLegalHoldServiceMock: jest.Mocked<GovernanceLegalHoldManagementService>;
    let dialogRefMock: jest.Mocked<MatDialogRef<CreateLegalHoldCaseComponent>>;
    let keydownEvents$: Subject<KeyboardEvent>;
    let backdropClick$: Subject<MouseEvent>;

    const dialogDataMock: CreateLegalHoldCaseDialogData = {
        clickedFrom: 'Legal',
    };

    const newLegalCase: LegalHoldCase = {
        legalCaseId: 'case-001',
        legalCaseName: 'Test Legal Hold Case',
        legalCaseReason: 'Test Reason',
        legalCaseDescription: 'Test Description',
    };

    beforeEach(() => {
        notificationServiceMock = {
            showSuccess: jest.fn(),
            showError: jest.fn(),
        } as unknown as jest.Mocked<HxpNotificationService>;

        governanceLegalHoldServiceMock = {
            createLegalHoldCase: jest.fn(),
            emitRefreshList: jest.fn(),
        } as unknown as jest.Mocked<GovernanceLegalHoldManagementService>;

        keydownEvents$ = new Subject<KeyboardEvent>();
        backdropClick$ = new Subject<MouseEvent>();

        dialogRefMock = {
            close: jest.fn(),
            keydownEvents: jest.fn(() => keydownEvents$.asObservable()),
            backdropClick: jest.fn(() => backdropClick$.asObservable()),
        } as unknown as jest.Mocked<MatDialogRef<CreateLegalHoldCaseComponent>>;

        TestBed.configureTestingModule({
            imports: [CreateLegalHoldCaseComponent, MatDialogModule, TranslateModule.forRoot(), NoopAnimationsModule],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: HxpNotificationService, useValue: notificationServiceMock },
                { provide: GovernanceLegalHoldManagementService, useValue: governanceLegalHoldServiceMock },
                { provide: MatDialogRef, useValue: dialogRefMock },
                { provide: MAT_DIALOG_DATA, useValue: dialogDataMock },
            ],
        });

        fixture = TestBed.createComponent(CreateLegalHoldCaseComponent);
        loader = TestbedHarnessEnvironment.loader(fixture);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should show max length error for name when input exceeds 64 characters', fakeAsync(() => {
        const longName = 'x'.repeat(70);
        component.createLegalHoldCaseForm.get('legal_name')?.setValue(longName);
        component.createLegalHoldCaseForm.get('legal_name')?.markAsTouched();
        fixture.detectChanges();

        const nameControl = component.createLegalHoldCaseForm.get('legal_name');
        expect(nameControl?.hasError('maxlength')).toBe(true);
    }));

    it('should show max length error for reason when input exceeds 512 characters', fakeAsync(() => {
        const longReason = 'x'.repeat(520);
        component.createLegalHoldCaseForm.get('legal_reason')?.setValue(longReason);
        component.createLegalHoldCaseForm.get('legal_reason')?.markAsTouched();
        fixture.detectChanges();

        const reasonControl = component.createLegalHoldCaseForm.get('legal_reason');
        expect(reasonControl?.hasError('maxlength')).toBe(true);
    }));

    it('should show max length error for description when input exceeds 512 characters', fakeAsync(() => {
        const longDesc = 'x'.repeat(520);
        component.createLegalHoldCaseForm.get('legal_description')?.setValue(longDesc);
        component.createLegalHoldCaseForm.get('legal_description')?.markAsTouched();
        fixture.detectChanges();

        const descControl = component.createLegalHoldCaseForm.get('legal_description');
        expect(descControl?.hasError('maxlength')).toBe(true);
    }));

    it('should close the dialog when Cancel is clicked from Legal tab', async () => {
        component.dialogData.clickedFrom = 'Legal';
        fixture.detectChanges();

        const cancelBtn = await loader.getHarness(MatButtonHarness.with({ text: /CANCEL/i }));
        await cancelBtn.click();

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(governanceLegalHoldServiceMock.emitRefreshList).not.toHaveBeenCalled();
    });

    it('should close the dialog and refresh the list when Cancel is clicked from Record flow', async () => {
        component.dialogData.clickedFrom = 'Record';
        fixture.detectChanges();

        const cancelBtn = await loader.getHarness(MatButtonHarness.with({ text: /CANCEL/i }));
        await cancelBtn.click();

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(governanceLegalHoldServiceMock.emitRefreshList).toHaveBeenCalled();
    });

    it('should create legal hold case and show success notification on success', fakeAsync(async () => {
        governanceLegalHoldServiceMock.createLegalHoldCase.mockImplementation(() => of(newLegalCase));

        component.createLegalHoldCaseForm.setValue({
            legal_name: 'Test Legal Hold Case',
            legal_reason: 'Test Reason',
            legal_description: 'Test Description',
        });
        fixture.detectChanges();

        const createBtn = await loader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.CREATE_LEGAL_HOLD_CASE_DIALOG.CREATE/i }));
        await createBtn.click();

        tick();
        fixture.detectChanges();
        flush();

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_CREATE_SUCCESS');
    }));

    it('should create legal hold case, emitReOpenList is called when dialog opened from Record and show success notification on success', fakeAsync(async () => {
        governanceLegalHoldServiceMock.createLegalHoldCase.mockImplementation(() => of(newLegalCase));

        component.dialogData.clickedFrom = 'Record';
        component.createLegalHoldCaseForm.setValue({
            legal_name: 'Test Legal Hold Case',
            legal_reason: 'Test Reason',
            legal_description: 'Test Description',
        });
        fixture.detectChanges();

        const createBtn = await loader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.CREATE_LEGAL_HOLD_CASE_DIALOG.CREATE/i }));
        await createBtn.click();

        tick();
        fixture.detectChanges();
        flush();

        expect(dialogRefMock.close).toHaveBeenCalled();
        expect(notificationServiceMock.showSuccess).toHaveBeenCalledWith('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_CREATE_SUCCESS');
        expect(governanceLegalHoldServiceMock.emitRefreshList).toHaveBeenCalled();
    }));

    it('should show error message as failure and keep open the dialog', fakeAsync(async () => {
        governanceLegalHoldServiceMock.createLegalHoldCase.mockImplementation(() => throwError(() => new Error('boom')));

        component.createLegalHoldCaseForm.setValue({
            legal_name: 'Test Legal Hold Case',
            legal_reason: 'Test Reason',
            legal_description: 'Test Description',
        });
        fixture.detectChanges();

        const createBtn = await loader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.CREATE_LEGAL_HOLD_CASE_DIALOG.CREATE/i }));
        await createBtn.click();

        tick();
        fixture.detectChanges();
        flush();

        expect(dialogRefMock.close).not.toHaveBeenCalled();
        expect(notificationServiceMock.showError).toHaveBeenCalledWith('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_CREATE_ERROR');
    }));

    it('should disabled Create button if form is invalid', fakeAsync(async () => {
        component.createLegalHoldCaseForm.markAsDirty();
        fixture.detectChanges();

        const createBtn = await loader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.CREATE_LEGAL_HOLD_CASE_DIALOG.CREATE/i }));
        expect(await createBtn.isDisabled()).toBe(true);
    }));

    it('should disabled Create button when legal case is creating', fakeAsync(async () => {
        component.createLegalHoldCaseForm.patchValue({
            legal_name: 'Test Legal Hold Case',
            legal_reason: 'Test Reason',
        });
        (component as any).isCreating = true;
        fixture.detectChanges();

        const createBtn = await loader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.CREATE_LEGAL_HOLD_CASE_DIALOG.CREATE/i }));
        expect(await createBtn.isDisabled()).toBe(true);
    }));

    it('should run cancel effects on ESC key when opened from Record', () => {
        component.dialogData.clickedFrom = 'Record';
        fixture.detectChanges();

        keydownEvents$.next(new KeyboardEvent('keydown', { key: 'Escape' }));

        expect(governanceLegalHoldServiceMock.emitRefreshList).toHaveBeenCalled();
    });

    it('should run cancel effects on backdrop click when opened from Record', () => {
        component.dialogData.clickedFrom = 'Record';
        fixture.detectChanges();

        backdropClick$.next(new MouseEvent('click'));

        expect(governanceLegalHoldServiceMock.emitRefreshList).toHaveBeenCalled();
    });

    it('should NOT run cancel effects on ESC/backdrop when opened from Legal', () => {
        component.dialogData.clickedFrom = 'Legal';
        fixture.detectChanges();

        keydownEvents$.next(new KeyboardEvent('keydown', { key: 'Escape' }));
        backdropClick$.next(new MouseEvent('click'));

        expect(governanceLegalHoldServiceMock.emitRefreshList).not.toHaveBeenCalled();
    });

    it('should show duplicate name error when backend returns 409', fakeAsync(async () => {
        governanceLegalHoldServiceMock.createLegalHoldCase.mockImplementation(() => throwError(() => ({ status: 409 })));

        component.createLegalHoldCaseForm.setValue({
            legal_name: 'Duplicate Case',
            legal_reason: 'Some reason',
            legal_description: 'Optional desc',
        });
        fixture.detectChanges();

        const createBtn = await loader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.CREATE_LEGAL_HOLD_CASE_DIALOG.CREATE/i }));
        await createBtn.click();

        tick();
        fixture.detectChanges();
        flush();

        expect(dialogRefMock.close).not.toHaveBeenCalled();
        expect(notificationServiceMock.showError).toHaveBeenCalledWith('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_NAME_EXISTS');
    }));
});
