/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { ActionContext, DocumentPermissions, DocumentService, HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { CreateDocumentVersionActionService } from './document-version.service';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { mockHxcsJsClientConfigurationService } from '@alfresco/adf-hx-content-services/api';

describe('CreateDocumentVersionActionService', () => {
    let createDocumentVersionActionService: CreateDocumentVersionActionService;
    const documentServiceSpy = jasmine.createSpyObj('DocumentService', ['createDocumentVersion']);
    const hxpNotificationServiceSpy = jasmine.createSpyObj('HxpNotificationService', ['showError', 'showSuccess']);

    const versionableDocument = {
        ...mocks.fileDocument,
        sys_mixinTypes: ['SysVersionable'],
        sysver_isCheckedIn: false,
        sysver_isVersion: false,
        sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.CREATE_VERSION],
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                mockHxcsJsClientConfigurationService,
                { provide: DocumentService, useValue: documentServiceSpy },
                { provide: HxpNotificationService, useValue: hxpNotificationServiceSpy },
            ],
        });

        createDocumentVersionActionService = TestBed.inject(CreateDocumentVersionActionService);
        documentServiceSpy.createDocumentVersion.calls.reset();
    });

    it('should return true if the document is versionable, is not checked in, not a version, and has Write and CreateVersion permissions', () => {
        const context: ActionContext = { documents: [{ ...versionableDocument }] };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeTrue();
    });

    it('should return false if the document does not have Write permission', () => {
        const context: ActionContext = {
            documents: [
                {
                    ...mocks.fileDocument,
                    sysver_isCheckedIn: false,
                    sysver_isVersion: false,
                    sys_effectivePermissions: [DocumentPermissions.CREATE_VERSION],
                },
            ],
        };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeFalse();
    });

    it('should return false if the document does not have CreateVersion permission', () => {
        const context: ActionContext = {
            documents: [
                { ...mocks.fileDocument, sysver_isCheckedIn: false, sysver_isVersion: false, sys_effectivePermissions: [DocumentPermissions.WRITE] },
            ],
        };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeFalse();
    });

    it('should return false if the document is checked in', () => {
        const context: ActionContext = {
            documents: [
                {
                    ...mocks.fileDocument,
                    sysver_isCheckedIn: true,
                    sysver_isVersion: false,
                    sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.CREATE_VERSION],
                },
            ],
        };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeFalse();
    });

    it('should return false if the document is a version', () => {
        const context: ActionContext = {
            documents: [
                {
                    ...mocks.fileDocument,
                    sysver_isCheckedIn: false,
                    sysver_isVersion: true,
                    sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.CREATE_VERSION],
                },
            ],
        };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeFalse();
    });

    it('should return false if the document is not versionable', () => {
        const context: ActionContext = {
            documents: [
                {
                    ...mocks.fileDocument,
                    sysver_isCheckedIn: false,
                    sysver_isVersion: false,
                    sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.CREATE_VERSION],
                },
            ],
        };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeFalse();
    });

    it('should return false if there are multiple documents', () => {
        const context: ActionContext = {
            documents: [
                {
                    ...mocks.fileDocument,
                    sysver_isCheckedIn: false,
                    sysver_isVersion: false,
                    sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.CREATE_VERSION],
                },
                {
                    ...mocks.fileDocument,
                    sysver_isCheckedIn: false,
                    sysver_isVersion: false,
                    sys_effectivePermissions: [DocumentPermissions.WRITE, DocumentPermissions.CREATE_VERSION],
                },
            ],
        };
        expect(createDocumentVersionActionService.isAvailable(context)).toBeFalse();
    });

    it('should call createDocumentVersion with correct document id', async () => {
        const context: ActionContext = { documents: [{ ...versionableDocument }] };

        documentServiceSpy.createDocumentVersion.and.returnValue(Promise.resolve({ document: mocks.fileDocument }));

        await createDocumentVersionActionService.execute(context);

        expect(documentServiceSpy.createDocumentVersion).toHaveBeenCalledWith(versionableDocument.sys_id);
    });

    it('should call checkin and showSuccess on successful execution', async () => {
        const context: ActionContext = { documents: [{ ...versionableDocument }] };

        documentServiceSpy.createDocumentVersion.and.returnValue(Promise.resolve({ document: mocks.fileDocument }));

        await createDocumentVersionActionService.execute(context);

        expect(hxpNotificationServiceSpy.showSuccess).toHaveBeenCalledWith('DOCUMENT_VERSION.SNACKBAR.CREATE_SUCCESS');
    });

    it('should call checkin and showError on failed execution', async () => {
        const context: ActionContext = { documents: [{ ...versionableDocument }] };

        documentServiceSpy.createDocumentVersion.and.returnValue(Promise.reject());

        await createDocumentVersionActionService.execute(context);

        expect(hxpNotificationServiceSpy.showError).toHaveBeenCalledWith('DOCUMENT_VERSION.SNACKBAR.CREATE_ERROR');
    });
});
