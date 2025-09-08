/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { asapScheduler } from 'rxjs';
import { FilterableSelectionListComponent, FilterableSelectionListItem } from './filterable-selection-list.component';

describe('FilterableSelectionListComponent', () => {
    let component: FilterableSelectionListComponent<any>;
    let fixture: ComponentFixture<FilterableSelectionListComponent<any>>;
    let element: HTMLElement;

    const mockItems: FilterableSelectionListItem<any>[] = [
        { item: { value: 'item value 1' }, id: '1', name: 'Test 1' },
        { item: { value: 'item value 2' }, id: '2', name: 'Test 2' },
        { item: { value: 'item value 3' }, id: '3', name: 'Test 3' },
    ];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatFormFieldModule, MatIconModule, MatInputModule, MatListModule, NoopTranslateModule, NoopAnimationsModule],
        });

        fixture = TestBed.createComponent(FilterableSelectionListComponent);
        component = fixture.componentInstance;
        element = fixture.debugElement.nativeElement;
        fixture.detectChanges();

        component.items = mockItems;
    });

    it('should initialize all items correctly', () => {
        const allItemsSetSpy = spyOn(component.allItemsSubject$, 'next');

        component.items = mockItems;

        expect(allItemsSetSpy).toHaveBeenCalled();
    });

    it('should set active item to first item when selected item id is not provided', fakeAsync(() => {
        component.selectedItemId = undefined;
        fixture.detectChanges();
        component.ngAfterViewInit();

        let resultActiveItem: any | undefined;
        component.activeItem$.subscribe((activeItem) => (resultActiveItem = activeItem));

        asapScheduler.flush();
        flush();

        expect(resultActiveItem.data).toEqual(mockItems[0]);
    }));

    it('should set active item correctly when selected item id is provided', fakeAsync(() => {
        component.selectedItemId = '3';
        fixture.detectChanges();
        component.ngAfterViewInit();

        let resultActiveItem: any | undefined;
        component.activeItem$.subscribe((activeItem) => (resultActiveItem = activeItem));

        asapScheduler.flush();
        flush();

        expect(resultActiveItem.data).toEqual(mockItems[2]);
    }));

    it('should update all items correctly when items are set', () => {
        const setItemsSpy = spyOn(component.allItemsSubject$, 'next');

        component.items = [mockItems[0], mockItems[1]];

        expect(setItemsSpy).toHaveBeenCalled();
    });

    it('should emit activeItemChanged when active item changes', () => {
        spyOn(component.activeItemChanged, 'emit');

        component.selectionChange$.next({ data: mockItems[1], displayName: `2 - ${mockItems[1].name}` });
        component.selectionChange$.next({ data: mockItems[0], displayName: `1 - ${mockItems[0].name}` });
        component.selectionChange$.next({ data: mockItems[0], displayName: `1 - ${mockItems[0].name}` });
        component.selectionChange$.next({ data: mockItems[2], displayName: `3 - ${mockItems[2].name}` });

        expect(component.activeItemChanged.emit).toHaveBeenCalledTimes(3);
        expect(component.activeItemChanged.emit).toHaveBeenCalledWith(mockItems[1].item);
        expect(component.activeItemChanged.emit).toHaveBeenCalledWith(mockItems[0].item);
        expect(component.activeItemChanged.emit).toHaveBeenCalledWith(mockItems[2].item);
    });

    it('should return from handleKeyboardEvent immediately if key is held down', () => {
        const event = new KeyboardEvent('keydown', { key: 'Enter', repeat: true });

        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');

        component.handleKeyboardEvent(event);

        expect(event.preventDefault).not.toHaveBeenCalled();
        expect(event.stopPropagation).not.toHaveBeenCalled();
    });

    it('should return from handleKeyboardEvent immediately if defaultPrevented', fakeAsync(() => {
        const event = new KeyboardEvent('keydown', { key: 'Home', cancelable: true });

        const inputElement = element.querySelector('input') as HTMLInputElement;

        spyOn(event, 'preventDefault').and.callThrough();
        spyOn(event, 'stopPropagation');

        event.preventDefault();
        inputElement.dispatchEvent(event);
        fixture.detectChanges();
        flush();

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(event.stopPropagation).not.toHaveBeenCalled();
    }));

    it('should return from handleKeyboardEvent immediately if key is repeat', fakeAsync(() => {
        const event = new KeyboardEvent('keydown', { key: 'Home', repeat: true });

        const inputElement = element.querySelector('input') as HTMLInputElement;

        spyOn(event, 'stopPropagation');

        inputElement.dispatchEvent(event);
        fixture.detectChanges();
        flush();

        expect(event.stopPropagation).not.toHaveBeenCalled();
    }));

    it('should keep focus on target if ArrowUp pressed', fakeAsync(() => {
        shouldKeepFocusIfKeyIsPressed('ArrowUp');
    }));

    it('should keep focus on target if ArrowDown pressed', fakeAsync(() => {
        shouldKeepFocusIfKeyIsPressed('ArrowDown');
    }));

    it('should keep focus on target if Home pressed', fakeAsync(() => {
        shouldKeepFocusIfKeyIsPressed('Home');
    }));

    it('should keep focus on target if End pressed', fakeAsync(() => {
        shouldKeepFocusIfKeyIsPressed('End');
    }));

    it('should show all options', fakeAsync(() => {
        const expectedAllItems = mockItems.map((item, index) => ({ data: item, displayName: `${index + 1} - ${item.name}` }));

        let resultAllItems: any[] = [];

        component.filteredItems$.subscribe((items) => (resultAllItems = items));

        flush();

        expect(resultAllItems).toEqual(expectedAllItems);
    }));

    it('should search items by serial number', fakeAsync(() => {
        const inputElement = element.querySelector('input') as HTMLInputElement;
        inputElement.value = '2';

        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        flush();

        component.filteredItems$.subscribe((items) => {
            expect(items.length).toBe(1);
            expect(items).toEqual(jasmine.arrayContaining([jasmine.objectContaining({ displayName: '2 - Test 2' })]));
        });
    }));

    it('should search items by name', fakeAsync(() => {
        const inputElement = element.querySelector('input') as HTMLInputElement;
        inputElement.value = 'Test 1';

        inputElement.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        flush();

        component.filteredItems$.subscribe((items) => {
            expect(items.length).toBe(1);
            expect(items).toEqual(jasmine.arrayContaining([jasmine.objectContaining({ displayName: '1 - Test 1' })]));
        });
    }));

    const shouldKeepFocusIfKeyIsPressed = (key: string) => {
        const event = new KeyboardEvent('keydown', { key: key });
        const inputElement = element.querySelector('input') as HTMLInputElement;

        spyOn(event, 'preventDefault');
        spyOn(event, 'stopPropagation');

        inputElement.dispatchEvent(event);
        fixture.detectChanges();
        asapScheduler.flush();
        flush();

        expect(event.preventDefault).toHaveBeenCalled();
        expect(event.stopPropagation).toHaveBeenCalled();
        expect(event.target).toBeInstanceOf(HTMLElement);
        expect(document.activeElement).toEqual(event.target);
    };
});
