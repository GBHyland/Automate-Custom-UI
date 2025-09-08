/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { By } from '@angular/platform-browser';
import { PermissionInheritanceToggleComponent } from './permissions-inheritance-toggle.component';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatButtonToggleGroupHarness } from '@angular/material/button-toggle/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';

describe('InheritanceToggleComponent', () => {
    let component: PermissionInheritanceToggleComponent;
    let fixture: ComponentFixture<PermissionInheritanceToggleComponent>;
    let loader: HarnessLoader;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [MatButtonToggleModule, NoopAnimationsModule, PermissionInheritanceToggleComponent, NoopTranslateModule],
        }).compileComponents();

        fixture = TestBed.createComponent(PermissionInheritanceToggleComponent);
        component = fixture.componentInstance;
        loader = TestbedHarnessEnvironment.loader(fixture);
        fixture.detectChanges();
    });

    it('should display the correct labels for the toggle buttons', () => {
        const toggleButtons = fixture.debugElement.queryAll(By.css('.hxp-toggle-button'));
        const offButton = toggleButtons[0].nativeElement;
        const onButton = toggleButtons[1].nativeElement;

        expect(offButton.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.BLOCK_INHERITANCE.TOGGLE_OPTION.OFF');
        expect(onButton.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.BLOCK_INHERITANCE.TOGGLE_OPTION.ON');
    });

    it('should toggle the value and emit event on user interaction', async () => {
        jest.spyOn(component.toggleChange, 'emit');

        const toggleGroupHarness = await loader.getHarness(MatButtonToggleGroupHarness);
        const toggles = await toggleGroupHarness.getToggles();

        // Simulate clicking the "Off" toggle
        await toggles[0].check();
        fixture.detectChanges();

        expect(component.toggleChange.emit).toHaveBeenCalledWith(false);

        // Simulate clicking the "On" toggle
        await toggles[1].check();
        fixture.detectChanges();

        expect(component.toggleChange.emit).toHaveBeenCalledWith(true);
    });
});
