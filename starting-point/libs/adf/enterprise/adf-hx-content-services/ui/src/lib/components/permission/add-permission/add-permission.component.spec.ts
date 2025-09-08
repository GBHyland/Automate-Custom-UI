/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddPermissionComponent } from './add-permission.component';
import { By } from '@angular/platform-browser';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IsSuggestedPermissionEntityValidator, InheritedPermissionEntity } from '@alfresco/adf-hx-content-services/services';
import { of } from 'rxjs';
import { AutocompleteHarnessUtils, InputHarnessUtils, SelectHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';

describe('AddPermissionComponent', () => {
    const getUserInput = (componentFixture: ComponentFixture<AddPermissionComponent>) =>
        InputHarnessUtils.getInput({
            fixture: componentFixture,
            inputFilters: {
                selector: '#hxp-add-permissions-text-search',
            },
        });

    const getSuggestedEntityOptions = async (text: string, componentFixture: ComponentFixture<AddPermissionComponent>) => {
        const addUserInput = await getUserInput(componentFixture);
        await addUserInput.setValue(text);
        await addUserInput.focus();
        return AutocompleteHarnessUtils.getAutocompleteOptions({
            fixture: componentFixture,
        });
    };

    const getPermissionSelectOptions = async (componentFixture: ComponentFixture<AddPermissionComponent>) => {
        const selectHarness = await SelectHarnessUtils.getDropdown({
            fixture: componentFixture,
            dropdownFilters: { selector: '#hxp-permission-select' },
        });
        await selectHarness.open();
        return selectHarness.getOptions();
    };

    let fixture: ComponentFixture<AddPermissionComponent>;
    let component: AddPermissionComponent;

    beforeEach(() => {
        // eslint-disable-next-line unicorn/no-null
        const validatorFn = () => of(null);

        TestBed.configureTestingModule({
            imports: [AddPermissionComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                {
                    provide: IsSuggestedPermissionEntityValidator,
                    useValue: { createValidator: () => validatorFn },
                },
            ],
        });

        fixture = TestBed.createComponent(AddPermissionComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should be disabled if no user and permission is selected', () => {
        const addUserInput = fixture.debugElement.query(By.css('#hxp-add-permissions-text-search'));

        expect(addUserInput).toBeTruthy();

        const addPermissionBtn = fixture.debugElement.query(By.css('#hxp-add-permission-button'));
        jest.spyOn(component.addNewPermission, 'emit');
        addPermissionBtn.nativeElement.click();
        fixture.detectChanges();

        expect(component.addNewPermission.emit).not.toHaveBeenCalled();
    });

    it('should add permission to user', async () => {
        const suggestedEntity: InheritedPermissionEntity = {
            entityId: '',
            entityType: 'user',
            entityLabel: 'hr hruser',
            entity: {
                id: '',
                firstName: 'hr',
                lastName: 'hruser',
                email: '',
            },
        };
        component.suggestions = [{ ...suggestedEntity }];

        expect(component.form.valid).toBe(false);

        const entityOptions = await getSuggestedEntityOptions('hr', fixture);

        expect(await entityOptions[0].getText()).toBe('hr hruser');

        await entityOptions[0].click();
        const permissionOptions = await getPermissionSelectOptions(fixture);

        expect(await permissionOptions[0].getText()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ');

        await permissionOptions[0].click();

        expect(component.form.valid).toBe(true);

        const addPermissionBtn = fixture.debugElement.query(By.css('#hxp-add-permission-button'));
        jest.spyOn(component.addNewPermission, 'emit');
        addPermissionBtn.nativeElement.click();

        expect(component.addNewPermission.emit).toHaveBeenCalled();
        expect(component.form.valid).toBe(false);
    });

    it('should be disabled if only user but no permission is selected', async () => {
        const addUserInput = await getUserInput(fixture);
        const addPermissionBtn = fixture.debugElement.query(By.css('#hxp-add-permission-button')).nativeElement;

        expect(component.form.valid).toBe(false);

        await addUserInput.setValue('Admin');

        expect(component.form.controls.permission.disabled).toBe(true);
        expect(component.form.valid).toBe(false);
        expect(addPermissionBtn.disabled).toBeTruthy();
    });

    it('should not be possible to select permission before the user', async () => {
        const suggestedEntity: InheritedPermissionEntity = {
            entityId: '',
            entityType: 'user',
            entityLabel: 'hr hruser',
            entity: {
                id: '',
                firstName: 'hr',
                lastName: 'hruser',
                email: '',
            },
        };
        component.suggestions = [{ ...suggestedEntity }];
        const addPermissionBtn = fixture.debugElement.query(By.css('#hxp-add-permission-button')).nativeElement;
        let permissionOptions = await getPermissionSelectOptions(fixture);

        expect(permissionOptions.length).toBe(0);
        expect(component.form.controls.permission.disabled).toBe(true);
        expect(addPermissionBtn.disabled).toBe(true);

        const entityOptions = await getSuggestedEntityOptions('hr', fixture);
        await entityOptions[0].click();

        expect(component.form.controls.permission.disabled).toBe(false);
        expect(addPermissionBtn.disabled).toBe(true);

        permissionOptions = await getPermissionSelectOptions(fixture);
        await permissionOptions[0].click();

        expect(permissionOptions.length).toBe(3);
        expect(addPermissionBtn.disabled).toBe(false);
    });

    it('should display only higher permissions than the inherited one', async () => {
        const suggestedEntity: InheritedPermissionEntity = {
            entityId: '',
            entityType: 'user',
            entityLabel: 'hr hruser',
            entity: {
                id: '',
                firstName: 'hr',
                lastName: 'hruser',
                email: '',
            },
        };
        component.suggestions = [{ ...suggestedEntity }];
        let entityOptions = await getSuggestedEntityOptions('hr', fixture);
        await entityOptions[0].click();
        let permissionOptions = await getPermissionSelectOptions(fixture);

        expect(permissionOptions.length).toBe(3);
        expect(await permissionOptions[0].getText()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ');

        component.suggestions = [{ ...suggestedEntity, inheritedPermission: 'Read' }];
        entityOptions = await getSuggestedEntityOptions('hr', fixture);
        await entityOptions[0].click();
        permissionOptions = await getPermissionSelectOptions(fixture);

        expect(permissionOptions.length).toBe(2);
        expect(await permissionOptions[0].getText()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ_WRITE');

        component.suggestions = [{ ...suggestedEntity, inheritedPermission: 'ReadWrite' }];
        entityOptions = await getSuggestedEntityOptions('hr', fixture);
        await entityOptions[0].click();
        permissionOptions = await getPermissionSelectOptions(fixture);

        expect(permissionOptions.length).toBe(1);
        expect(await permissionOptions[0].getText()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.EVERYTHING');
    });
});
