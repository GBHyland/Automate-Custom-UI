/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBoxComponent } from './search-box.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('SearchBoxComponent', () => {
    let component: SearchBoxComponent;
    let fixture: ComponentFixture<SearchBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SearchBoxComponent, FormsModule, MatFormFieldModule, MatInputModule, MatIconModule, NoopAnimationsModule, NoopTranslateModule],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should emit inputChange on input change', () => {
        const spy = jest.spyOn(component.inputChange, 'emit');
        component.searchText = 'hello';
        component.onInputChange();
        expect(spy).toHaveBeenCalledWith('hello');
    });

    it('should emit inputChange with empty string when cleared', () => {
        component.searchText = 'some text';
        const spy = jest.spyOn(component.inputChange, 'emit');
        component.clearSearch();
        expect(component.searchText).toBe('');
        expect(spy).toHaveBeenCalledWith('');
    });

    it('should emit search event on search icon click', () => {
        component.searchText = '  test  ';
        const spy = jest.spyOn(component.search, 'emit');
        component.onSearchClick();
        expect(spy).toHaveBeenCalledWith('test');
    });

    it('should emit search on Enter key', () => {
        component.searchText = 'EnterTest';
        const spy = jest.spyOn(component.search, 'emit');
        const event = new KeyboardEvent('keydown', { key: 'Enter' });
        component.onKeyDown(event);
        expect(spy).toHaveBeenCalledWith('EnterTest');
    });

    it('should clear input on Escape key and stop propagation', () => {
        component.searchText = 'EscapeTest';
        const spyClear = jest.spyOn(component, 'clearSearch');
        const spyStop = jest.fn();
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        Object.defineProperty(event, 'stopPropagation', { value: spyStop });

        component.onKeyDown(event);
        expect(spyClear).toHaveBeenCalled();
        expect(spyStop).toHaveBeenCalled();
    });

    it('should set placeholder from input', () => {
        component.placeholder = 'Search something...';
        fixture.detectChanges();

        const inputEl = fixture.debugElement.query(By.css('input')).nativeElement as HTMLInputElement;
        expect(inputEl.placeholder).toBe('Search something...');
    });
});
