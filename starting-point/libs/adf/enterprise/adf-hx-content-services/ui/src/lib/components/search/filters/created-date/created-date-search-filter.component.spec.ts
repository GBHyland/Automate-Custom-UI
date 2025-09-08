/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CreatedDateOption, CreatedDateSearchFiltersComponent } from './created-date-search-filter.component';
import { DatePipe } from '@angular/common';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { SearchFilterValueService } from '@alfresco/adf-hx-content-services/services';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { DateAdapter, MatNativeDateModule, NativeDateAdapter } from '@angular/material/core';
import { take } from 'rxjs/operators';
import { CreatedDateSearchFilterData } from './created-date-search-filter.data';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CreatedDateSearchFilterHarness } from './created-date-search-filter-harness';
import { MatListOptionHarness } from '@angular/material/list/testing';
import { a11yReport } from '@hxp/workspace-hxp/shared/testing';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';

const generateSelectedValueForDefaultDate = (option: CreatedDateOption) => {
    return new CreatedDateSearchFilterData([option]);
};

const optionHasClass = async (option: MatListOptionHarness, className: string) => {
    return (await option.host()).hasClass(className);
};

describe('CreatedDateSearchFiltersComponent', () => {
    let loader: HarnessLoader;
    let component: CreatedDateSearchFiltersComponent;
    let fixture: ComponentFixture<CreatedDateSearchFiltersComponent>;
    let searchFilterValueService: SearchFilterValueService;
    let dateAdapter: DateAdapter<Date>;

    const today = new Date(2024, 0, 1);

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                MatNativeDateModule,
                NoopTranslateModule,
                SearchFilterContainerComponent,
                CreatedDateSearchFiltersComponent,
            ],
            providers: [DatePipe, { provide: DateAdapter, useClass: NativeDateAdapter }],
        }).compileComponents();

        dateAdapter = TestBed.inject(DateAdapter);
        jest.spyOn(dateAdapter, 'today').mockReturnValue(today);

        searchFilterValueService = TestBed.inject(SearchFilterValueService);
        fixture = TestBed.createComponent(CreatedDateSearchFiltersComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        await fixture.whenStable();

        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    // We need this to ensure the overlay is removed from the DOM
    afterEach(async () => {
        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        if (await filterHarness?.isOpen()) {
            const clearFilterButton = await filterHarness.getClearButton();
            await clearFilterButton?.click();
            fixture.detectChanges();
            await fixture.whenStable();
        }
    });

    it('should display created data filter', async () => {
        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        const chipLabel = await filterHarness.getLabel();

        expect(chipLabel).toBeTruthy();
        expect(await chipLabel?.text()).toBe('SEARCH.FILTERS.CREATED_DATE.LABEL');
    });

    it('should display the created date filter overlay with available options', async () => {
        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const defaultOptions = await filterHarness.getDefaultOptions();
        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        let customDateContainer = await filterHarness.getCustomDateContainer();

        expect(defaultOptions?.length).toBe(4);
        expect(enableCustomDateButton).toBeTruthy();
        expect(customDateContainer).toBeFalsy();

        await enableCustomDateButton.click();
        fixture.detectChanges();
        await fixture.whenStable();
        customDateContainer = await filterHarness.getCustomDateContainer();

        expect(customDateContainer).toBeTruthy();
    });

    it('should select a default created data option', async () => {
        const numberOfDefaultOptions = component.defaultCreatedDateOptions.length;
        expect(numberOfDefaultOptions).toBe(4);

        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);

        for (let i = 0; i < component.defaultCreatedDateOptions.length; i++) {
            await filterHarness.open();

            expect(await filterHarness.isOpen()).toBeTruthy();
            expect(component.selectedValue).toBeFalsy();
            expect(component.value).toBeFalsy();

            const defaultOptions = await filterHarness.getDefaultOptions();

            expect(defaultOptions?.length).toBe(numberOfDefaultOptions);

            const filteredAppliedPromise = searchFilterValueService.filterApplied$.pipe(take(1)).toPromise();

            const option = defaultOptions[i];
            await option.select();
            fixture.detectChanges();

            expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[i]));
            expect(component.value).toBeFalsy();
            expect(await optionHasClass(option, 'hxp-created-date-filter-option_active')).toBe(true);

            const applyFilterButton = await filterHarness.getApplyButton();
            expect(applyFilterButton).toBeTruthy();
            await applyFilterButton?.click();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();

            expect(component.value).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[i]));
            expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[i]));
            expect(component.selectedValue).toEqual(component.value);

            const selectedValue = await filteredAppliedPromise;
            expect(selectedValue?.filter).toEqual(component);
            expect(selectedValue?.value).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[i]));

            component.clearFilter();
        }
    });

    it('should clear the filter', async () => {
        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toBeFalsy();
        expect(component.value).toBeFalsy();

        let defaultOptions = await filterHarness.getDefaultOptions();

        expect(defaultOptions?.length).toBe(4);

        await defaultOptions[0].select();
        fixture.detectChanges();

        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));
        expect(component.value).toBeFalsy();
        expect(await optionHasClass(defaultOptions[0], 'hxp-created-date-filter-option_active')).toBe(true);

        const applyFilterButton = await filterHarness.getApplyButton();
        expect(applyFilterButton).toBeTruthy();
        await applyFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        const filteredResetPromise = searchFilterValueService.filterReset$.pipe(take(1)).toPromise();
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));
        expect(component.value).toBeTruthy();
        expect(component.selectedValue).toEqual(component.value);

        defaultOptions = await filterHarness.getDefaultOptions();

        expect(defaultOptions?.length).toBe(4);
        expect(await optionHasClass(defaultOptions[0], 'hxp-created-date-filter-option_active')).toBe(true);

        const clearFilterButton = await filterHarness.getClearButton();
        expect(clearFilterButton).toBeTruthy();
        await clearFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.value).toBeFalsy();
        expect(component.selectedValue).toBeFalsy();
        expect(component.selectedValue).toEqual(component.value);

        expect(await filteredResetPromise).toEqual(component);
    });

    it('should keep previously selected value when overlay is closed without applying changes', async () => {
        component.selectedValue = generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]);
        fixture.detectChanges();
        component.applyFilter();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));
        expect(component.selectedValue).toEqual(component.value);

        const defaultOptions = await filterHarness.getDefaultOptions();

        expect(defaultOptions?.length).toBe(4);

        await defaultOptions[1].select();
        fixture.detectChanges();

        expect(await optionHasClass(defaultOptions[1], 'hxp-created-date-filter-option_active')).toBe(true);
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[1]));
        expect(component.value).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));

        const backdrop = await filterHarness.getOverlayBackdrop();
        expect(backdrop).toBeTruthy();
        backdrop?.dispatchEvent('click');
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));
        expect(component.selectedValue).toEqual(component.value);
    });

    it("should not clear the filter's value when overlay is closed without applying changes", async () => {
        component.selectedValue = generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]);
        fixture.detectChanges();
        component.applyFilter();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));
        expect(component.value).toBeTruthy();
        expect(component.selectedValue).toEqual(component.value);

        const backdrop = await filterHarness.getOverlayBackdrop();
        expect(backdrop).toBeTruthy();
        backdrop?.dispatchEvent('click');

        await fixture.whenStable();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[0]));
        expect(component.value).toBeTruthy();
        expect(component.selectedValue).toEqual(component.value);
    });

    it('should apply an after custom date', async () => {
        expect(component.selectedValue).toBeUndefined();
        expect(component.value).toBeUndefined();

        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        await enableCustomDateButton.click();
        fixture.detectChanges();

        await filterHarness.openAfterDateCalendar();
        await filterHarness.selectCalendarCell({ text: '9' });
        fixture.detectChanges();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        const expectedValue = [
            {
                label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_TODAY',
                afterDate: new Date('2024-01-09T00:00:00'),
                beforeDate: null,
            },
        ];

        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(expectedValue);
        expect(component.value).toEqual(component.selectedValue);
    });

    it('should apply a before custom date', async () => {
        expect(component.selectedValue).toBeUndefined();
        expect(component.value).toBeUndefined();

        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        await enableCustomDateButton.click();
        fixture.detectChanges();

        await filterHarness.openBeforeDateCalendar();
        await filterHarness.selectCalendarCell({ text: '9' });
        fixture.detectChanges();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        const expectedValue = [
            {
                label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.UNTIL_DATE',
                afterDate: null,
                beforeDate: new Date('2024-01-09T00:00:00'),
            },
        ];
        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(expectedValue);
        expect(component.value).toEqual(component.selectedValue);
    });

    it('should apply a custom range with both after and before dates', async () => {
        expect(component.selectedValue).toBeUndefined();
        expect(component.value).toBeUndefined();

        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        await enableCustomDateButton.click();
        fixture.detectChanges();
        await fixture.whenStable();

        await filterHarness.openAfterDateCalendar();
        await filterHarness.selectCalendarCell({ text: '9' });
        fixture.detectChanges();

        await filterHarness.openBeforeDateCalendar();
        await filterHarness.selectCalendarCell({ text: '10' });
        fixture.detectChanges();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        const expectedValue = [
            {
                label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_DATE',
                afterDate: new Date('2024-01-09T00:00:00'),
                beforeDate: new Date('2024-01-10T00:00:00'),
            },
        ];

        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(expectedValue);
        expect(component.value).toEqual(component.selectedValue);
    });

    it('should populate filter with provided data for default value', async () => {
        const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
        const chipLabel = await filterHarness.getLabel();

        expect(chipLabel).toBeTruthy();
        expect(await chipLabel?.text()).toBe('SEARCH.FILTERS.CREATED_DATE.LABEL');

        expect(component.selectedValue).toBeFalsy();
        expect(component.value).toBeFalsy();

        const numberOfDefaultOptions = component.defaultCreatedDateOptions.length;
        for (let i = 0; i < numberOfDefaultOptions; i++) {
            component.populateWith(new CreatedDateSearchFilterData([component.defaultCreatedDateOptions[i]]));
            fixture.detectChanges();

            expect(component.selectedValue).toBeTruthy();
            expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultCreatedDateOptions[i]));
            expect(component.value).toEqual(component.selectedValue);

            await filterHarness.open();

            expect(await filterHarness.isOpen()).toBeTruthy();

            const defaultOptions = await filterHarness.getDefaultOptions();

            expect(defaultOptions?.length).toBe(numberOfDefaultOptions);

            const option = defaultOptions[i];
            expect(await optionHasClass(option, 'hxp-created-date-filter-option_active')).toBe(true);
        }
    });

    it('should populate filter with provide data for custom value', async () => {
        expect(component.selectedValue).toBeUndefined();
        expect(component.value).toBeUndefined();

        const data = [
            {
                label: 'SEARCH.FILTERS.CREATED_DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_DATE',
                afterDate: new Date('2024-01-09T00:00:00'),
                beforeDate: new Date('2024-01-10T00:00:00'),
            },
        ];

        component.populateWith(new CreatedDateSearchFilterData(data));
        fixture.detectChanges();

        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(data);
        expect(component.value).toEqual(component.selectedValue);
    });

    describe('accessibility checks', () => {
        it('should pass with default date option selected', async () => {
            const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [
                // https://hyland.atlassian.net/browse/HXCS-4387
                { 'aria-required-parent': 1 },
            ];

            const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
            await filterHarness.open();
            await fixture.whenStable();
            fixture.detectChanges();

            const defaultOptions = await filterHarness.getDefaultOptions();

            expect(defaultOptions?.length).toBe(4);

            await defaultOptions[1].select();
            fixture.detectChanges();

            const res = await a11yReport('.hxp-search-filter-overlay');

            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        });

        it('should pass with custom date selected', async () => {
            const EXPECTED_VIOLATIONS: { [violationId: string]: number }[] | undefined = [];

            const filterHarness = await loader.getHarness(CreatedDateSearchFilterHarness);
            await filterHarness.open();
            fixture.detectChanges();

            const enableCustomDateButton = await filterHarness.getCustomDateButton();
            await enableCustomDateButton.click();
            fixture.detectChanges();

            await filterHarness.openAfterDateCalendar();
            await filterHarness.selectCalendarCell({ text: '9' });
            fixture.detectChanges();

            await filterHarness.openBeforeDateCalendar();
            await filterHarness.selectCalendarCell({ text: '10' });
            fixture.detectChanges();

            const res = await a11yReport('.hxp-search-filter-overlay');

            expect(res?.violations).toEqual(EXPECTED_VIOLATIONS);
        });
    });
});
