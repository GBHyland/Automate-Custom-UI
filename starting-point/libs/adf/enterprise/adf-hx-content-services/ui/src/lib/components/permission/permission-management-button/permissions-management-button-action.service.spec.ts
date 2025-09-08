/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
    ActionContext,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    DocumentService,
    DocumentPermissions,
    PermissionsPanelRequestService,
    PermissionsManagementComponentType,
    PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
    DocumentVersionsService,
} from '@alfresco/adf-hx-content-services/services';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { PermissionsButtonActionService } from './permissions-management-button-action.service';
import { DIALOG_MIN_WIDTH, PermissionsManagementDialogComponent } from '../permissions-management-dialog/permissions-management-dialog.component';
import { TestBed } from '@angular/core/testing';
import { NoopTranslateModule } from '@alfresco/adf-core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CONTEXT_MENU_ACTIONS_PROVIDERS } from '../../../adf-enterprise-adf-hx-content-services-ui.providers';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { MockComponent } from 'ng-mocks';
import { Subject } from 'rxjs';

const configureTestingModule = (optionalProviders: any[] = []) => {
    TestBed.configureTestingModule({
        imports: [NoopTranslateModule, NoopAnimationsModule, MatDialogModule, MockComponent(PermissionsManagementDialogComponent)],
        providers: [
            ...CONTEXT_MENU_ACTIONS_PROVIDERS,
            PermissionsPanelRequestService,
            mockHxcsJsClientConfigurationService,
            DocumentService,
            ...optionalProviders,
        ],
    });

    return TestBed.inject(HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE) as PermissionsButtonActionService;
};

describe('PermissionsButtonActionService componentType `dialog` (default)', () => {
    let permissionsButtonActionService: PermissionsButtonActionService;
    const documentVersionsServiceSpy = {
        versionDeleted$: new Subject<void>(),
    };

    beforeEach(() => {
        permissionsButtonActionService = configureTestingModule([{ provide: DocumentVersionsService, useValue: documentVersionsServiceSpy }]);
    });

    it("action is not available if there's no document in context", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [],
        };
        expect(permissionsButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have `Write` and `ManageSecurity` permissions on provided document", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [] }],
        };
        expect(permissionsButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user has `Write` permission, but doesn't have `ManageSecurity` permission on provided document", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [
                {
                    ...jestMocks.fileDocument,
                    sys_effectivePermissions: [DocumentPermissions.WRITE],
                },
            ],
        };
        expect(permissionsButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user has `ManageSecurity` permission, but doesn't have `Write` permission on provided document", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [
                {
                    ...jestMocks.fileDocument,
                    sys_effectivePermissions: [DocumentPermissions.MANAGE_SECURITY],
                },
            ],
        };
        expect(permissionsButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('action is available if user has `ManageSecurity` and `Write` permissions on provided document', () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [
                {
                    ...jestMocks.fileDocument,
                    sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.MANAGE_SECURITY],
                },
            ],
        };
        expect(permissionsButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('should open dialog on action execution', () => {
        const dialogRef = TestBed.inject(MatDialog);
        const spy = jest.spyOn(dialogRef, 'open');
        const document = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.MANAGE_SECURITY],
        };
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [document],
            shouldRedirect: false,
            refererURL: '',
        };
        permissionsButtonActionService.execute(actionContext);
        expect(spy).toHaveBeenCalledWith(PermissionsManagementDialogComponent, {
            width: DIALOG_MIN_WIDTH + 'px',
            height: '100vh',
            position: { top: '0px', right: '0px' },
            data: {
                document,
                parentDocument: actionContext.parentDocument,
            },
            disableClose: true,
        });
    });
});

describe('PermissionsButtonActionService componentType `panel`', () => {
    let permissionsButtonActionService: PermissionsButtonActionService;

    beforeEach(async () => {
        permissionsButtonActionService = configureTestingModule([
            {
                provide: PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
                useValue: 'panel' as PermissionsManagementComponentType,
            },
        ]);
    });

    it('should request to open the Permissions Management Panel', () => {
        const permissionsPanelRequestService = TestBed.inject(PermissionsPanelRequestService);
        const spy = jest.spyOn(permissionsPanelRequestService, 'requestOpenPanel');
        const document = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.MANAGE_SECURITY],
        };
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [document],
            shouldRedirect: false,
            refererURL: '',
        };
        permissionsButtonActionService.execute(actionContext);
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
