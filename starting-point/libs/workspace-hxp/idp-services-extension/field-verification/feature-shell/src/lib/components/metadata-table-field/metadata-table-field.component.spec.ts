/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetadataTableFieldComponent } from './metadata-table-field.component';
import { IdpVerificationService } from '../../services/verification/verification.service';
import { of } from 'rxjs';
import { ActionHistoryService } from '../../services/action-history.service';

describe('MetadataTableFieldComponent', () => {
    let component: MetadataTableFieldComponent;
    let fixture: ComponentFixture<MetadataTableFieldComponent>;
    let mockVerificationService: jasmine.SpyObj<IdpVerificationService>;
    let mockActionHistoryService: jasmine.SpyObj<ActionHistoryService>;

    beforeEach(async () => {
        mockVerificationService = jasmine.createSpyObj('IdpVerificationService', ['getTableById$', 'selectField', 'addTableRow']);
        mockVerificationService.getTableById$.and.returnValue(of(undefined));

        mockActionHistoryService = jasmine.createSpyObj('ActionHistoryService', ['canUndo', 'undo', 'canRedo', 'redo', 'do']);

        await TestBed.configureTestingModule({
            imports: [MetadataTableFieldComponent],
            providers: [
                { provide: IdpVerificationService, useValue: mockVerificationService },
                { provide: ActionHistoryService, useValue: mockActionHistoryService },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(MetadataTableFieldComponent);
        component = fixture.componentInstance;
    });

    it('should call history.do with correct do/undo actions when addTable is called', (done) => {
        const tableId = 'test-table-id';
        const addTableRowSpy = jasmine.createSpy('addTableRow');
        const deleteTableRowSpy = jasmine.createSpy('deleteTableRow');
        const selectNextFieldSpy = jasmine.createSpy('selectNextField');

        // Patch the verificationService with additional spies for deleteTableRow/selectNextField
        (component as any).verificationService.addTableRow = addTableRowSpy;
        (component as any).verificationService.deleteTableRow = deleteTableRowSpy;
        (component as any).verificationService.selectNextField = selectNextFieldSpy;

        // Capture the object passed to history.do
        let doUndoObj: any;
        mockActionHistoryService.do.and.callFake((obj: any) => {
            doUndoObj = obj;
        });

        component.addTable(tableId);

        expect(mockActionHistoryService.do).toHaveBeenCalled();
        expect(typeof doUndoObj.do).toBe('function');
        expect(typeof doUndoObj.undo).toBe('function');

        // Test the 'do' function
        doUndoObj.do();
        expect(addTableRowSpy).toHaveBeenCalledWith(tableId, 0);

        // setTimeout is used in the implementation, so we need to wait for it
        setTimeout(() => {
            // Test the 'undo' function
            doUndoObj.undo();
            expect(deleteTableRowSpy).toHaveBeenCalledWith(tableId, 0);

            setTimeout(() => {
                expect(selectNextFieldSpy).toHaveBeenCalled();
                done();
            }, 0);
        }, 0);
    });
});
