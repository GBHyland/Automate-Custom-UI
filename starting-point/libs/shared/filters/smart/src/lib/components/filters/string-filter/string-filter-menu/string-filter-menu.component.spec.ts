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
import { StringFilterMenuComponent } from './string-filter-menu.component';
import { InputHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { getClearSelectionButton, getUpdateButton } from '../../../../utils/filter-testing-utils';

describe('StringFilterMenuComponent', () => {
    let component: StringFilterMenuComponent;
    let fixture: ComponentFixture<StringFilterMenuComponent>;

    const getInput = async () => {
        return InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: `[data-automation-id="hxp-string-filter-menu-input"]`,
            },
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [CommonModule, NoopAnimationsModule, NoopTranslateModule, StringFilterMenuComponent],
        });

        fixture = TestBed.createComponent(StringFilterMenuComponent);
        component = fixture.componentInstance;
        component.inputValue = null;
        fixture.detectChanges();
    });

    it('should disable clear selection button when input value is null', async () => {
        let clearSelectionButton = await getClearSelectionButton(fixture);
        expect(await clearSelectionButton.isDisabled()).toBeTrue();

        const input = await getInput();
        await input.setValue('mockValue');

        clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeFalse();
    });

    it('should reset input value when clear button is clicked', async () => {
        const input = await getInput();
        await input.setValue('mockValue');

        const clearSelectionButton = await getClearSelectionButton(fixture);
        await clearSelectionButton.click();

        expect(await input.getValue()).toBe('');
    });

    it('should emit update with input value on update button click', async () => {
        spyOn(component.update, 'emit');
        const input = await getInput();
        await input.setValue('newMockValue');

        const updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith('newMockValue');
    });
});
