/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchTermFilterComponent } from './search-term-filter.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { InputHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { SearchTermFilterData } from './search-term-filter.data';
import { take } from 'rxjs/operators';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { SearchType } from '@alfresco/adf-hx-content-services/services';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';

describe('SearchTermFilterComponent', () => {
    let component: SearchTermFilterComponent;
    let fixture: ComponentFixture<SearchTermFilterComponent>;

    const getSearchInput = async () => {
        return InputHarnessUtils.getInput({ fixture, inputFilters: { selector: 'textarea' } });
    };

    const getClearButton = () => {
        return fixture.debugElement.query(By.css('.hxp-clear'));
    };

    const simulateInput = async (lines: string[], textarea: HTMLTextAreaElement) => {
        textarea.value = lines.join('\n');
        textarea.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        await fixture.whenStable();
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, SearchTermFilterComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchTermFilterComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it('should clear input on button clicked', async () => {
        let filterValue: SearchTermFilterData = component.value as SearchTermFilterData;

        expect(filterValue).toBeFalsy();
        expect(getClearButton()).toBeNull();

        component.populateWith(new SearchTermFilterData([{ label: 'Search term', type: SearchType.BASIC, term: 'query' }]));
        fixture.detectChanges();

        filterValue = component.value as SearchTermFilterData;

        expect(filterValue).toBeTruthy();
        expect(filterValue.values.length).toBe(1);
        expect(filterValue.values[0].term).toBe('query');
        expect(getClearButton()).toBeTruthy();

        getClearButton().nativeElement.click();
        fixture.detectChanges();

        filterValue = component.value as SearchTermFilterData;

        expect(filterValue).toBeFalsy();
        expect(getClearButton()).toBeNull();
    });

    it('should emit search term changed on text input', async () => {
        let filterValue: SearchTermFilterData = component.value as SearchTermFilterData;

        expect(filterValue).toBeFalsy();
        expect(getClearButton()).toBeNull();

        const searchTermChanged = component.searchTermChanged.pipe(take(6)).toPromise();
        const textarea = await getSearchInput();

        expect(textarea).toBeTruthy();

        await textarea.setValue('query');
        fixture.detectChanges();

        const searchTerm = await searchTermChanged;

        expect(searchTerm).toBe('query');

        filterValue = component.value as SearchTermFilterData;

        expect(filterValue).toBeTruthy();
        expect(filterValue.values.length).toBe(1);
        expect(filterValue.values[0].term).toBe('query');
        expect(getClearButton()).toBeTruthy();
    });

    it('should emit search term changed on clear', async () => {
        let filterValue: SearchTermFilterData = component.value as SearchTermFilterData;

        expect(filterValue).toBeFalsy();
        expect(getClearButton()).toBeNull();

        component.populateWith(new SearchTermFilterData([{ label: 'Search term', type: SearchType.BASIC, term: 'query' }]));
        fixture.detectChanges();
        const searchTermChanged = component.searchTermChanged.pipe(take(1)).toPromise();

        expect(getClearButton()).not.toBeNull();

        getClearButton().nativeElement.click();
        fixture.detectChanges();

        filterValue = component.value as SearchTermFilterData;

        expect(filterValue).toBeFalsy();
        expect(getClearButton()).toBeNull();

        const searchTerm = await searchTermChanged;

        expect(searchTerm).toBe('');
    });

    it('should emit filterApplied search event on search', async () => {
        const triggerSearch = component.filterApplied.pipe(take(1)).toPromise();
        const textarea = await getSearchInput();

        expect(textarea).toBeTruthy();

        await textarea.setValue('query');
        (await textarea.host()).dispatchEvent('keydown', { key: 'Enter' });
        fixture.detectChanges();

        const filterValue = (await triggerSearch) as SearchTermFilterData;

        expect(filterValue).toBeTruthy();
        expect(filterValue.values.length).toBe(1);
        expect(filterValue.values[0].term).toBe('query');
    });

    it('should resize the textarea', async () => {
        const textareaDE = fixture.debugElement.query(By.css('textarea'));
        const textarea = textareaDE.nativeElement as HTMLTextAreaElement;
        const autosizeDirective = textareaDE.injector.get(CdkTextareaAutosize) as CdkTextareaAutosize;
        const resizeSpy = jest.spyOn(autosizeDirective, 'resizeToFitContent');

        expect(resizeSpy).toHaveBeenCalledTimes(0);

        await simulateInput(['Line 1'], textarea);

        expect(resizeSpy).toHaveBeenCalledTimes(1);

        await simulateInput(['Line 1', 'Line 2', 'Line 3'], textarea);

        expect(resizeSpy).toHaveBeenCalledTimes(2);

        await simulateInput([''], textarea);

        expect(resizeSpy).toHaveBeenCalledTimes(3);
    });
});
