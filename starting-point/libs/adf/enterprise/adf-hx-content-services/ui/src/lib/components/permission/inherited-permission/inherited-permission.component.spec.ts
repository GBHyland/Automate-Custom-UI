/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { Permission } from '@alfresco/adf-hx-content-services/services';
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { InheritedPermissionComponent } from './inherited-permission.component';

@Component({
    selector: 'hxp-test-component',
    template: `
        <hxp-inherited-permission
            [permission]="permission"
            [inheritanceEnabled]="inheritanceEnabled" />
    `,
    imports: [CommonModule, InheritedPermissionComponent],
    standalone: true,
})
class TestComponent {
    permission: Permission = 'None';
    inheritanceEnabled: boolean | null = true;
}

describe('InheritedPermissionComponent', () => {
    let fixture: ComponentFixture<TestComponent>;
    let component: TestComponent;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [TestComponent, NoopTranslateModule],
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display the permission when inheritance is enabled', () => {
        component.permission = 'None';
        component.inheritanceEnabled = true;
        fixture.detectChanges();
        let permission = fixture.debugElement.query(By.css('.hxp-inherited-permission')).nativeElement.textContent.trim();

        expect(permission).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.NO_ACCESS');

        component.permission = 'Read';
        fixture.detectChanges();
        permission = fixture.debugElement.query(By.css('.hxp-inherited-permission')).nativeElement.textContent.trim();

        expect(permission).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.READ');
    });

    it('should display "Blocked" when inheritance is disabled', () => {
        component.permission = 'Read';
        component.inheritanceEnabled = false;
        fixture.detectChanges();
        const permission = fixture.debugElement.query(By.css('.hxp-inherited-permission')).nativeElement.textContent.trim();

        expect(permission).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.BLOCKED');
    });

    it('should update the label dynamically when inheritanceEnabled changes', () => {
        component.permission = 'Everything';
        component.inheritanceEnabled = true;
        fixture.detectChanges();
        let permission = fixture.debugElement.query(By.css('.hxp-inherited-permission')).nativeElement.textContent.trim();

        expect(permission).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.EVERYTHING');

        component.inheritanceEnabled = false;
        fixture.detectChanges();
        permission = fixture.debugElement.query(By.css('.hxp-inherited-permission')).nativeElement.textContent.trim();

        expect(permission).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.INHERITED.LABEL.BLOCKED');
    });
});
