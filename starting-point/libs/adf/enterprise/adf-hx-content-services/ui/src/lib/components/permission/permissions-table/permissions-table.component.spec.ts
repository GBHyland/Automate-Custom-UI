/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PermissionsTableComponent } from './permissions-table.component';
import { PermissionsManagementRow } from '@alfresco/adf-hx-content-services/services';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('PermissionsTableComponent', () => {
    let component: PermissionsTableComponent;
    let fixture: ComponentFixture<PermissionsTableComponent>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule],
        });

        fixture = TestBed.createComponent(PermissionsTableComponent);
        component = fixture.componentInstance;
    });

    it('given a PermissionsManagementRow list, should display active permissions list', () => {
        component.activePermissionsManagementRows = jestMocks.userList as PermissionsManagementRow[];
        fixture.detectChanges();
        const rows = fixture.debugElement.queryAll(By.css('table tbody tr'));

        expect(rows.length).toBe(component.activePermissionsManagementRows.length);
    });

    it('given an empty PermissionsManagementRow list, should display an informative message', () => {
        component.activePermissionsManagementRows = [];
        fixture.detectChanges();
        const noPermissionsTemplate = fixture.debugElement.query(By.css('.hxp-no-permission'));

        expect(noPermissionsTemplate.nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.NO_PERMISSION.DEFAULT');
    });
});
