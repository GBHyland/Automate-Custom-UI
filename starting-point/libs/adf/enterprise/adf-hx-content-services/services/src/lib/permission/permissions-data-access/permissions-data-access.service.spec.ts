/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NoopTranslateModule } from '@alfresco/adf-core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ACE } from '@hylandsoftware/hxcs-js-client';
import { firstValueFrom, of, throwError } from 'rxjs';
import { PermissionsDataAccessService } from './permissions-data-access.service';
import { DocumentService } from '../../document/document.service';
import { provideAdfEnterpriseAdfHxContentServicesServices } from '../../adf-enterprise-adf-hx-content-services-services.providers';
import { HxpNotificationService } from '../../notification/hxp-notification.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';
import { UserType } from '../models/user-type.enum';

describe('PermissionsDataAccessService', () => {
    let permissionsDataAccessService: PermissionsDataAccessService;
    let documentService: DocumentService;
    let notificationSuccessSpy: jest.SpyInstance;
    let notificationErrorSpy: jest.SpyInstance;
    let sys_acl: ACE[];

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [NoopAnimationsModule, NoopTranslateModule, MatSnackBarModule],
            providers: [
                provideHttpClientTesting(),
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                DocumentService,
            ],
        });
        permissionsDataAccessService = TestBed.inject(PermissionsDataAccessService);
        documentService = TestBed.inject(DocumentService);
        const notificationService = TestBed.inject(HxpNotificationService);
        notificationSuccessSpy = jest.spyOn(notificationService, 'showSuccess');
        notificationErrorSpy = jest.spyOn(notificationService, 'showError');
        sys_acl = [...jestMocks.documentWithAcl.sys_effectiveAcl];
    });

    it('should call updateDocument and show success message for save', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const updateDocumentSpy = jest.spyOn(documentService, 'updateDocument').mockReturnValue(of(jestMocks.documentWithAcl));

        const hasBeenSaved = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl));

        expect(updateDocumentSpy).toHaveBeenCalledWith(documentId, { sys_acl });
        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(notificationSuccessSpy).toHaveBeenCalledWith('PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.SAVE_SUCCESS');
        expect(notificationErrorSpy).toHaveBeenCalledTimes(0);
        expect(hasBeenSaved).toBe(true);
    });

    it('should call updateDocument and show success message for group restore', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const updateDocumentSpy = jest.spyOn(documentService, 'updateDocument').mockReturnValue(of(jestMocks.documentWithAcl));

        const hasBeenSaved = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl, UserType.GROUPS));

        expect(updateDocumentSpy).toHaveBeenCalledWith(documentId, { sys_acl });
        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(notificationSuccessSpy).toHaveBeenCalledWith('PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_GROUP_SUCCESS');
        expect(notificationErrorSpy).toHaveBeenCalledTimes(0);
        expect(hasBeenSaved).toBe(true);
    });

    it('should call updateDocument and show success message for user restore', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const updateDocumentSpy = jest.spyOn(documentService, 'updateDocument').mockReturnValue(of(jestMocks.documentWithAcl));

        const hasBeenSaved = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl, UserType.USERS));

        expect(updateDocumentSpy).toHaveBeenCalledWith(documentId, { sys_acl });
        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(notificationSuccessSpy).toHaveBeenCalledWith('PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_USER_SUCCESS');
        expect(notificationErrorSpy).toHaveBeenCalledTimes(0);
        expect(hasBeenSaved).toBe(true);
    });

    it('should call updateDocument and show success message for ALL restore', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const updateDocumentSpy = jest.spyOn(documentService, 'updateDocument').mockReturnValue(of(jestMocks.documentWithAcl));

        const hasBeenSaved = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl, UserType.ALL));

        expect(updateDocumentSpy).toHaveBeenCalledWith(documentId, { sys_acl });
        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(notificationSuccessSpy).toHaveBeenCalledWith('PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_SUCCESS'); // Fix expected message
        expect(notificationErrorSpy).toHaveBeenCalledTimes(0);
        expect(hasBeenSaved).toBe(true);
    });

    it('should call updateDocument and show error message for save failure', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const updateDocumentSpy = jest.spyOn(documentService, 'updateDocument').mockReturnValue(throwError(''));

        const hasBeenSaved = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl));

        expect(updateDocumentSpy).toHaveBeenCalledWith(documentId, { sys_acl });
        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(notificationErrorSpy).toHaveBeenCalledWith('PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.SAVE_ERROR');
        expect(notificationSuccessSpy).toHaveBeenCalledTimes(0);
        expect(hasBeenSaved).toBe(false);
    });

    it('should call updateDocument and show error message for restore failures', async () => {
        const documentId = jestMocks.fileDocument.sys_id;
        const updateDocumentSpy = jest.spyOn(documentService, 'updateDocument').mockReturnValue(throwError(''));

        const hasBeenSavedForGroup = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl, UserType.GROUPS));

        expect(updateDocumentSpy).toHaveBeenCalledWith(documentId, { sys_acl });
        expect(updateDocumentSpy).toHaveBeenCalledTimes(1);
        expect(notificationErrorSpy).toHaveBeenCalledWith('PERMISSIONS_MANAGEMENT_ACTION_STATUS.SNACKBAR.RESTORE_ERROR');
        expect(notificationSuccessSpy).toHaveBeenCalledTimes(0);
        expect(hasBeenSavedForGroup).toBe(false);

        const hasBeenSavedForUser = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl, UserType.USERS));

        expect(updateDocumentSpy).toHaveBeenCalledTimes(2);
        expect(notificationErrorSpy).toHaveBeenCalledTimes(2);
        expect(hasBeenSavedForUser).toBe(false);

        const hasBeenSavedForAll = await firstValueFrom(permissionsDataAccessService.updateDocument(documentId, sys_acl, UserType.ALL));

        expect(updateDocumentSpy).toHaveBeenCalledTimes(3);
        expect(notificationErrorSpy).toHaveBeenCalledTimes(3);
        expect(hasBeenSavedForAll).toBe(false);
    });
});
