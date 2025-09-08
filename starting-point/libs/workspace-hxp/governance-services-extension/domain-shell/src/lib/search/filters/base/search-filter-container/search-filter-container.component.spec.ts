/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchFilterContainerComponent } from './search-filter-container.component';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { take } from 'rxjs/operators';
import { ReactiveFormsModule } from '@angular/forms';
import { MockSearchFilterData } from '../../../models/search-filter.data.mock';
import { SimpleChange } from '@angular/core';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { HarnessLoader } from '@angular/cdk/testing';
import { SearchFilterHarness } from './search-filter-container-harness';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';

// Mocking HTMLCanvasElement to avoid errors in tests
HTMLCanvasElement.prototype.getContext = jest.fn();

const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

describe('GovernanceSearchFilterContainerComponent', () => {
    let loader: HarnessLoader;
    let component: SearchFilterContainerComponent;
    let fixture: ComponentFixture<SearchFilterContainerComponent>;

    const filterValue = new MockSearchFilterData([{ label: 'Base Filter Value', value: 'base-filter-value' }]);

    const multipleFilterValues = new MockSearchFilterData([
        { label: 'Base Filter Value 1', value: 'base-filter-value-1' },
        { label: 'Base Filter Value 2', value: 'base-filter-value-2' },
        { label: 'Base Filter Value 3', value: 'base-filter-value-3' },
    ]);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NoopTranslateModule, ReactiveFormsModule, SearchFilterContainerComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SearchFilterContainerComponent);
        component = fixture.componentInstance;
        component.name = 'Base Filter';
        fixture.detectChanges();
        await fixture.whenStable();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    afterEach(async () => {
        const filterHarness = await loader.getHarness(SearchFilterHarness);
        if (await filterHarness?.isOpen()) {
            const clearFilterButton = await filterHarness.getClearButton();
            await clearFilterButton?.click();
            fixture.detectChanges();
            await fixture.whenStable();
        }
    });

    it('should display base filter information', async () => {
        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const label = await filterHarness.getLabel();
        const expandIcon = await filterHarness.getExpandIcon();
        const iconHost = await expandIcon?.host();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter');
        expect(expandIcon).toBeTruthy();
        expect(await iconHost?.text()).toBe('expand_more');
        expect(await filterHarness.isOpen()).toBeFalsy();
    });

    it('should open the filter overlay', async () => {
        const filterHarness = await loader.getHarness(SearchFilterHarness);
        await filterHarness.open();

        const applyFilterButton = await filterHarness.getApplyButton();
        const clearFilterButton = await filterHarness.getClearButton();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(applyFilterButton).toBeTruthy();
        expect(clearFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();
        expect(await clearFilterButton?.isDisabled()).toBeTruthy();
    });

    it('should display data if value is defined', async () => {
        component.selectedValue = filterValue;
        component.applyChanges();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter: Base Filter Value');
    });

    it('should clear the filter', async () => {
        component.selectedValue = filterValue;
        component.applyChanges();
        fixture.detectChanges();
        await fixture.whenStable();

        const filterCleared$ = component.filterCleared.pipe(take(1)).toPromise();

        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(await filterHarness.isOpen()).toBeFalsy();
        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter: Base Filter Value');

        await filterHarness.open();
        fixture.detectChanges();
        expect(await filterHarness.isOpen()).toBeTruthy();

        const clearFilterButton = await filterHarness.getClearButton();
        expect(clearFilterButton).toBeTruthy();
        expect(await clearFilterButton?.isDisabled()).toBeFalsy();
        await clearFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();
        expect(component.data).toBeUndefined();
        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter');
        await filterCleared$;
    });

    it('should apply the filter', async () => {
        const filterApplied$ = component.filterApplied.pipe(take(1)).toPromise();

        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(component.data).toBeUndefined();
        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter');

        await filterHarness.open();
        fixture.detectChanges();

        const applyFilterButton = await filterHarness.getApplyButton();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        component.selectedValue = filterValue;
        component.filterForm.markAsDirty();
        fixture.detectChanges();

        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();
        expect(component.data).toEqual(filterValue);
        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter: Base Filter Value');

        await filterApplied$;
    });

    it("should close overlay without changing filter's applied value", async () => {
        component.selectedValue = filterValue;
        component.applyChanges();
        fixture.detectChanges();

        const overlayClosed$ = component.overlayClosed.pipe(take(1)).toPromise();
        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const label = await filterHarness.getLabel();

        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter: Base Filter Value');

        await filterHarness.open();
        fixture.detectChanges();
        expect(await filterHarness.isOpen()).toBeTruthy();

        const backdrop = await filterHarness.getOverlayBackdrop();
        expect(backdrop).toBeTruthy();
        await backdrop?.dispatchEvent('click');

        await fixture.whenStable();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();
        expect(label).toBeTruthy();
        expect(await label?.text()).toBe('Base Filter: Base Filter Value');
        expect(component.data).toEqual(filterValue);

        await overlayClosed$;
    });

    it('should not display badge for single selection', async () => {
        component.selectedValue = filterValue;
        component.applyChanges();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const badge = await filterHarness.getBadge();
        expect(badge).toBeFalsy();
    });

    it('should display badge for multiple selection', async () => {
        component.selectedValue = multipleFilterValues;
        component.applyChanges();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(SearchFilterHarness);
        const badge = await filterHarness.getBadge();
        expect(badge).toBeTruthy();
        expect(await badge?.text()).toBe('+2');
    });

    it('should mark form as dirty if selection changed', async () => {
        expect(component.filterForm.dirty).toBe(false);
        component.selectedValue = multipleFilterValues;
        component.ngOnChanges({
            selectedValue: new SimpleChange(null, multipleFilterValues, true),
        });
        expect(component.filterForm.dirty).toBe(true);
        component.applyChanges();
        expect(component.filterForm.dirty).toBe(false);
    });

    it('should pass accessibility checks', async () => {
        component.selectedValue = filterValue;
        component.applyChanges();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(SearchFilterHarness);
        await filterHarness.open();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const res = await a11yReport('.hxp-governance-search-filter-overlay');

        expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
    });
});
