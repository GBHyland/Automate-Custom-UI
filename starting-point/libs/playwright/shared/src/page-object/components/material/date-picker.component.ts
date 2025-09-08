/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '..';
import { materialLocators } from '.';

export class DatePicker extends BaseComponent {
    constructor(page: Page) {
        super(page, materialLocators.DatePicker.root);
    }

    todayButton = this.getChild(materialLocators.DatePicker.bodyToday);
    monthYearButton = this.getChild('[aria-label="Choose month and year"]');
    getYearButton = (year: string) => this.getChild(`[aria-label="${year}"]`);
    getMonthButton = (month: string) => this.getButtonByText(month);
    getDayButton = (day: number) => this.getChild(materialLocators.DatePicker.bodyDay).nth(day - 1);
    isDaySelected = (day: string) => this.getChild(materialLocators.DatePicker.selectedDay, { hasText: day });

    async setDate(date: Date): Promise<void> {
        await this.monthYearButton.click();
        await this.setYearMonth(date);
        await this.getDayButton(date.getDate()).click();
    }

    private async setYearMonth(date: Date): Promise<void> {
        await this.getYearButton(date.getFullYear().toString()).click();
        await this.getMonthButton(date.toLocaleString('default', { month: 'short' })).click();
    }
}
