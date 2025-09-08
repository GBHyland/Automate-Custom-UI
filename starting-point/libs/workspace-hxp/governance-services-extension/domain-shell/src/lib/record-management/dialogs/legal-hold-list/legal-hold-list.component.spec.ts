/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LegalHoldListComponent } from './legal-hold-list.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject, throwError } from 'rxjs';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { By } from '@angular/platform-browser';
import { mockLegalHoldCasesData } from '../../../mocks/mock-legal-hold-cases.mock';
import { GovernanceLegalHoldService } from '../../../search/search-results/services/legal-hold/governance-legal-hold.service';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';

describe('LegalHoldListComponent', () => {
    let fixture: ComponentFixture<LegalHoldListComponent>;
    let component: LegalHoldListComponent;

    const mockShouldRefresh$ = new Subject<boolean>();

    const mockDialogRef = { close: jest.fn() };
    const mockNotificationService = { showSuccess: jest.fn(), showError: jest.fn() };
    const mockLegalHoldService = {
        queryLegalCases: jest.fn().mockReturnValue(of({ contents: mockLegalHoldCasesData, lastEvaluatedKey: 'key2' })),
    };
    const mockLegalHoldManagementService = {
        assignRecordToLegalCase: jest.fn(),
        emitRecordAssignmentComplete: jest.fn(),
        shouldRefreshList$: mockShouldRefresh$,
    };

    async function setupTest(context: any) {
        await TestBed.configureTestingModule({
            imports: [LegalHoldListComponent, TranslateModule.forRoot()],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: context },
                { provide: MatDialogRef, useValue: mockDialogRef },
                { provide: HxpNotificationService, useValue: mockNotificationService },
                { provide: GovernanceLegalHoldService, useValue: mockLegalHoldService },
                { provide: GovernanceLegalHoldManagementService, useValue: mockLegalHoldManagementService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(LegalHoldListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    }

    afterEach(() => {
        jest.clearAllMocks();
        mockShouldRefresh$.complete();
    });

    it('should render pluralized info message when multiple records exist', async () => {
        const multiRecordContext = {
            records: [
                { id: 'rec1', categoryId: 'cat1', environmentDataSourceId: 'eds1' },
                { id: 'rec2', categoryId: 'cat2', environmentDataSourceId: 'eds2' },
            ],
        };

        await setupTest(multiRecordContext);

        const spanEl = fixture.debugElement.query(By.css('.hxp-legal-hold-info-banner span')).nativeElement;
        expect(spanEl.textContent).toContain('GOVERNANCE.LEGAL_DIALOG.INFO_ADD_RECORDS_plural');
    });

    it('should render singular message when 1 record exists', async () => {
        const singleRecordContext = {
            records: [{ id: 'rec1', categoryId: 'cat1', environmentDataSourceId: 'eds1' }],
        };

        await setupTest(singleRecordContext);

        const spanEl = fixture.debugElement.query(By.css('.hxp-legal-hold-info-banner span')).nativeElement;
        expect(spanEl.textContent).toContain('GOVERNANCE.LEGAL_DIALOG.INFO_ADD_RECORDS');
    });

    it('should call dialogRef.close(false) on cancel', async () => {
        await setupTest({ records: [] });

        component.onCancel();
        expect(mockDialogRef.close).toHaveBeenCalledWith(false);
    });

    it('should disable Assign button when no legal case is selected', async () => {
        await setupTest({ records: [] });

        const assignBtn = fixture.debugElement.query(By.css('button[color="primary"]')).nativeElement;
        expect(assignBtn.disabled).toBe(true);
    });

    it('should call assignRecordToLegalCase and handle success', async () => {
        const recordContext = {
            records: [
                { id: 'rec1', categoryId: 'cat1', environmentDataSourceId: 'eds1' },
                { id: 'rec2', categoryId: 'cat2', environmentDataSourceId: 'eds2' },
            ],
        };

        await setupTest(recordContext);

        component.selectedLegalCase = [{ legalCaseId: 'case-123' }];
        mockLegalHoldManagementService.assignRecordToLegalCase.mockReturnValue(of({}));

        component.addRecordsToLegalCase();

        expect(mockLegalHoldManagementService.assignRecordToLegalCase).toHaveBeenCalledWith({
            records: recordContext.records.map((record) => ({
                edsId: record.environmentDataSourceId,
                categoryId: record.categoryId,
                recordId: record.id,
            })),
            legalCaseIds: ['case-123'],
        });

        expect(mockDialogRef.close).toHaveBeenCalled();
        expect(mockNotificationService.showSuccess).toHaveBeenCalled();
        expect(mockLegalHoldManagementService.emitRecordAssignmentComplete).toHaveBeenCalled();
    });

    it('should handle error from assignRecordToLegalCase', async () => {
        await setupTest({
            records: [{ id: 'rec1', categoryId: 'cat1', environmentDataSourceId: 'eds1' }],
        });

        component.selectedLegalCase = [{ legalCaseId: 'case-999' }];
        mockLegalHoldManagementService.assignRecordToLegalCase.mockReturnValue(throwError(() => new Error('error')));

        component.addRecordsToLegalCase();

        expect(mockNotificationService.showError).toHaveBeenCalled();
        expect(component.isAssigning).toBe(false);
    });
});
