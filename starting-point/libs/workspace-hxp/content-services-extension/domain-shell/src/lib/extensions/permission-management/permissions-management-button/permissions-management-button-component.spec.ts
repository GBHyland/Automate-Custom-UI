/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { PermissionsManagementButtonComponent } from './permissions-management-button-component';
import { PermissionsButtonActionService, DIALOG_MIN_WIDTH, PermissionsManagementDialogComponent } from '@alfresco/adf-hx-content-services/ui';
import {
    provideAdfEnterpriseAdfHxContentServicesServices,
    DocumentPermissions,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    PermissionsPanelRequestService,
    PermissionsManagementComponentType,
    PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
} from '@alfresco/adf-hx-content-services/services';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';

const configureTestingModule = (optionalProviders: any[] = []) => {
    TestBed.configureTestingModule({
        imports: [NoopTranslateModule, NoopAnimationsModule],
        providers: [
            provideAdfEnterpriseAdfHxContentServicesServices(),
            {
                provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
                useClass: PermissionsButtonActionService,
            },
            mockHxcsJsClientConfigurationService,
            ...optionalProviders,
        ],
    });
    const fixture = TestBed.createComponent(PermissionsManagementButtonComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    return { fixture, component };
};

describe('PermissionsManagementButtonComponent componentType dialog (default)', () => {
    let component: PermissionsManagementButtonComponent;
    let fixture: ComponentFixture<PermissionsManagementButtonComponent>;
    let button: DebugElement;

    beforeEach(() => {
        const testRefs = configureTestingModule();
        fixture = testRefs.fixture;
        component = testRefs.component;
    });

    it('should call the openPermissionsManagement method when button is clicked', () => {
        component.data.documents = [mocks.fileDocument];
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-permissions-management-button'));
        spyOn(component, 'openPermissionsManagement');
        button.nativeElement.click();

        expect(component.openPermissionsManagement).toHaveBeenCalled();
    });

    it('should open Permissions Management dialog', () => {
        const dialogRef = TestBed.inject(MatDialog);
        const spy = spyOn(dialogRef, 'open');
        component.data.documents = [mocks.fileDocument];
        component.data.parentDocument = mocks.folderDocument;
        component.openPermissionsManagement();

        expect(spy).toHaveBeenCalledWith(PermissionsManagementDialogComponent, {
            width: DIALOG_MIN_WIDTH + 'px',
            height: '100vh',
            position: { top: '0px', right: '0px' },
            data: {
                document: component.data.documents[0],
                parentDocument: component.data.parentDocument,
            },
            disableClose: true,
        });
    });

    it('should not display if `Write` & `ManageSecurity` both permissions are not given', () => {
        component.data.documents = [
            {
                ...mocks.fileDocument,
                sys_effectivePermissions: [DocumentPermissions.READ],
            },
        ];
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-permissions-management-button'));

        expect(button).toBeFalsy();

        component.data.documents = [
            {
                ...mocks.fileDocument,
                sys_effectivePermissions: [DocumentPermissions.WRITE],
            },
        ];
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-permissions-management-button'));

        expect(button).toBeFalsy();

        component.data.documents = [
            {
                ...mocks.fileDocument,
                sys_effectivePermissions: [DocumentPermissions.MANAGE_SECURITY],
            },
        ];
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-permissions-management-button'));

        expect(button).toBeFalsy();
    });

    it('should be displayed if WriteProperties & ManageSecurity are given', () => {
        component.data.documents = [
            {
                ...mocks.fileDocument,
                sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.MANAGE_SECURITY],
            },
        ];
        component.ngOnChanges();
        fixture.detectChanges();
        button = fixture.debugElement.query(By.css('button.hxp-permissions-management-button'));

        expect(button).toBeTruthy();
    });
});

describe('PermissionsManagementButtonComponent componentType panel', () => {
    let component: PermissionsManagementButtonComponent;

    beforeEach(() => {
        const testRefs = configureTestingModule([
            {
                provide: PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
                useValue: 'panel' as PermissionsManagementComponentType,
            },
        ]);
        component = testRefs.component;
    });

    it('should request to open the Permissions Management Panel', () => {
        const permissionsPanelRequestService = TestBed.inject(PermissionsPanelRequestService);
        const spy = spyOn(permissionsPanelRequestService, 'requestOpenPanel');
        component.data.documents = [mocks.fileDocument];
        component.data.parentDocument = mocks.folderDocument;
        component.openPermissionsManagement();

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
