/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DateTimePicker } from '..';
import { IDatetimeFilterValues } from '.';
export class HxpDateFilterMenuComponent extends BaseComponent {
    static rootElement = 'hxp-date-filter-menu';

    dateTimePicker = new DateTimePicker(this.page);

    constructor(page: Page) {
        super(page, HxpDateFilterMenuComponent.rootElement);
    }

    private getDateFilterOptionLocator = (option: string) => this.getElementByAutomationId(`hxp-date-filter-menu-option-${option}`).locator('label');
    private getUpdateFilterButtonLocator = this.getElementByAutomationId('hxp-filter-menu-update-button');
    private getCustomRangeButtonLocator = this.getElementByAutomationId('hxp-date-filter-menu-custom-range-button');
    private getFromInputLocator = this.getElementByAutomationId('hxp-filter-menu-from-input');
    private getToInputLocator = this.getElementByAutomationId('hxp-filter-menu-to-input');
    private getClearSelectionLocator = this.getElementByAutomationId('hxp-filter-menu-clear-selection-button');
    private getRangeFormLocator = this.getChild('.hxp-date-filter-menu__range-form');
    private getDatepickerLocator = this.getRangeFormLocator.locator('.hxp-date-filter-menu__range-form-field-suffix');

    async provideCustomDateRange(startDate: string, endDate?: string): Promise<void> {
        if (await this.getClearSelectionLocator.isEnabled()) {
            await this.getClearSelectionLocator.click();
        }

        await this.getCustomRangeButtonLocator.click();
        await this.getFromInputLocator.fill(startDate);
        await this.getToInputLocator.fill(endDate);
        await this.getUpdateFilterButtonLocator.click();
    }

    async selectPredefinedDateOption(option: string): Promise<void> {
        await this.getDateFilterOptionLocator(option).click();
        await this.getUpdateFilterButtonLocator.click();
    }

    async provideCustomDatetimeRange(datetimeFrom: IDatetimeFilterValues, datetimeTo: IDatetimeFilterValues): Promise<void> {
        await this.getCustomRangeButtonLocator.click();
        await this.getDatepickerLocator.nth(0).click();
        await this.dateTimePicker.setDateAndTime(datetimeFrom.date, datetimeFrom.formattedHour, datetimeFrom.formattedMinutes);
        await this.getDatepickerLocator.nth(1).click();
        await this.dateTimePicker.setDateAndTime(datetimeTo.date, datetimeTo.formattedHour, datetimeTo.formattedMinutes);
        await this.getUpdateFilterButtonLocator.click();
    }
}
