/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { NewPermission, Permission } from '@alfresco/adf-hx-content-services/services';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSelectHarness } from '@angular/material/select/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PermissionsComponent } from './permissions.component';

@Component({
    selector: 'hxp-test-component',
    template: `<hxp-permissions
        #dropdown
        [permission]="permission"
        [inheritedPermission]="inheritedPermission"
        [disabled]="disabled"
     />`,
    imports: [CommonModule, PermissionsComponent],
    standalone: true,
})
class TestComponent {
    @ViewChild('dropdown')
    component!: PermissionsComponent;

    permission?: NewPermission;
    inheritedPermission: Permission = 'None';
    disabled = false;
}

describe('PermissionsComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let loader: HarnessLoader;
    let testComponent: TestComponent;
    let component: PermissionsComponent;

    beforeEach(async () => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, TestComponent],
        });

        fixture = TestBed.createComponent(TestComponent);
        fixture.detectChanges();
        await fixture.whenStable();
        testComponent = fixture.componentInstance;
        component = testComponent.component;
        loader = TestbedHarnessEnvironment.loader(fixture);
    });

    it('should bind the permissions', async () => {
        const selectPermission = fixture.debugElement.query(By.css('.hxp-select-permission')).nativeElement;
        selectPermission.click();
        fixture.detectChanges();
        const selectHarness = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
        await selectHarness.open();
        const options = await selectHarness.getOptions();
        const permissionOptionsCount = options.length;

        expect(permissionOptionsCount).toEqual(3);
    });

    it('should change color depending on the selected permission', () => {
        testComponent.permission = 'Everything';
        fixture.detectChanges();
        let color = fixture.debugElement.query(By.css('.hxp-permission-select')).nativeElement;

        expect(color.classList.contains('hxp-permission-' + component.permission)).toBe(true);

        testComponent.permission = 'Read';
        fixture.detectChanges();
        color = fixture.debugElement.query(By.css('.hxp-permission-select')).nativeElement;

        expect(color.classList.contains('hxp-permission-' + component.permission)).toBe(true);

        testComponent.permission = 'ReadWrite';
        fixture.detectChanges();
        color = fixture.debugElement.query(By.css('.hxp-permission-select')).nativeElement;

        expect(color.classList.contains('hxp-permission-' + component.permission)).toBe(true);

        testComponent.permission = undefined;
        fixture.detectChanges();
        color = fixture.debugElement.query(By.css('.hxp-permission-select')).nativeElement;

        expect(color.classList.contains('hxp-permission-')).toBe(false);
    });

    it('should return selected permission', async () => {
        const mockedChangePermissionEmit = jest.spyOn(component.changePermission, 'emit').mockImplementation(() => {});
        const selectPermission = fixture.debugElement.query(By.css('.hxp-select-permission')).nativeElement;
        selectPermission.click();
        fixture.detectChanges();
        const selectHarness = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
        await selectHarness.open();
        const options = await selectHarness.getOptions();
        await options[2].click();
        fixture.detectChanges();

        expect(mockedChangePermissionEmit.mock.calls).toEqual([['Everything']]);
    });

    it('should disable the selection', async () => {
        testComponent.permission = 'Read';
        fixture.detectChanges();
        let disabledElement = fixture.debugElement.query(By.css('.hxp-disabled'));

        expect(disabledElement).toBeNull();

        testComponent.disabled = true;
        fixture.detectChanges();
        disabledElement = fixture.debugElement.query(By.css('.hxp-disabled'));

        expect(disabledElement).not.toBeNull();
        expect(disabledElement.nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ');

        testComponent.permission = 'ReadWrite';
        fixture.detectChanges();

        expect(disabledElement.nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ_WRITE');

        testComponent.permission = 'Everything';
        fixture.detectChanges();

        expect(disabledElement.nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.EVERYTHING');
    });

    it('given the selection is disabled and no permission is provided, should display the inherited permission', async () => {
        testComponent.inheritedPermission = 'Read';
        testComponent.permission = 'ReadWrite';
        testComponent.disabled = true;
        fixture.detectChanges();
        const disabledElement = fixture.debugElement.query(By.css('.hxp-disabled'));

        expect(disabledElement).not.toBeNull();
        expect(disabledElement.nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ_WRITE');

        testComponent.permission = undefined;
        fixture.detectChanges();

        expect(disabledElement.nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.READ');
    });

    it('should display the Clean option if a permission is selected', async () => {
        testComponent.permission = 'ReadWrite';
        fixture.detectChanges();
        const selectPermission = fixture.debugElement.query(By.css('.hxp-select-permission')).nativeElement;
        selectPermission.click();
        fixture.detectChanges();
        const selectHarness = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
        await selectHarness.open();
        const options = await selectHarness.getOptions();
        const permissionOptionsCount = options.length;

        expect(permissionOptionsCount).toEqual(4);
        expect(await options[0].getText()).toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.NO_ACCESS');
        expect(await options[0].isDisabled()).toBe(false);
    });

    describe('with inherited permission', () => {
        it('should disable the inherited permission option and display the inherited label', async () => {
            testComponent.inheritedPermission = 'Read';
            fixture.detectChanges();
            const selectPermission = fixture.debugElement.query(By.css('.hxp-select-permission')).nativeElement;
            selectPermission.click();
            fixture.detectChanges();
            const selectHarness = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
            await selectHarness.open();
            const options = await selectHarness.getOptions();
            const permissionOptionsCount = options.length;

            expect(permissionOptionsCount).toEqual(3);
            expect(await options[0].getText()).toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.INHERITED');
            expect(await options[0].isDisabled()).toBe(true);
            expect(await options[1].getText()).not.toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.INHERITED');
            expect(await options[1].isDisabled()).toBe(false);
            expect(await options[2].getText()).not.toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.INHERITED');
            expect(await options[2].isDisabled()).toBe(false);
        });

        it('should enable only options to upgrade a permission', async () => {
            testComponent.inheritedPermission = 'ReadWrite';
            fixture.detectChanges();
            const selectPermission = fixture.debugElement.query(By.css('.hxp-select-permission')).nativeElement;
            selectPermission.click();
            fixture.detectChanges();
            const selectHarness = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
            await selectHarness.open();
            const options = await selectHarness.getOptions();
            const permissionOptionsCount = options.length;

            expect(permissionOptionsCount).toEqual(3);
            expect(await options[0].getText()).not.toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.INHERITED');
            expect(await options[0].isDisabled()).toBe(true);
            expect(await options[1].getText()).toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.INHERITED');
            expect(await options[1].isDisabled()).toBe(true);
            expect(await options[2].getText()).not.toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.INHERITED');
            expect(await options[2].isDisabled()).toBe(false);
        });

        it('should display the Clean option if a permission is selected', async () => {
            testComponent.permission = 'ReadWrite';
            testComponent.inheritedPermission = 'Read';
            fixture.detectChanges();
            const selectPermission = fixture.debugElement.query(By.css('.hxp-select-permission')).nativeElement;
            selectPermission.click();
            fixture.detectChanges();
            const selectHarness = await loader.getHarness<MatSelectHarness>(MatSelectHarness);
            await selectHarness.open();
            const options = await selectHarness.getOptions();
            const permissionOptionsCount = options.length;

            expect(permissionOptionsCount).toEqual(4);
            expect(await options[0].getText()).toContain('PERMISSIONS_MANAGEMENT_ACTION.DROPDOWN.LABEL.CLEAR');
            expect(await options[0].isDisabled()).toBe(false);
        });
    });
});
