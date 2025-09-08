/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { CheckboxFilterMenuComponent } from './checkbox-filter-menu.component';
import { CheckboxHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { getClearSelectionButton, getUpdateButton } from '../../../../utils/filter-testing-utils';

describe('CheckboxFilterMenuComponent', () => {
    let component: CheckboxFilterMenuComponent;
    let fixture: ComponentFixture<CheckboxFilterMenuComponent>;

    const getSelectAllCheckbox = async (): Promise<MatCheckboxHarness> => {
        return CheckboxHarnessUtils.getCheckbox({
            fixture,
            checkboxFilters: {
                selector: `[data-automation-id="hxp-checkbox-filter-menu-select-all"]`,
            },
        });
    };

    const getCheckbox = async (value: string): Promise<MatCheckboxHarness> => {
        return CheckboxHarnessUtils.getCheckbox({
            fixture,
            checkboxFilters: {
                selector: `[data-automation-id="hxp-checkbox-filter-menu-option-${value}"]`,
            },
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, CheckboxFilterMenuComponent],
        });

        fixture = TestBed.createComponent(CheckboxFilterMenuComponent);
        component = fixture.componentInstance;
    });

    it('should disable clear selection button when selectedOptions are empty', async () => {
        component.options = [
            { value: 'mockValue', label: 'mockLabel', checked: false },
            { value: 'mockValue2', label: 'mockLabel2', checked: false },
        ];
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeTrue();
    });

    it('should enable clear selection button when selectedOptions are not empty', async () => {
        component.options = [
            { value: 'mockValue', label: 'mockLabel', checked: true },
            { value: 'mockValue2', label: 'mockLabel2', checked: false },
        ];
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeFalse();
    });

    it('should deselect all options when clear button is clicked', async () => {
        spyOn(component.update, 'emit');
        component.options = [
            { value: 'mockValue', label: 'mockLabel', checked: true },
            { value: 'mockValue2', label: 'mockLabel2', checked: true },
            { value: 'mockValue3', label: 'mockLabel3', checked: false },
        ];
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);
        await clearSelectionButton.click();

        component.options.forEach((option) => {
            expect(option.checked).toBeFalse();
        });
    });

    it('should select all options on select all checkbox click', async () => {
        component.options = [
            { value: 'mockValue', label: 'mockLabel', checked: false },
            { value: 'mockValue2', label: 'mockLabel2', checked: false },
            { value: 'mockValue3', label: 'mockLabel3', checked: false },
        ];
        fixture.detectChanges();

        const selectAllCheckbox = await getSelectAllCheckbox();
        await selectAllCheckbox.check();

        component.options.forEach((option) => {
            expect(option.checked).toBeTrue();
        });
    });

    it('should select an option on checkbox click', async () => {
        component.options = [
            { value: 'mockValue', label: 'mockLabel', checked: false },
            { value: 'mockValue2', label: 'mockLabel2', checked: false },
            { value: 'mockValue3', label: 'mockLabel3', checked: false },
        ];
        fixture.detectChanges();

        const checkbox = await getCheckbox('mockValue');
        await checkbox.check();

        expect(component.options[0].checked).toBeTrue();
    });

    it('should emit update with selectedOptions on update button click', async () => {
        spyOn(component.update, 'emit');
        component.options = [
            { value: 'mockValue', label: 'mockLabel', checked: true },
            { value: 'mockValue2', label: 'mockLabel2', checked: true },
            { value: 'mockValue3', label: 'mockLabel3', checked: false },
        ];
        fixture.detectChanges();

        const updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith([
            { value: 'mockValue', label: 'mockLabel', checked: true },
            { value: 'mockValue2', label: 'mockLabel2', checked: true },
        ]);
    });
});
