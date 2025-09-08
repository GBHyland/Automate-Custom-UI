/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DateOption, DateSearchFilterBase } from './date-search-filter.directive';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { DateSearchFilterHarness } from './date-search-filter-harness';
import { DateSearchFilterData } from './date-search-filter.data';
import { MatListOptionHarness } from '@angular/material/list/testing';
import { SearchFilterContainerComponent } from '../search-filter-container/search-filter-container.component';
import { SearchFilterValueService } from '../search-filter-value.service';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatIconTestingModule } from '@angular/material/icon/testing'; // import testing module for icons
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { take } from 'rxjs';

const generateSelectedValueForDefaultDate = (option: DateOption) => {
    return new DateSearchFilterData([option]);
};

const optionHasClass = async (option: MatListOptionHarness, className: string) => {
    const hostElement = await option.host();
    return hostElement.hasClass(className);
};

@Component({
    selector: 'hxp-governance-cutoff-search-filter',
    standalone: true,
    templateUrl: './date-search-filter.directive.html',
    styleUrls: ['./date-search-filter.directive.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDividerModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        ReactiveFormsModule,
        TranslatePipe,
        NoopTranslateModule,
        SearchFilterContainerComponent,
    ],
})
export class ExampleDateFilterComponent extends DateSearchFilterBase {
    constructor() {
        super();
        this.filterLabelKey = 'EXAMPLE.FILTER.LABEL';
    }

    override toQueryParams(): Record<string, any> {
        return {};
    }
}

describe('DateSearchFilterBase (validator & input)', () => {
    // Mock Date.now to a fixed timestamp for consistent date tests
    const FIXED_TIMESTAMP = new Date('2025-07-02T00:00:00Z').getTime();
    beforeAll(() => {
        jest.spyOn(Date, 'now').mockReturnValue(FIXED_TIMESTAMP);
    });
    afterAll(() => {
        (Date.now as jest.Mock).mockRestore();
    });
    let fixture: ComponentFixture<ExampleDateFilterComponent>;
    let component: ExampleDateFilterComponent;
    let loader: HarnessLoader;
    let searchFilterValueService: SearchFilterValueService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                ExampleDateFilterComponent,
                CommonModule,
                FormsModule,
                ReactiveFormsModule,
                MatInputModule,
                NoopTranslateModule,
                NoopAnimationsModule,
                SearchFilterContainerComponent,
                MatDatepickerModule,
                MatIconTestingModule,
            ],
            providers: [DatePipe, provideNativeDateAdapter()],
        });

        searchFilterValueService = TestBed.inject(SearchFilterValueService);
        fixture = TestBed.createComponent(ExampleDateFilterComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should display data filter', async () => {
        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        const chipLabel = await filterHarness.getLabel();

        expect(chipLabel).toBeTruthy();
        expect(await chipLabel?.text()).toBe('EXAMPLE.FILTER.LABEL');
    });

    it('should display the date filter overlay with available options', async () => {
        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
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

    it('should select a default data option', async () => {
        const numberOfDefaultOptions = component.defaultDateOptions.length;
        expect(numberOfDefaultOptions).toBe(4);

        const filterHarness = await loader.getHarness(DateSearchFilterHarness);

        for (let i = 0; i < component.defaultDateOptions.length; i++) {
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

            expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[i]));
            expect(component.value).toBeFalsy();
            expect(await optionHasClass(option, 'hxp-governance-date-filter-option_active')).toBe(true);

            const applyFilterButton = await filterHarness.getApplyButton();
            expect(applyFilterButton).toBeTruthy();
            await applyFilterButton?.click();
            fixture.detectChanges();

            expect(await filterHarness.isOpen()).toBeFalsy();

            expect(component.value).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[i]));
            expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[i]));
            expect(component.selectedValue).toEqual(component.value);

            const selectedValue = await filteredAppliedPromise;
            expect(selectedValue?.filter).toEqual(component);
            expect(selectedValue?.value).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[i]));

            component.clearFilter();
        }
    });

    it('should clear the filter', async () => {
        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toBeFalsy();
        expect(component.value).toBeFalsy();

        let defaultOptions = await filterHarness.getDefaultOptions();

        expect(defaultOptions?.length).toBe(4);

        await defaultOptions[0].select();
        fixture.detectChanges();

        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));
        expect(component.value).toBeFalsy();
        expect(await optionHasClass(defaultOptions[0], 'hxp-governance-date-filter-option_active')).toBe(true);

        const applyFilterButton = await filterHarness.getApplyButton();
        expect(applyFilterButton).toBeTruthy();
        await applyFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        const filteredResetPromise = searchFilterValueService.filterReset$.pipe(take(1)).toPromise();
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));
        expect(component.value).toBeTruthy();
        expect(component.selectedValue).toEqual(component.value);

        defaultOptions = await filterHarness.getDefaultOptions();

        expect(defaultOptions?.length).toBe(4);
        expect(await optionHasClass(defaultOptions[0], 'hxp-governance-date-filter-option_active')).toBe(true);

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
        component.selectedValue = generateSelectedValueForDefaultDate(component.defaultDateOptions[0]);
        fixture.detectChanges();
        component.applyFilter();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));
        expect(component.selectedValue).toEqual(component.value);

        const defaultOptions = await filterHarness.getDefaultOptions();

        expect(defaultOptions?.length).toBe(4);

        await defaultOptions[1].select();
        fixture.detectChanges();

        expect(await optionHasClass(defaultOptions[1], 'hxp-governance-date-filter-option_active')).toBe(true);
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[1]));
        expect(component.value).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));

        const backdrop = await filterHarness.getOverlayBackdrop();
        expect(backdrop).toBeTruthy();
        backdrop?.dispatchEvent('click');
        await fixture.whenStable();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));
        expect(component.selectedValue).toEqual(component.value);
    });

    it("should not clear the filter's value when overlay is closed without applying changes", async () => {
        component.selectedValue = generateSelectedValueForDefaultDate(component.defaultDateOptions[0]);
        fixture.detectChanges();
        component.applyFilter();
        fixture.detectChanges();

        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();
        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));
        expect(component.value).toBeTruthy();
        expect(component.selectedValue).toEqual(component.value);

        const backdrop = await filterHarness.getOverlayBackdrop();
        expect(backdrop).toBeTruthy();
        backdrop?.dispatchEvent('click');

        await fixture.whenStable();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        expect(component.selectedValue).toEqual(generateSelectedValueForDefaultDate(component.defaultDateOptions[0]));
        expect(component.value).toBeTruthy();
        expect(component.selectedValue).toEqual(component.value);
    });

    it('should apply an after custom date', async () => {
        expect(component.selectedValue).toBeUndefined();
        expect(component.value).toBeUndefined();

        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        await enableCustomDateButton.click();
        fixture.detectChanges();

        (component as any).filterForm.patchValue({ afterDate: new Date('2025-06-09T00:00:00') });
        component['updateCustomDateSelectedValue']();
        fixture.detectChanges();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        expect(await filterHarness.isOpen()).toBeFalsy();

        const expectedValue = [
            {
                label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_TODAY',
                afterDate: new Date('2025-06-09T00:00:00'),
                beforeDate: null,
            },
        ];

        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(expectedValue);
        expect(component.value).toEqual(component.selectedValue);
    });

    it('should apply a before custom date', async () => {
        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        await enableCustomDateButton.click();
        fixture.detectChanges();

        (component as any).filterForm.patchValue({ beforeDate: new Date('2025-06-09T00:00:00') });
        component['updateCustomDateSelectedValue']();
        fixture.detectChanges();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        const expectedValue = [
            {
                label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.CUSTOM_DATE.VALUES.UNTIL_DATE',
                afterDate: null,
                beforeDate: new Date('2025-06-09T00:00:00'),
            },
        ];
        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(expectedValue);
        expect(component.value).toEqual(component.selectedValue);
    });

    it('should apply a custom range with both after and before dates', async () => {
        const filterHarness = await loader.getHarness(DateSearchFilterHarness);
        await filterHarness.open();

        expect(await filterHarness.isOpen()).toBeTruthy();

        const enableCustomDateButton = await filterHarness.getCustomDateButton();
        const applyFilterButton = await filterHarness.getApplyButton();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeTruthy();

        await enableCustomDateButton.click();
        fixture.detectChanges();

        (component as any).filterForm.patchValue({ afterDate: new Date('2025-06-09T00:00:00'), beforeDate: new Date('2025-06-10T00:00:00') });
        component['updateCustomDateSelectedValue']();
        fixture.detectChanges();

        expect(applyFilterButton).toBeTruthy();
        expect(await applyFilterButton?.isDisabled()).toBeFalsy();

        await applyFilterButton?.click();
        fixture.detectChanges();

        const expectedValue = [
            {
                label: 'GOVERNANCE.SEARCH.FILTERS.DATE.OPTIONS.CUSTOM_DATE.VALUES.SINCE_TO_DATE',
                afterDate: new Date('2025-06-09T00:00:00'),
                beforeDate: new Date('2025-06-10T00:00:00'),
            },
        ];

        expect(component.selectedValue).toBeTruthy();
        expect(component.selectedValue?.values).toEqual(expectedValue);
        expect(component.value).toEqual(component.selectedValue);
    });
});
