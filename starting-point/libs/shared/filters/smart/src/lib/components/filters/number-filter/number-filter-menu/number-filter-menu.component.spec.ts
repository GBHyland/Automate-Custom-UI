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
import { NumberFilterMenuComponent } from './number-filter-menu.component';
import { InputHarnessUtils, SelectHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NumberFilterOperatorType } from '@alfresco-dbp/shared-filters-services';
import { MatInputHarness } from '@angular/material/input/testing';
import { MockPipe } from 'ng-mocks';
import { UnescapePipe } from './unescape.pipe';
import { getClearSelectionButton, getUpdateButton } from '../../../../utils/filter-testing-utils';
import { OPERATOR_ICON_MAP } from '../number-filter.component';

describe('NumberFilterMenuComponent', () => {
    let component: NumberFilterMenuComponent;
    let fixture: ComponentFixture<NumberFilterMenuComponent>;

    const getValue1Input = async (): Promise<MatInputHarness> => {
        if (component.operator === NumberFilterOperatorType.BETWEEN) {
            return InputHarnessUtils.getInput({
                fixture,
                inputFilters: {
                    selector: `[data-automation-id="hxp-number-filter-menu-input-from"]`,
                },
            });
        } else {
            return InputHarnessUtils.getInput({
                fixture,
                inputFilters: {
                    selector: `[data-automation-id="hxp-number-filter-menu-input-single"]`,
                },
            });
        }
    };

    const getValue2Input = async (): Promise<MatInputHarness> => {
        return InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: `[data-automation-id="hxp-number-filter-menu-input-to"]`,
            },
        });
    };

    const selectOperator = async (operatorType: NumberFilterOperatorType): Promise<void> => {
        await SelectHarnessUtils.clickDropdownOptions({
            fixture,
            dropdownFilters: {
                selector: '[data-automation-id="hxp-number-filter-menu-operator-select"]',
            },
            optionsFilters: {
                text: `FILTERS.NUMBER_FILTER.${operatorType}`,
            },
        });
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, NumberFilterMenuComponent, MockPipe(UnescapePipe)],
        });

        fixture = TestBed.createComponent(NumberFilterMenuComponent);
        component = fixture.componentInstance;
        component.operators = OPERATOR_ICON_MAP;
        component.value = {
            value1: null,
            value2: null,
            operator: 'EQUALS',
        };
        fixture.detectChanges();
    });

    it('should disable clear selection button when value1 and value2 are null', async () => {
        let clearSelectionButton = await getClearSelectionButton(fixture);
        expect(await clearSelectionButton.isDisabled()).toBeTrue();

        const input1 = await getValue1Input();
        await input1.setValue('1');

        clearSelectionButton = await getClearSelectionButton(fixture);
        expect(await clearSelectionButton.isDisabled()).toBeFalse();
    });

    it('should reset values when clear button is clicked', async () => {
        await selectOperator(NumberFilterOperatorType.BETWEEN);
        const input1 = await getValue1Input();
        await input1.setValue('1');
        const input2 = await getValue2Input();
        await input2.setValue('2');
        expect(component.value1).toBe(1);
        expect(component.operator).toBe(NumberFilterOperatorType.BETWEEN);
        expect(component.value2).toBe(2);

        const clearSelectionButton = await getClearSelectionButton(fixture);
        await clearSelectionButton.click();

        expect(component.value1).toBeNull();
        expect(component.operator).toBe(NumberFilterOperatorType.EQUALS);
        expect(component.value2).toBeNull();
    });

    it('should emit update on update button click', async () => {
        spyOn(component.update, 'emit');
        await selectOperator(NumberFilterOperatorType.LESS_THAN);
        const input1 = await getValue1Input();
        await input1.setValue('7');
        expect(component.value1).toBe(7);
        expect(component.operator).toBe(NumberFilterOperatorType.LESS_THAN);

        const updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith({
            value1: 7,
            operator: NumberFilterOperatorType.LESS_THAN,
            value2: null,
        });
    });
});
