/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecordNameSearchFilterComponent } from './record-name-search-filter.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { EventEmitter } from '@angular/core';
import { RecordNameSearchFilterData } from './record-name-search-filter.data';

describe('RecordNameSearchFilterComponent', () => {
    let component: RecordNameSearchFilterComponent;
    let fixture: ComponentFixture<RecordNameSearchFilterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RecordNameSearchFilterComponent, NoopAnimationsModule, NoopTranslateModule],
        }).compileComponents();

        fixture = TestBed.createComponent(RecordNameSearchFilterComponent);
        component = fixture.componentInstance;
        (component as any).clearForm = jest.fn();
        component.clearChanges = jest.fn();
        jest.spyOn(component, 'clearForm');
        component['oldFormValue'] = { ['selectedRecordName']: [] };
        component['searchFilterContainer'] = { clearChanges: jest.fn() } as any;
        fixture.detectChanges();
    });

    it('should clear filter when clearFilter is called', () => {
        component.inputValue = 'test';
        component.selectedValue = { values: [{ label: 'test', value: 'test' }] } as any;
        const filterClearedSpy = jest.fn();
        component.filterCleared = new EventEmitter<void>();
        component.filterCleared.subscribe(filterClearedSpy);

        component.clearFilter();

        expect(component.inputValue).toBe('');
        expect(component.clearChanges).toHaveBeenCalled();
        expect(filterClearedSpy).toHaveBeenCalled();
    });

    it('should update input and set selectedValue when valid input is provided', () => {
        const validInput = 'test-record-name';
        const fakeEvent = { target: { value: validInput } } as unknown as Event;
        (component as any).onInputChange(fakeEvent);

        expect(component.inputValue).toBe(validInput);
        if (component.selectedValue) {
            expect(component.selectedValue.values[0]).toEqual({
                label: validInput,
                value: validInput,
            });
        }
    });

    it('should reset state and discard pending changes when overlay is closed', () => {
        component['discardPendingChanges'] = jest.fn();
        (component as any).overlayClosed();
        expect(component.selectedValue).toBeUndefined();
        expect(component.inputValue).toBe('');
        expect(component['oldFormValue']).toEqual({ selectedRecordName: [] });
        expect(component['discardPendingChanges']).toHaveBeenCalled();
    });

    it('should return correct query param when data values exist', () => {
        const testData = new RecordNameSearchFilterData([{ label: 'test', value: 'test' }]);
        const queryParam = component.toQueryParams(testData);
        expect(queryParam).toStrictEqual({ fileName: 'test' });
    });

    it('should return empty string when no values exist', () => {
        const testData = new RecordNameSearchFilterData([]);
        const queryParam = component.toQueryParams(testData);
        expect(queryParam).toStrictEqual({});
    });
});
