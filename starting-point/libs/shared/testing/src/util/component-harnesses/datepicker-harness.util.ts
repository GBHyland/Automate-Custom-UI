/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import {
    MatDatepickerInputHarness,
    DatepickerInputHarnessFilters,
    MatDatepickerToggleHarness,
    DatepickerToggleHarnessFilters,
    MatCalendarHarness,
    CalendarHarnessFilters,
    CalendarCellHarnessFilters,
} from '@angular/material/datepicker/testing';
import { BaseHarnessProps } from './components-harness.interface';

interface DatepickerProps extends BaseHarnessProps {
    datepickerFilters?: DatepickerInputHarnessFilters;
}

interface DatepickerToggleProps extends DatepickerProps {
    datepickerToggleFilters?: DatepickerToggleHarnessFilters;
}

interface CalendarProps extends DatepickerProps {
    calendarFilters?: CalendarHarnessFilters;
}

interface CalendarCellProps extends CalendarProps {
    calendarCellFilters?: CalendarCellHarnessFilters;
}

export class DatepickerHarnessUtils {
    private static loader: HarnessLoader;

    public static async getDatepickerHarness({ fixture, datepickerFilters, fromRoot = false }: DatepickerProps): Promise<MatDatepickerInputHarness> {
        DatepickerHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const datePickerHarness = await DatepickerHarnessUtils.loader.getHarness(MatDatepickerInputHarness.with(datepickerFilters));

        return datePickerHarness;
    }

    public static async getDatepickerToggleHarness({
        fixture,
        datepickerToggleFilters,
        fromRoot = false,
    }: DatepickerToggleProps): Promise<MatDatepickerToggleHarness> {
        DatepickerHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const datePickerToggleHarness = await DatepickerHarnessUtils.loader.getHarness(MatDatepickerToggleHarness.with(datepickerToggleFilters));

        return datePickerToggleHarness;
    }

    public static async getCalendarHarness({ fixture, calendarFilters, fromRoot = false }: CalendarProps): Promise<MatCalendarHarness> {
        DatepickerHarnessUtils.loader = fromRoot ? TestbedHarnessEnvironment.documentRootLoader(fixture) : TestbedHarnessEnvironment.loader(fixture);

        const datePickerToggleHarness = await DatepickerHarnessUtils.loader.getHarness(MatCalendarHarness.with(calendarFilters));

        return datePickerToggleHarness;
    }

    public static async openCalendar(datepickerProps: DatepickerToggleProps): Promise<void> {
        const calendarToggle = await DatepickerHarnessUtils.getDatepickerToggleHarness(datepickerProps);

        return calendarToggle.openCalendar();
    }

    public static async selectCalendarCell(datepickerProps: CalendarCellProps): Promise<void> {
        await DatepickerHarnessUtils.openCalendar(datepickerProps);
        const calendar = await DatepickerHarnessUtils.getCalendarHarness(datepickerProps);

        return calendar.selectCell(datepickerProps.calendarCellFilters);
    }
}
