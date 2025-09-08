/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExtractionTableComponent } from './extraction-table.component';
import { IdpVerificationService } from '../../services/verification/verification.service';
import { ActionHistoryService } from '../../services/action-history.service';
import { IdpField, IdpTable, IdpTableRowRecord } from '../../models/screen-models';
import { By } from '@angular/platform-browser';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { fieldVerificationRootState } from '../../store/shared-mock-states';
import { selectActiveTable } from '../../store/selectors/document-table.selectors';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { documentFieldFeatureSelector } from '../../store/selectors/field-verification-root.selectors';
import { IdpFieldDataType } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('ExtractionTableComponent', () => {
    let component: ExtractionTableComponent;
    let fixture: ComponentFixture<ExtractionTableComponent>;
    let mockActionHistoryService: jasmine.SpyObj<ActionHistoryService>;

    let store: MockStore;
    let idpVerificationService: IdpVerificationService;

    const updatedFieldValue = 'Updated Field Value 1';

    const mockTable: IdpTable = {
        rows: [
            {
                rowCells: [
                    {
                        id: '1',
                        value: 'A1',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 0,
                        verificationStatus: 'ManualValid',
                        name: '',
                    },
                    {
                        id: '2',
                        value: 'A2',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 0,
                        verificationStatus: 'ManualValid',
                        name: '',
                    },
                ],
            },
            {
                rowCells: [
                    {
                        id: '3',
                        value: 'B1',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 0,
                        verificationStatus: 'ManualValid',
                        name: '',
                    },
                    {
                        id: '4',
                        value: 'B2',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 0,
                        verificationStatus: 'ManualValid',
                        name: '',
                    },
                ],
            },
        ],
        columnHeaderNames: ['Column 1', 'Column 2'],
        id: '',
        name: '',
    };

    beforeEach(async () => {
        mockActionHistoryService = jasmine.createSpyObj('ActionHistoryService', ['canUndo', 'undo', 'canRedo', 'redo', 'do']);

        TestBed.configureTestingModule({
            imports: [ExtractionTableComponent, NoopTranslateModule],
            providers: [
                IdpVerificationService,
                { provide: ActionHistoryService, useValue: mockActionHistoryService },
                provideMockStore({
                    initialState: fieldVerificationRootState,
                    selectors: [{ selector: documentFieldFeatureSelector, value: fieldVerificationRootState.fields }],
                }),
            ],
        });

        store = TestBed.inject(MockStore);
        fixture = TestBed.createComponent(ExtractionTableComponent);
        idpVerificationService = TestBed.inject(IdpVerificationService);

        store.overrideSelector(selectActiveTable, mockTable);

        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    function findFieldInputDebugElement(field: IdpField) {
        return fixture.debugElement.query(By.css(`input[id=${CSS.escape(field.id)}]`));
    }

    function getFieldValue(field: IdpField) {
        const fieldInput = findFieldInputDebugElement(field)?.nativeElement;
        return fieldInput.value as string | undefined;
    }

    function simulateFieldInput(input: HTMLInputElement, value: string) {
        input.dispatchEvent(new Event('focus'));
        input.value = value;
        input.dispatchEvent(new Event('input'));
        input.dispatchEvent(new Event('focusout'));
    }

    function updateTableField(field: IdpField, value: string) {
        const fieldInput = findFieldInputDebugElement(field)?.nativeElement;
        simulateFieldInput(fieldInput, value);
    }

    it('should emit fieldValuePending event when a table field gets focus', async () => {
        spyOn(component.fieldValuePending, 'emit');

        fixture.detectChanges();
        await fixture.whenStable();

        const tableField1 = mockTable.rows[0].rowCells[0];
        const fieldInput = findFieldInputDebugElement(tableField1)?.nativeElement;

        fieldInput.dispatchEvent(new Event('focus'));
        fixture.detectChanges();

        expect(component.fieldValuePending.emit).toHaveBeenCalledWith({ field: tableField1, pendingValue: tableField1.value ?? '' });
    });

    it('should focus the first cell after view initialization', async () => {
        const firstInput = component.metadataTableInputs.first?.nativeElement;
        spyOn(firstInput, 'focus');
        fixture.detectChanges();
        component.ngAfterViewInit();

        await fixture.whenStable();
        expect(firstInput?.focus).toHaveBeenCalled();
    });

    it('should call VerificationService updateField on field input', () => {
        spyOn(idpVerificationService, 'updateField').and.callThrough();

        const tableField1 = mockTable.rows[0].rowCells[0];
        updateTableField(tableField1, updatedFieldValue);
        fixture.detectChanges();
        const fieldValue = getFieldValue(tableField1);
        expect(fieldValue).toBe(updatedFieldValue);
    });

    it('should call VerificationService.updateField on field input', () => {
        spyOn(idpVerificationService, 'updateField').and.callThrough();

        const tableField1 = mockTable.rows[0].rowCells[0];
        updateTableField(tableField1, updatedFieldValue);
        fixture.detectChanges();
        const fieldValue = getFieldValue(tableField1);
        expect(fieldValue).toBe(updatedFieldValue);
    });

    it('should return correct field status', () => {
        const fieldWithIssue: IdpField = { hasIssue: true } as IdpField;
        const fieldResolved: IdpField = { verificationStatus: 'ManualValid' } as IdpField;
        const fieldDefault: IdpField = {} as IdpField;

        expect(component.getFieldStatus(fieldWithIssue)).toBe('hasIssue');
        expect(component.getFieldStatus(fieldResolved)).toBe('issueResolved');
        expect(component.getFieldStatus(fieldDefault)).toBe('');
    });

    it('should navigate to the next row on PageDown key press', () => {
        const event = new KeyboardEvent('keydown', { key: 'PageDown' });
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');

        const firstRowFirstCell = mockTable.rows[0].rowCells[0];
        const secondRowFirstCell = mockTable.rows[1].rowCells[0];

        const firstInput = findFieldInputDebugElement(firstRowFirstCell)?.nativeElement;
        const secondInput = findFieldInputDebugElement(secondRowFirstCell)?.nativeElement;

        spyOn(firstInput, 'focus');
        spyOn(secondInput, 'focus');

        Object.defineProperty(event, 'target', { value: firstInput });

        const mockField: IdpField = { id: 'mockId' } as IdpField; // Replace with a valid IdpField object
        component.onKeydown(mockField, event);

        expect(secondInput.focus).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should navigate to the previous row on PageUp key press', () => {
        const event = new KeyboardEvent('keydown', { key: 'PageUp' });
        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');

        const secondRowFirstCell = mockTable.rows[1].rowCells[0];
        const firstRowFirstCell = mockTable.rows[0].rowCells[0];

        const secondInput = findFieldInputDebugElement(secondRowFirstCell)?.nativeElement;
        const firstInput = findFieldInputDebugElement(firstRowFirstCell)?.nativeElement;

        spyOn(secondInput, 'focus');
        spyOn(firstInput, 'focus');

        Object.defineProperty(event, 'target', { value: secondInput });

        const mockField: IdpField = { id: 'mockId' } as IdpField; // Replace with a valid IdpField object
        component.onKeydown(mockField, event);

        expect(firstInput.focus).toHaveBeenCalled();
        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
    });

    it('should track rows correctly', () => {
        const row: IdpTableRowRecord = { rowCells: [{ id: '1' }, { id: '2' }] } as IdpTableRowRecord;
        expect(component.trackRow(0, row)).toBe('1,2');
    });

    it('should track column names correctly', () => {
        expect(component.trackColumnName(0, 'column')).toBe(0);
    });

    it('should emit closeTable event when onCloseTable is called', () => {
        spyOn(component.closeTable, 'emit');
        component.onCloseTable();
        expect(component.closeTable.emit).toHaveBeenCalled();
    });

    it('should call verificationService.updateField if value unchanged in onFieldFocusOut', () => {
        const field: IdpField = { id: '1', value: 'A1' } as IdpField;
        spyOn(idpVerificationService, 'updateField');
        component.onFieldFocusOut(field, 'A1');
        expect(idpVerificationService.updateField).toHaveBeenCalledWith(field);
    });

    it('should call history.do if value changed in onFieldFocusOut', () => {
        const field: IdpField = { id: '1', value: 'A1' } as IdpField;
        component.onFieldFocusOut(field, 'A2');
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call verificationService.selectField and emit fieldValuePending on onFieldFocus', () => {
        const field: IdpField = { id: '1', value: 'A1' } as IdpField;
        spyOn(idpVerificationService, 'selectField');
        spyOn(component.fieldValuePending, 'emit');
        component.onFieldFocus(field);
        expect(idpVerificationService.selectField).toHaveBeenCalledWith(field);
        expect(component.fieldValuePending.emit).toHaveBeenCalledWith({ field, pendingValue: 'A1' });
    });

    it('should reset group selections', () => {
        component.selectedRowIndex = 1;
        component.selectedColumnIndex = 1;
        component.tableSelected = true;
        component.singleCellFocus = true;
        component.resetGroupSelections();
        expect(component.selectedRowIndex).toBe(-1);
        expect(component.selectedColumnIndex).toBe(-1);
        expect(component.tableSelected).toBe(false);
        expect(component.singleCellFocus).toBe(false);
    });

    it('should call history.do in onClearColumn', () => {
        component['currentTableId'] = 'table1';
        spyOn(idpVerificationService, 'getTableById$').and.returnValue({
            pipe: () => ({
                subscribe: (cb: any) => cb(mockTable),
            }),
        } as any);
        component.onClearColumn(0);
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call history.do in onDeleteTable', () => {
        component['currentTableId'] = 'table1';
        spyOn(idpVerificationService, 'getTableById$').and.returnValue({
            pipe: () => ({
                subscribe: (cb: any) => cb(mockTable),
            }),
        } as any);
        component.onDeleteTable();
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call history.do for insertRowAbove in onRowAction', () => {
        component.selectedRowIndex = 0;
        component.onRowAction('insertRowAbove');
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call history.do for insertRowBelow in onRowAction', () => {
        component.selectedRowIndex = 0;
        component.onRowAction('insertRowBelow');
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call history.do for clearRow in onRowAction', () => {
        component.selectedRowIndex = 0;
        component['currentTableId'] = 'table1';
        spyOn(idpVerificationService, 'getTableById$').and.returnValue({
            pipe: () => ({
                subscribe: (cb: any) => cb(mockTable),
            }),
        } as any);
        component.onRowAction('clearRow');
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call history.do for deleteRow in onRowAction', () => {
        component.selectedRowIndex = 0;
        component['currentTableId'] = 'table1';
        spyOn(idpVerificationService, 'getTableById$').and.returnValue({
            pipe: () => ({
                subscribe: (cb: any) => cb(mockTable),
            }),
        } as any);
        component.onRowAction('deleteRow');
        expect(component['history'].do).toHaveBeenCalled();
    });

    it('should call selectTable and set tableSelected to true on onTableMenuLeftClick', () => {
        const event = new MouseEvent('click');
        spyOn(event, 'preventDefault');
        spyOn<any>(component, 'selectTable').and.callThrough();
        component.onTableMenuLeftClick(event);
        expect((component as any).selectTable).toHaveBeenCalledWith(event);
    });

    it('should call selectTable and open menu on onTableMenuRightClick', () => {
        const event = new MouseEvent('contextmenu');
        const menuTrigger = { openMenu: jasmine.createSpy('openMenu') } as any;
        spyOn(event, 'preventDefault');
        spyOn<any>(component, 'selectTable').and.callThrough();
        component.onTableMenuRightClick(event, menuTrigger);
        expect((component as any).selectTable).toHaveBeenCalledWith(event);
        expect(menuTrigger.openMenu).toHaveBeenCalled();
    });

    it('should call selectRow and set selectedRowIndex on onRowMenuLeftClick', () => {
        const event = new MouseEvent('click');
        spyOn(event, 'preventDefault');
        spyOn<any>(component, 'selectRow').and.callThrough();
        component.onRowMenuLeftClick(event, 1);
        expect((component as any).selectRow).toHaveBeenCalledWith(1, event);
    });

    it('should call selectRow and open menu on onRowMenuRightClick', () => {
        const event = new MouseEvent('contextmenu');
        const menuTrigger = { openMenu: jasmine.createSpy('openMenu') } as any;
        spyOn(event, 'preventDefault');
        spyOn<any>(component, 'selectRow').and.callThrough();
        component.onRowMenuRightClick(event, menuTrigger, 1);
        expect((component as any).selectRow).toHaveBeenCalledWith(1, event);
        expect(menuTrigger.openMenu).toHaveBeenCalled();
    });

    it('should call selectColumn and set selectedColumnIndex on onColumnMenuLeftClick', () => {
        const event = new MouseEvent('click');
        spyOn(event, 'preventDefault');
        spyOn<any>(component, 'selectColumn').and.callThrough();
        component.onColumnMenuLeftClick(event, 1);
        expect((component as any).selectColumn).toHaveBeenCalledWith(1, event);
    });

    it('should call selectColumn and open menu on onColumnMenuRightClick', () => {
        const event = new MouseEvent('contextmenu');
        const menuTrigger = { openMenu: jasmine.createSpy('openMenu') } as any;
        spyOn(event, 'preventDefault');
        spyOn<any>(component, 'selectColumn').and.callThrough();
        component.onColumnMenuRightClick(event, menuTrigger, 1);
        expect((component as any).selectColumn).toHaveBeenCalledWith(1, event);
        expect(menuTrigger.openMenu).toHaveBeenCalled();
    });
});
