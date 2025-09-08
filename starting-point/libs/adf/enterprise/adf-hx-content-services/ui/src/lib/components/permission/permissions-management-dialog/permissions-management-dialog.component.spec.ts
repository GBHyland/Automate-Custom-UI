/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { PermissionsManagementDialogComponent } from './permissions-management-dialog.component';
import {
    DocumentService,
    PermissionsManagementFacade,
    IDENTITY_USER_SERVICE_TOKEN,
    IIdentityUserService,
    provideAdfEnterpriseAdfHxContentServicesServices,
    PermissionsManagementStateService,
    Permission,
    PermissionsManagementRow,
} from '@alfresco/adf-hx-content-services/services';
import { of } from 'rxjs';
import { ButtonHarnessUtils, IconHarnessUtils, TabsHarnessUtils } from '@alfresco-dbp/shared-testing/util/component-harnesses';
import { MockProvider } from 'ng-mocks';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { By } from '@angular/platform-browser';
import { ClosePermissionDialogComponent } from '../cancel-permission-dialog/close-permission-dialog.component';

const mockIdentityUserService = {
    getCurrentUserInfo: () => ({ id: '0000-fake-user-uuid-0000' }),
} as unknown as IIdentityUserService;

describe('PermissionsManagementDialogComponent', () => {
    let fixture: ComponentFixture<PermissionsManagementDialogComponent>;
    let component: PermissionsManagementDialogComponent;

    const mockDialogRef = {
        close: jest.fn(),
        afterClosed: jest.fn(() => of({ save: false })),
    };

    const documentWithAcl = {
        ...jestMocks.documentWithAcl,
        sys_effectiveAcl: [
            ...jestMocks.documentWithAcl.sys_acl,
            {
                creator: 'creator-id-1',
                permission: 'Everything',
                group: {
                    id: 'id-6',
                    name: 'groupName6',
                },
                granted: true,
                status: 'EFFECTIVE',
            },
            {
                creator: 'creator-id-1',
                permission: 'Everything',
                user: {
                    id: 'id-5',
                    lastName: 'Lenders',
                    firstName: 'Mark',
                },
                granted: true,
                status: 'EFFECTIVE',
            },
        ],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [PermissionsManagementDialogComponent, NoopTranslateModule, NoopAnimationsModule],
            providers: [
                provideAdfEnterpriseAdfHxContentServicesServices(),
                {
                    provide: MAT_DIALOG_DATA,
                    useValue: {
                        document: documentWithAcl,
                    },
                },
                { provide: MatDialogRef, useValue: mockDialogRef },
                mockHxcsJsClientConfigurationService,
                DocumentService,
                MockProvider(IDENTITY_USER_SERVICE_TOKEN, mockIdentityUserService),
                PermissionsManagementFacade,
                PermissionsManagementStateService,
            ],
        });

        fixture = TestBed.createComponent(PermissionsManagementDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    afterEach(() => {
        const dialogRefSpy = TestBed.inject(MatDialogRef);
        (dialogRefSpy?.close as jest.Mock).mockReset();
    });

    it('should receive selected Document as dialog data', () => {
        expect(component.document).toBe(documentWithAcl);
    });

    it('should close the permission dialog when cancel button of Cancel dialog is clicked', async () => {
        const dialogRef = TestBed.inject(MatDialogRef<PermissionsManagementDialogComponent>);
        const crossButton = await IconHarnessUtils.getIcon({
            fixture,
            iconFilters: {
                name: 'close',
            },
        });
        const host = await crossButton.host();
        await host.click();

        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should open close popup when "X" button clicked and document is edited', async () => {
        const matDialogService = (component as any).dialog; // TestBed.inject(MatDialog);
        const dialogRefOpenSpy = jest
            .spyOn(matDialogService, 'open')
            .mockReturnValue(mockDialogRef as unknown as MatDialogRef<ClosePermissionDialogComponent>);
        const crossButton = await IconHarnessUtils.getIcon({
            fixture,
            iconFilters: {
                name: 'close',
            },
        });

        const host = await crossButton.host();
        await host.click();

        expect(dialogRefOpenSpy).not.toHaveBeenCalled();

        const mockPermission: Permission = 'ReadWrite';
        const editPermissionComponent = fixture.debugElement.query(By.css('hxp-permissions'));

        const mockPermissionsManagementRow: PermissionsManagementRow = jestMocks.userList[0] as PermissionsManagementRow;
        editPermissionComponent.triggerEventHandler('changePermission', {
            mockPermission,
            mockPermissionsManagementRow,
        });

        await host.click();

        expect(dialogRefOpenSpy).toHaveBeenCalled();
    });

    it('should open cancel popup when cancel button clicked and document is edited', async () => {
        const matDialogService = (component as any).dialog;
        const dialogRefOpenSpy = jest.spyOn(matDialogService, 'open');
        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-cancel-button',
            },
        });

        expect(dialogRefOpenSpy).not.toHaveBeenCalled();

        const mockPermission: Permission = 'ReadWrite';
        const editPermissionComponent = fixture.debugElement.query(By.css('hxp-permissions'));
        const mockPermissionsManagementRow: PermissionsManagementRow = jestMocks.userList[0] as PermissionsManagementRow;
        editPermissionComponent.triggerEventHandler('changePermission', {
            mockPermission,
            mockPermissionsManagementRow,
        });

        await ButtonHarnessUtils.clickButton({
            fixture,
            buttonFilters: {
                selector: '.hxp-cancel-button',
            },
        });

        expect(dialogRefOpenSpy).toHaveBeenCalled();
    });

    it('should display two columns on Individual Users tab', async () => {
        const tabs = await TabsHarnessUtils.getTabs({ fixture });
        await tabs[1].select();
        const columns = fixture.debugElement.queryAll(By.css('th'));
        expect(columns.length).toBe(2);
    });

    it('should display three columns on User Groups tab', async () => {
        const tabs = await TabsHarnessUtils.getTabs({ fixture });
        await tabs[0].select();
        const columns = fixture.debugElement.queryAll(By.css('th'));

        expect(columns.length).toBe(3);
    });

    it('should display "Cannot be changed" label if a User Group inherits Everything as permission', async () => {
        const tabs = await TabsHarnessUtils.getTabs({ fixture });
        await tabs[0].select();
        const cannotBeChangedCell = fixture.debugElement.queryAll(By.css('.hxp-cannot-be-changed'));

        expect(cannotBeChangedCell.length).toBe(1);
        expect(cannotBeChangedCell[0].nativeElement.textContent.trim()).toBe('PERMISSIONS_MANAGEMENT_ACTION.PERMISSIONS_TABLE.CANNOT_BE_CHANGED');
    });

    it('should not display "Cannot be changed" label in the Individual User tab', async () => {
        const tabs = await TabsHarnessUtils.getTabs({ fixture });
        await tabs[1].select();
        const cannotBeChangedCell = fixture.debugElement.queryAll(By.css('.hxp-cannot-be-changed'));

        expect(cannotBeChangedCell.length).toBe(0);
    });

    it('should close the permission dialog when cancel button of Cancel dialog is clicked', async () => {
        const dialogRef = TestBed.inject(MatDialogRef<PermissionsManagementDialogComponent>);
        const crossButton = await IconHarnessUtils.getIcon({
            fixture,
            iconFilters: {
                name: 'close',
            },
        });
        const host = await crossButton.host();
        await host.click();

        expect(dialogRef.close).toHaveBeenCalled();
    });

    it('should save permission, require a reload and close the Dialog', async () => {
        const dialogRefSpy = TestBed.inject(MatDialogRef);
        const permissionsManagementFacade = fixture.debugElement.injector.get<PermissionsManagementFacade>(PermissionsManagementFacade);
        const documentService = TestBed.inject(DocumentService);
        jest.spyOn(documentService, 'requestReload').mockImplementation(() => {});
        jest.spyOn(permissionsManagementFacade, 'updateDocumentAcl').mockReturnValue(of(true));

        expect(dialogRefSpy.close).not.toHaveBeenCalled();
        expect(documentService.requestReload).not.toHaveBeenCalled();
        expect(permissionsManagementFacade.updateDocumentAcl).not.toHaveBeenCalled();

        const mockPermission: Permission = 'ReadWrite';
        const editPermissionComponent = fixture.debugElement.query(By.css('hxp-permissions'));
        const mockPermissionsManagementRow: PermissionsManagementRow = jestMocks.userList[0] as PermissionsManagementRow;
        editPermissionComponent.triggerEventHandler('changePermission', {
            mockPermission,
            mockPermissionsManagementRow,
        });
        fixture.detectChanges();
        const nodeContainer = fixture.debugElement.query(By.css('.hxp-save-permission-button'));
        nodeContainer.nativeElement.click();
        fixture.detectChanges();
        fixture.whenStable().then(() => {
            expect(permissionsManagementFacade.updateDocumentAcl).toHaveBeenCalled();
            expect(documentService.requestReload).toHaveBeenCalled();
            expect(dialogRefSpy.close).toHaveBeenCalled();
        });
    });

    it('should have permission and selected user when permission edited', () => {
        const permissionsManagementFacade = fixture.debugElement.injector.get<PermissionsManagementFacade>(PermissionsManagementFacade);
        const mockPermission: Permission = 'ReadWrite';
        const editPermissionComponent = fixture.debugElement.query(By.css('hxp-permissions'));
        const mockPermissionsManagementRow: PermissionsManagementRow = jestMocks.userList[0] as PermissionsManagementRow;
        jest.spyOn(permissionsManagementFacade, 'onEditPermissionsManagementRow').mockImplementation(() => {});

        expect(permissionsManagementFacade.onEditPermissionsManagementRow).not.toHaveBeenCalled();

        editPermissionComponent.triggerEventHandler('changePermission', {
            mockPermission,
            mockPermissionsManagementRow,
        });
        fixture.whenStable().then(() => {
            expect(permissionsManagementFacade.onEditPermissionsManagementRow).toHaveBeenCalledTimes(1);
        });
    });
});
