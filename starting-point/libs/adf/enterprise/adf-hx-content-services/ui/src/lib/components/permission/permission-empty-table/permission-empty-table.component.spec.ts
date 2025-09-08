/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionEmptyTableComponent } from './permission-empty-table.component';
import { By } from '@angular/platform-browser';

describe('EmptyTableComponent', () => {
    let component: PermissionEmptyTableComponent;
    let fixture: ComponentFixture<PermissionEmptyTableComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [PermissionEmptyTableComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(PermissionEmptyTableComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should display no permission message for groups', () => {
        component.message = 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.NO_PERMISSION.GROUP';
        fixture.detectChanges();
        const result = fixture.debugElement.query(By.css('.hxp-no-permission-msg')).nativeElement.textContent.trim();
        expect(result).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.NO_PERMISSION.GROUP');
    });

    it('should display no permission message for users', () => {
        component.message = 'PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.NO_PERMISSION.USER';
        fixture.detectChanges();
        const result = fixture.debugElement.query(By.css('.hxp-no-permission-msg')).nativeElement.textContent.trim();
        expect(result).toEqual('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.NO_PERMISSION.USER');
    });
});
