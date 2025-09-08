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
import { format } from 'date-fns';

export class DateTimePicker extends BaseComponent {
    constructor(page: Page) {
        super(page, materialLocators.DatetimePicker.root);
    }

    public getCurrentDayLocator = this.getChild(materialLocators.DatetimePicker.calendar.bodyActive);
    public getHoursSelectedElementLocator = this.getChild(
        `${materialLocators.DatetimePicker.clock.hours} ${materialLocators.DatetimePicker.clock.cellSelected}`
    );
    public getMinutesEnabledElementLocator = this.getChild(
        `${materialLocators.DatetimePicker.clock.minutes} ${materialLocators.DatetimePicker.clock.cell}:not([class*='disabled'])`
    );
    public getMonthContentLocator = this.getChild(materialLocators.DatetimePicker.month);
    public getNextMonthButtonLocator = this.getMonthContentLocator.locator(materialLocators.DatetimePicker.calendar.nextButton);

    private yearButton = this.getChild(materialLocators.DatetimePicker.calendar.headerYear);
    private dateTimePicker = this.getChild(materialLocators.DatetimePicker.calendar.bodyCellContent);

    private getDayOfMonthAndYearLocator = (dateAndTime: Date) => this.dateTimePicker.getByText(format(dateAndTime, 'd')).first();
    private getMonthAndYearLocator = (monthAndYear: string) => this.getChild(`[aria-label="${monthAndYear}"]`);

    async setDateAndTime(dateAndTime: Date, hour: string, minute: string): Promise<void> {
        await this.yearButton.click();
        await this.setYear(dateAndTime);
        await this.setMonthAndDay(dateAndTime);
        await this.setHour(hour, minute);
    }

    async setHour(hour: string, minute: string): Promise<void> {
        const hourElement = this.getChild(`${materialLocators.DatetimePicker.clock.hours} div`).getByText(hour, { exact: true });
        const minutesElement = this.getChild(`${materialLocators.DatetimePicker.clock.minutes} div`).getByText(minute, { exact: true });

        await hourElement.click();
        await minutesElement.click();
    }

    async setMonthAndDay(dateAndTime: Date): Promise<void> {
        const monthElement = this.getMonthAndYearLocator(format(dateAndTime, 'MMMM yyyy'));
        const dayElement = this.getDayOfMonthAndYearLocator(dateAndTime);

        await monthElement.click();
        await dayElement.click();
    }

    async setYear(dateAndTime: Date): Promise<void> {
        const formattedYear = Number(format(dateAndTime, 'yyyy'));
        const actualYear = Number(await this.yearButton.innerText());
        const previousYearArr = this.getMonthContentLocator.locator(materialLocators.DatetimePicker.calendar.previousButton);
        const nextYearArr = this.getMonthContentLocator.locator(materialLocators.DatetimePicker.calendar.nextButton);

        if (actualYear > formattedYear) {
            do {
                await previousYearArr.click();
            } while (actualYear === formattedYear);
        } else if (actualYear < formattedYear) {
            do {
                await nextYearArr.click();
            } while (actualYear === formattedYear);
        }
    }
}
