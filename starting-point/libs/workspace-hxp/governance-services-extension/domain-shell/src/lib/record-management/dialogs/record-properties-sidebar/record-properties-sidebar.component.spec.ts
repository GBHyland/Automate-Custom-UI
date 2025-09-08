/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { RecordPropertiesSidebarComponent } from './record-properties-sidebar.component';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BLOCK_EDIT_STATUSES, HxpNotificationService, RecordStatus } from '@alfresco/adf-hx-content-services/services';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatDialog } from '@angular/material/dialog';
import { delay, of, throwError } from 'rxjs';
import { GovernanceRecord } from '../../../mocks/record.type';
import { GovernanceRecordService } from '../../services/governance-record.service';
import { RecordPropertiesButtonService } from '../../actions/record-properties-button/record-properties-button.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MatProgressSpinnerHarness } from '@angular/material/progress-spinner/testing';
import { MatDatepickerToggleHarness } from '@angular/material/datepicker/testing';

describe('RecordPropertiesSidebarComponent (UI behavior)', () => {
    let component: RecordPropertiesSidebarComponent;
    let fixture: ComponentFixture<RecordPropertiesSidebarComponent>;
    let loader: HarnessLoader;
    let notificationServiceMock: jest.Mocked<HxpNotificationService>;

    const mockGovernanceRecordService = {
        editRecord: jest.fn(),
        emitUpdateConfirmed: jest.fn(),
    };

    const mockRecordPropertiesButtonService = {
        execute: jest.fn(),
    };

    const mockRecord: GovernanceRecord = {
        id: 'rec-001',
        contentID: '1',
        fileName: 'Test Record',
        status: RecordStatus.Ready,
        environmentDataSourceId: 'env123',
        cutOffDate: new Date().toISOString(),
        categoryId: 'cat456',
        retainUntil: new Date().toISOString(),
    };

    const setupRecord = (overrides: Partial<GovernanceRecord> = {}) => {
        component.actionContext = {
            records: [{ ...mockRecord, ...overrides }],
            showPanel: true,
        };
        fixture.detectChanges();
    };

    const mockEditRecordSuccess = (cutOffDate: string = new Date().toISOString()) => {
        mockGovernanceRecordService.editRecord.mockReturnValue(of({ ...mockRecord, cutOffDate, fileName: 'Updated' }).pipe(delay(10)));
    };

    const clickEditButton = async () => {
        const btn = await loader.getHarness(MatButtonHarness.with({ text: /EDIT/i }));
        await btn.click();
        fixture.detectChanges();
    };

    const setNewCutoffDate = (daysToAdd = 1) => {
        const date = new Date(component.record.cutOffDate ?? '');
        date.setDate(date.getDate() + daysToAdd);
        component.cutoffDateControl.setValue(date);
        component.cutoffDateControl.markAsDirty();
        fixture.detectChanges();
        return date;
    };

    beforeEach(() => {
        notificationServiceMock = {
            showSuccess: jest.fn(),
            showError: jest.fn(),
        } as unknown as jest.Mocked<HxpNotificationService>;

        TestBed.configureTestingModule({
            imports: [RecordPropertiesSidebarComponent, TranslateModule.forRoot(), NoopAnimationsModule],
            providers: [
                provideHttpClient(),
                provideHttpClientTesting(),
                { provide: HxpNotificationService, useValue: notificationServiceMock },
                { provide: GovernanceRecordService, useValue: mockGovernanceRecordService },
                { provide: RecordPropertiesButtonService, useValue: mockRecordPropertiesButtonService },
            ],
        });

        fixture = TestBed.createComponent(RecordPropertiesSidebarComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);

        setupRecord();
    });

    describe('Layout & Toggle', () => {
        it('should expand and collapse the sidebar', async () => {
            const toggleBtn = await loader.getHarness(MatButtonHarness.with({ selector: 'button[aria-label="GOVERNANCE.SIDEBAR.BUTTONS.TOGGLE"]' }));

            await toggleBtn.click();
            expect((component as any).collapsed).toBe(true);

            await toggleBtn.click();
            expect((component as any).collapsed).toBe(false);
        });
    });

    describe('Edit Mode', () => {
        it('should show Edit button for editable records and hide for retained', async () => {
            setupRecord({ status: RecordStatus.Ready });
            component['isEditableRecord'] = !BLOCK_EDIT_STATUSES.includes(RecordStatus.Ready);
            fixture.detectChanges();
            expect(await loader.getHarnessOrNull(MatButtonHarness.with({ text: /EDIT/i }))).not.toBeNull();

            setupRecord({ status: RecordStatus.UnderRetention });
            component['isEditableRecord'] = !BLOCK_EDIT_STATUSES.includes(RecordStatus.UnderRetention);
            fixture.detectChanges();
            expect(await loader.getHarnessOrNull(MatButtonHarness.with({ text: /EDIT/i }))).toBeNull();
        });

        it('should enable edit mode on clicking Edit', async () => {
            await clickEditButton();
            expect((component as any).editMode).toBe(true);
        });

        it('should toggle Save button based on content change', async () => {
            await clickEditButton();

            component.cutoffDateControl.setValue(new Date(component.record.cutOffDate ?? ''));
            component.cutoffDateControl.markAsDirty();
            fixture.detectChanges();

            let saveBtn = await loader.getHarness(MatButtonHarness.with({ text: /SAVE/i }));
            expect(await saveBtn.isDisabled()).toBe(true);

            setNewCutoffDate();

            saveBtn = await loader.getHarness(MatButtonHarness.with({ text: /SAVE/i }));
            expect(await saveBtn.isDisabled()).toBe(false);
        });
    });

    describe('Save Behavior', () => {
        const expectSavingState = async (expected: boolean) => {
            fixture.detectChanges();
            expect((component as any).isSaving).toBe(expected);
        };

        it('should show spinner and update record on success', fakeAsync(async () => {
            await clickEditButton();

            const newDate = setNewCutoffDate(2);
            mockEditRecordSuccess(newDate.toISOString());

            const saveBtn = await loader.getHarness(MatButtonHarness.with({ text: /SAVE/i }));
            expect(await saveBtn.isDisabled()).toBe(false);

            await saveBtn.click();
            await expectSavingState(true);
            expect(await loader.getHarnessOrNull(MatProgressSpinnerHarness)).not.toBeNull();

            tick(10);
            await expectSavingState(false);

            expect(notificationServiceMock.showSuccess).toHaveBeenCalled();
            expect(component.record.cutOffDate).toBe(newDate.toISOString());

            flush();
        }));

        it('should stop spinner and show error on failure', fakeAsync(async () => {
            await clickEditButton();

            setNewCutoffDate(2);
            mockGovernanceRecordService.editRecord.mockReturnValue(throwError(() => new Error('fail')));

            const saveBtn = await loader.getHarness(MatButtonHarness.with({ text: /SAVE/i }));
            expect(await saveBtn.isDisabled()).toBe(false);

            await saveBtn.click();
            tick();
            await expectSavingState(false);

            expect(await loader.getHarnessOrNull(MatProgressSpinnerHarness)).toBeNull();
            expect(notificationServiceMock.showError).toHaveBeenCalled();
        }));
    });

    describe('Clear & Close', () => {
        it('should clear the cutoff date via datepicker Clear button', async () => {
            await clickEditButton();

            component.cutoffDateControl.setValue(new Date());
            fixture.detectChanges();

            const toggle = await loader.getHarness(MatDatepickerToggleHarness);
            await toggle.openCalendar();
            await fixture.whenStable();
            fixture.detectChanges();

            const rootLoader = TestbedHarnessEnvironment.documentRootLoader(fixture);
            const clearButton = await rootLoader.getHarness(MatButtonHarness.with({ text: /GOVERNANCE.SIDEBAR.DATEPICKER.CLEAR/i }));
            await clearButton.click();

            fixture.detectChanges();
            expect(component.cutoffDateControl.value).toBeNull();
        });

        it('should close the sidebar without confirmation when there are no unsaved changes', async () => {
            const spy = jest.spyOn(TestBed.inject(RecordPropertiesButtonService), 'execute');

            const closeBtn = await loader.getHarness(MatButtonHarness.with({ selector: 'button[aria-label="GOVERNANCE.SIDEBAR.BUTTONS.CLOSE"]' }));
            await closeBtn.click();

            expect(spy).toHaveBeenCalledWith({ records: component.actionContext.records, showPanel: false });
        });

        it('should open confirmation dialog on unsaved changes and close on discard', async () => {
            const spy = jest.spyOn(TestBed.inject(RecordPropertiesButtonService), 'execute');
            const dialogRefMock = { afterClosed: () => of('discard'), close: () => {} };
            jest.spyOn(TestBed.inject(MatDialog), 'open').mockReturnValue(dialogRefMock as any);

            await clickEditButton();
            setNewCutoffDate();

            const closeBtn = await loader.getHarness(MatButtonHarness.with({ selector: 'button[aria-label="GOVERNANCE.SIDEBAR.BUTTONS.CLOSE"]' }));
            await closeBtn.click();
            fixture.detectChanges();

            expect(spy).toHaveBeenCalledWith({ records: component.actionContext.records, showPanel: false });
        });
    });
});
