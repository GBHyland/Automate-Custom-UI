/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '..';
import {
    HxpCheckboxFilterMenuComponent,
    HxpDateFilterMenuComponent,
    HxpMoreFiltersComponent,
    HxpNumberFilterMenuComponent,
    HxpStringFilterMenuComponent,
    HxpUserFilterMenuComponent,
    HxpRadioFilterMenuComponent,
} from '.';

export interface IFilterOptions {
    filterName: string;
    operator?: string;
    value?: string;
    predefinedDateOption?: string;
    customStartDate?: string;
    customEndDate?: string;
    datetimeCustomValue?: {
        dateTimeFrom: IDatetimeFilterValues;
        dateTimeTo: IDatetimeFilterValues;
    };
}

export type FilterType = 'string' | 'checkbox' | 'number' | 'radio' | 'user' | 'date' | 'datetime';

export interface IDatetimeFilterValues {
    date: Date;
    formattedHour: string;
    formattedMinutes: string;
}

export class HxpFiltersContainerComponent extends BaseComponent {
    static rootElement = 'hxp-filters-container';

    moreFiltersComponent = new HxpMoreFiltersComponent(this.page);
    checkboxFilterMenuComponent = new HxpCheckboxFilterMenuComponent(this.page);
    dateFilterMenuComponent = new HxpDateFilterMenuComponent(this.page);
    stringFilterMenuComponent = new HxpStringFilterMenuComponent(this.page);
    userFilterMenuComponent = new HxpUserFilterMenuComponent(this.page);
    numberFilterMenuComponent = new HxpNumberFilterMenuComponent(this.page);
    radioFilterMenuComponent = new HxpRadioFilterMenuComponent(this.page);

    constructor(page: Page) {
        super(page, HxpFiltersContainerComponent.rootElement);
    }

    getMoreFiltersButtonLocator = this.getChild('.hxp-filters-container__more-button');
    getFilterCheckboxMenu = this.getElementByAutomationId('hxp-checkbox-filter-menu');
    getFilterLabelLocator = (filterName: string) => this.getChild('.hxp-filter-chip', { hasText: filterName }).locator('.hxp-filter-chip__label');
    getFilterValueByNameLocator = (filterName: string) =>
        this.getChild('.hxp-filter-chip', { hasText: filterName }).locator('.hxp-filter-chip__label-suffix span');
    getFilterRemoveIconByFilterName = (filterName: string) =>
        this.getChild(`[data-automation-id="hxp-filter-chip"]:has-text("${filterName}") .hxp-filter-chip__remove-icon`);

    private async enableFilter(filterName: string): Promise<void> {
        await this.getMoreFiltersButtonLocator.click();
        await this.moreFiltersComponent.selectFilterName(filterName);
    }

    async performSearch(type: FilterType, filterOptions: IFilterOptions): Promise<void> {
        await this.enableFilter(filterOptions.filterName);
        await this.getFilterLabelLocator(filterOptions.filterName).click();

        switch (type) {
            case 'string': {
                await this.stringFilterMenuComponent.provideTestFilterValue(filterOptions.value);
                break;
            }
            case 'checkbox': {
                await this.checkboxFilterMenuComponent.selectSingleFilterValue(filterOptions.value);
                break;
            }
            case 'date': {
                if (filterOptions.predefinedDateOption) {
                    await this.dateFilterMenuComponent.selectPredefinedDateOption(filterOptions.predefinedDateOption);
                }
                if (filterOptions.customStartDate && filterOptions.customEndDate) {
                    await this.dateFilterMenuComponent.provideCustomDateRange(filterOptions.customStartDate, filterOptions.customEndDate);
                }
                break;
            }
            case 'datetime': {
                await this.dateFilterMenuComponent.provideCustomDatetimeRange(
                    filterOptions.datetimeCustomValue.dateTimeFrom,
                    filterOptions.datetimeCustomValue.dateTimeTo
                );
                break;
            }
            case 'number': {
                await this.numberFilterMenuComponent.provideNumberValue(filterOptions.operator, filterOptions.value);
                break;
            }
            case 'user': {
                await this.userFilterMenuComponent.provideUserName(filterOptions.value);
                break;
            }
            case 'radio': {
                await this.radioFilterMenuComponent.getRadioFilterOptionLocator(filterOptions.value).click();
                await this.radioFilterMenuComponent.getUpdateFilterButtonLocator.click();
                break;
            }
        }
    }
}
