/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { PermissionsManagementPanelComponent } from './permissions-management-panel.component';
import { MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import {
    NewPermissionEntity,
    PermissionsPanelRequestService,
    IDENTITY_USER_SERVICE_TOKEN,
    IIdentityUserService,
    provideAdfEnterpriseAdfHxContentServicesServices,
    DocumentService,
    PermissionsManagementFacade,
    PermissionsManagementStateService,
} from '@alfresco/adf-hx-content-services/services';
import { MockProvider } from 'ng-mocks';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';

const mockIdentityUserService = {
    getCurrentUserInfo: () => ({ id: '0000-fake-user-uuid-0000' }),
} as unknown as IIdentityUserService;

describe('PermissionsManagementPanelComponent', () => {
    let fixture: ComponentFixture<PermissionsManagementPanelComponent>;
    let component: PermissionsManagementPanelComponent;

    const mockDialogRef = {
        close: jest.fn(),
        afterClosed: jest.fn(),
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                DocumentService,
                { provide: MatDialogRef, useValue: mockDialogRef },
                MockProvider(IDENTITY_USER_SERVICE_TOKEN, mockIdentityUserService),
                PermissionsManagementFacade,
                PermissionsManagementStateService,
            ],
        });

        fixture = TestBed.createComponent(PermissionsManagementPanelComponent);
        component = fixture.componentInstance;
        component.document = jestMocks.fileDocument;
        fixture.detectChanges();
    });

    it('should request to close the panel', () => {
        const permissionsPanelRequestService = TestBed.inject(PermissionsPanelRequestService);
        const spy = jest.spyOn(permissionsPanelRequestService, 'requestClosePanel');

        expect(spy).toHaveBeenCalledTimes(0);

        const nodeContainer = fixture.debugElement.query(By.css('.hxp-cancel-button'));
        nodeContainer.nativeElement.click();

        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should open cancel popup when cancel button clicked and document is edited', () => {
        const matDialogService = (component as any).dialog;
        const dialogRefOpenSpy = jest.spyOn(matDialogService, 'open');
        const cancelButton = fixture.debugElement.query(By.css('.hxp-cancel-button'));
        cancelButton.nativeElement.click();

        expect(dialogRefOpenSpy).not.toHaveBeenCalled();

        const mockNewPermission: NewPermissionEntity = jestMocks.permission as NewPermissionEntity;
        const addPermissionComponent = fixture.debugElement.query(By.css('#hxp-add-user-group'));
        addPermissionComponent.triggerEventHandler('addNewPermission', mockNewPermission);
        fixture.detectChanges();
        cancelButton.nativeElement.click();

        expect(dialogRefOpenSpy).toHaveBeenCalled();
    });
});
