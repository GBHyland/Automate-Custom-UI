/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ContentIdSearchFilterComponent } from './content-id-search-filter.component';
import { EventEmitter } from '@angular/core';
import { ContentIdSearchFilterData } from './content-id-search-filter.data';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('ContentIdSearchFilterComponent', () => {
    let component: ContentIdSearchFilterComponent;
    let fixture: ComponentFixture<ContentIdSearchFilterComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ContentIdSearchFilterComponent, NoopAnimationsModule, NoopTranslateModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ContentIdSearchFilterComponent);
        component = fixture.componentInstance;
        (component as any).clearForm = jest.fn();
        component.clearChanges = jest.fn();
        jest.spyOn(component, 'clearForm');
        component['oldFormValue'] = { ['selectedContentId']: [] };
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

    it('should not update input when invalid input is provided ', () => {
        const fakeEvent = { target: { value: 'test' } } as unknown as Event;
        (component as any).onInputChange(fakeEvent);

        expect(component.selectedValue).toBeUndefined();
    });

    it('should update input and set selectedValue when valid input is provided', () => {
        const validInput = '245ecdf6-ead4-446b-8f9e-cf131ce3d951';
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
        expect(component['oldFormValue']).toEqual({ selectedContentId: [] });
        expect(component['discardPendingChanges']).toHaveBeenCalled();
    });

    it('should return correct query param when data values exist', () => {
        const testData = new ContentIdSearchFilterData([{ label: 'test', value: 'test' }]);
        const queryParam = component.toQueryParams(testData);
        expect(queryParam).toStrictEqual({ contentId: 'test' });
    });

    it('should return empty string when no values exist', () => {
        const testData = new ContentIdSearchFilterData([]);
        const queryParam = component.toQueryParams(testData);
        expect(queryParam).toStrictEqual({});
    });
});
