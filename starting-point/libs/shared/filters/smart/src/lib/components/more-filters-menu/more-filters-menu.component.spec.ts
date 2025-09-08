/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { MoreFiltersMenuComponent } from './more-filters-menu.component';
import { DateFilter, FilterService } from '@alfresco-dbp/shared-filters-services';
import { getAllFiltersMock, getDateFilterMock, getProcessStringFilterMock } from '../../mock/filters.mock';
import { InputHarnessUtils, ButtonHarnessUtils, CheckboxHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';

describe('MoreFiltersMenuComponent', () => {
    let component: MoreFiltersMenuComponent;
    let fixture: ComponentFixture<MoreFiltersMenuComponent>;
    let filterService: FilterService;

    const setSearchInputValue = async (value: string) => {
        const searchInput = await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: `[data-automation-id="hxp-more-filters-menu-search-input"]`,
            },
        });
        await searchInput.setValue(value);
    };

    const getAllCheckboxes = async (): Promise<MatCheckboxHarness[]> => {
        return CheckboxHarnessUtils.getAllCheckboxes({
            fixture,
            checkboxFilters: {
                ancestor: `[data-automation-id="hxp-more-filters-menu-list-item"]`,
            },
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, NoopAnimationsModule, NoopTranslateModule, MoreFiltersMenuComponent],
            providers: [FilterService],
        });

        filterService = TestBed.inject(FilterService);
        fixture = TestBed.createComponent(MoreFiltersMenuComponent);
        component = fixture.componentInstance;

        filterService.setFilters(getAllFiltersMock());
    });

    it('should set filters and form controls on init', async () => {
        fixture.detectChanges();

        getAllFiltersMock().forEach((filter) => {
            expect(component.filters).toContain(filter);
            expect(component.filterVisibilitiesForm.contains(filter.name)).toBeTrue();
            expect(component.filterVisibilitiesForm.get(filter.name)?.value).toBe(filter.visible);
        });
    });

    it('should filter filters by search input', async () => {
        fixture.detectChanges();
        await setSearchInputValue('mockR');

        const filtersThatContainSearchTerm = getAllFiltersMock().filter((filter) => filter.name.includes('mockR'));
        let checkboxes = await getAllCheckboxes();
        expect(checkboxes.length).toBe(filtersThatContainSearchTerm.length);

        await setSearchInputValue('');

        checkboxes = await getAllCheckboxes();
        expect(checkboxes.length).toBe(checkboxes.length);
    });

    it('should set all filter visibilities to false on clear selection', async () => {
        fixture.detectChanges();
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: `[data-automation-id="hxp-more-filters-menu-clear-selection-button"]`,
            },
        });

        const checkboxes = await getAllCheckboxes();
        for (const checkbox of checkboxes) {
            expect(await checkbox.isChecked()).toBeFalse();
        }
    });

    it('should update filters with changed visibilities and emit filtersVisibilityUpdate on update', async () => {
        fixture.detectChanges();
        const testFilter = getDateFilterMock();
        const updateFilterSpy = spyOn(filterService, 'updateFilter');
        const filtersVisibilityUpdateSpy = spyOn(component.filtersVisibilityUpdate, 'emit');

        await CheckboxHarnessUtils.checkboxUncheck({
            fixture,
            checkboxFilters: {
                selector: `[data-automation-id="hxp-more-filters-menu-checkbox-${testFilter.name}"]`,
            },
        });
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: `[data-automation-id="hxp-more-filters-menu-update-button"]`,
            },
        });

        const expectedDateFilter = new DateFilter({
            name: testFilter.name,
            translationKey: testFilter.translationKey,
            value: testFilter.value,
            options: testFilter.options,
            visible: false,
        });
        expectedDateFilter.label = testFilter.label;

        expect(updateFilterSpy).toHaveBeenCalledWith(expectedDateFilter);
        expect(updateFilterSpy).toHaveBeenCalledTimes(1);
        expect(filtersVisibilityUpdateSpy).toHaveBeenCalledWith(component.filters);
    });

    it('should show filter description', async () => {
        fixture.detectChanges();
        const processFilter = getProcessStringFilterMock();
        const stringProcess = await CheckboxHarnessUtils.getCheckbox({
            fixture,
            checkboxFilters: {
                selector: `[data-automation-id="hxp-more-filters-menu-checkbox-${processFilter.name}"]`,
            },
        });

        const checkboxName = await stringProcess.getLabelText();

        expect(checkboxName).toBe('mockProcessString mockProcessStringDescription');
    });
});
