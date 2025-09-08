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
import { RadioFilterMenuComponent } from './radio-filter-menu.component';
import { getClearSelectionButton, getUpdateButton } from '../../../../utils/filter-testing-utils';

describe('RadioFilterMenuComponent', () => {
    let component: RadioFilterMenuComponent;
    let fixture: ComponentFixture<RadioFilterMenuComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, RadioFilterMenuComponent],
        });

        fixture = TestBed.createComponent(RadioFilterMenuComponent);
        component = fixture.componentInstance;
        component.options = [
            { value: 'mockValue', label: 'mockLabel' },
            { value: 'mockValue2', label: 'mockLabel2' },
        ];
    });

    it('should disable clear selection button when selected radio is null', async () => {
        component.selectedOption = null;
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeTrue();
    });

    it('should enable clear selection button when selected radio is not null', async () => {
        component.selectedOption = { value: 'mockValue', label: 'mockLabel' };
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);

        expect(await clearSelectionButton.isDisabled()).toBeFalse();
    });

    it('should set selected option to null when clear button is clicked', async () => {
        component.selectedOption = { value: 'mockValue', label: 'mockLabel' };
        fixture.detectChanges();

        const clearSelectionButton = await getClearSelectionButton(fixture);
        await clearSelectionButton.click();

        expect(component.selectedOption).toBeNull();
    });

    it('should emit update with selectedRadio on update button click', async () => {
        spyOn(component.update, 'emit');
        component.selectedOption = null;
        fixture.detectChanges();

        let updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith(null);

        component.selectedOption = { value: 'mockValue', label: 'mockLabel' };
        fixture.detectChanges();

        updateButton = await getUpdateButton(fixture);
        await updateButton.click();

        expect(component.update.emit).toHaveBeenCalledWith({
            value: 'mockValue',
            label: 'mockLabel',
        });
    });
});
