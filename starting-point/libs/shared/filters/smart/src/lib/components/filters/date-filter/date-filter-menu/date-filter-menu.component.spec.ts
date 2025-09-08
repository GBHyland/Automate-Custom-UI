/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ADF_DATETIME_FORMATS, AdfDateTimeFnsAdapter, NoopTranslateModule } from '@alfresco/adf-core';
import { DateFilterMenuComponent } from './date-filter-menu.component';
import { ButtonHarnessUtils, RadioButtonHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MatButtonHarness } from '@angular/material/button/testing';
import { DATE_OPTIONS, RANGE_DATE_OPTION } from '@alfresco-dbp/shared-filters-services';
import { MatRadioButtonHarness } from '@angular/material/radio/testing';
import { getClearSelectionButton, getUpdateButton } from '../../../../utils/filter-testing-utils';
import { startOfDay, endOfDay } from 'date-fns';
import { DatetimeAdapter, MAT_DATETIME_FORMATS, MatDatetimepickerModule, MatNativeDatetimeModule } from '@mat-datetimepicker/core';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';

describe('DateFilterMenuComponent', () => {
    let component: DateFilterMenuComponent;
    let fixture: ComponentFixture<DateFilterMenuComponent>;

    const getCustomRangeButton = async (): Promise<MatButtonHarness> => {
        return ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: {
                selector: `[data-automation-id="hxp-date-filter-menu-custom-range-button"]`,
            },
        });
    };

    const getRadioButton = async (value: string): Promise<MatRadioButtonHarness> => {
        return RadioButtonHarnessUtils.getRadioButton({
            fixture,
            radioButtonsFilters: {
                selector: `[data-automation-id="hxp-date-filter-menu-option-${value}"]`,
            },
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                NoopTranslateModule,
                DateFilterMenuComponent,
                MatDatepickerModule,
                MatDatetimepickerModule,
                MatNativeDateModule,
                MatNativeDatetimeModule,
            ],
            providers: [
                { provide: DatetimeAdapter, useClass: AdfDateTimeFnsAdapter },
                { provide: MAT_DATETIME_FORMATS, useValue: ADF_DATETIME_FORMATS },
            ],
        });

        fixture = TestBed.createComponent(DateFilterMenuComponent);
        component = fixture.componentInstance;
        component.options = DATE_OPTIONS;
    });

    it('should disable clear selection button when selected date is null', async () => {
        component.value = {
            selectedOption: null,
            range: null,
        };
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeTrue();
    });

    it('should enable clear selection button when selected date is not null', async () => {
        component.value = {
            selectedOption: DATE_OPTIONS[0],
            range: null,
        };
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeFalse();
    });

    it('should reset range and set selected option to null when clear button is clicked', async () => {
        component.value = {
            selectedOption: DATE_OPTIONS[0],
            range: null,
        };
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);
        await clearSelectionButton.click();

        expect(component.form.value.selectedOption).toBeNull();
        expect(component.form.controls.range.controls.from.value).toBeNull();
        expect(component.form.controls.range.controls.to.value).toBeNull();
        expect(component.customRangeFormVisible).toBeFalse();
    });

    it('should emit update with selectedOption and range on update button click', async () => {
        const from = new Date('2021-01-01T00:00:00.000Z');
        const to = new Date('2021-12-31T00:00:00.000Z');
        spyOn(component.update, 'emit');
        component.value = {
            selectedOption: RANGE_DATE_OPTION,
            range: { from, to },
        };
        fixture.detectChanges();

        const updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        const expectedFrom = startOfDay(from);
        const expectedTo = endOfDay(to);
        expect(component.update.emit).toHaveBeenCalledWith({
            selectedOption: RANGE_DATE_OPTION,
            range: {
                from: expectedFrom,
                to: expectedTo,
            },
        });
    });

    it('should use time with dates for range when time is setup', async () => {
        component.useTime = true;

        const from = new Date('2021-01-01T10:10:00.000Z');
        const to = new Date('2021-12-31T20:20:00.000Z');
        component.value = {
            selectedOption: RANGE_DATE_OPTION,
            range: { from, to },
        };

        spyOn(component.update, 'emit');

        fixture.detectChanges();

        const updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith({
            selectedOption: RANGE_DATE_OPTION,
            range: {
                from,
                to,
            },
        });
    });

    it('should set selected option and reset form on option click', async () => {
        component.value = {
            selectedOption: DATE_OPTIONS[1],
            range: null,
        };
        fixture.detectChanges();

        const radioButton = await getRadioButton(DATE_OPTIONS[0].value);
        await radioButton.check();

        expect(component.form.value.selectedOption).toEqual(DATE_OPTIONS[0]);
        expect(component.form.controls.range.controls.from.value).toBeNull();
        expect(component.form.controls.range.controls.to.value).toBeNull();
        expect(component.customRangeFormVisible).toBeFalse();
    });

    it('should set selected option and show custom range form on custom range button click', async () => {
        component.value = {
            selectedOption: DATE_OPTIONS[1],
            range: null,
        };
        fixture.detectChanges();

        const customRangeButton = await getCustomRangeButton();
        await customRangeButton.click();

        expect(component.form.value.selectedOption).toEqual(RANGE_DATE_OPTION);
        expect(component.customRangeFormVisible).toBeTrue();
    });
});
