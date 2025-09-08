/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { ButtonHarnessUtils, InputHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { FilterSaveAsDialogComponent } from './filter-save-as-dialog.component';
import { MatDialogRef } from '@angular/material/dialog';

describe('FilterSaveAsDialogComponent', () => {
    let component: FilterSaveAsDialogComponent;
    let fixture: ComponentFixture<FilterSaveAsDialogComponent>;

    const getSaveButton = async () => {
        return ButtonHarnessUtils.getButton({
            fixture,
            buttonFilters: {
                selector: `[data-automation-id="hxp-filter-save-as-dialog-save"]`,
            },
        });
    };

    const setNameInputValue = async (value: string) => {
        const nameInput = await InputHarnessUtils.getInput({
            fixture,
            inputFilters: {
                selector: `[data-automation-id="hxp-filter-save-as-dialog-name"]`,
            },
        });
        await nameInput.setValue(value);
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, FilterSaveAsDialogComponent],
            providers: [
                MockProvider(MatDialogRef, {
                    close: () => {},
                }),
            ],
        });

        fixture = TestBed.createComponent(FilterSaveAsDialogComponent);
        component = fixture.componentInstance;
    });

    it('should close dialog with no arguments on cancel button click', async () => {
        fixture.detectChanges();
        const spy = spyOn(component.dialogRef, 'close');

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: `[data-automation-id="hxp-filter-save-as-dialog-cancel"]`,
            },
        });

        expect(spy).toHaveBeenCalledWith();
    });

    it('should close dialog with name on save button click', async () => {
        fixture.detectChanges();
        const spy = spyOn(component.dialogRef, 'close');

        await setNameInputValue('test');
        const saveButton = await getSaveButton();
        await saveButton.click();

        expect(spy).toHaveBeenCalledWith({ name: 'test' });
    });

    it('should save button be disabled when name is empty or null', async () => {
        fixture.detectChanges();

        let saveButton = await getSaveButton();
        let isSaveButtonDisabled = await saveButton.isDisabled();

        expect(isSaveButtonDisabled).toBeTrue();

        await setNameInputValue('test');

        saveButton = await getSaveButton();
        isSaveButtonDisabled = await saveButton.isDisabled();

        expect(isSaveButtonDisabled).toBeFalse();
    });
});
