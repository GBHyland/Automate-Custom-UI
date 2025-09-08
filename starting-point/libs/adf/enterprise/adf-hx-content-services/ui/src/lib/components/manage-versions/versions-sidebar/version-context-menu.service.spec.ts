/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { VersionContextMenuActionsService, VersionContextActionConfiguration } from './version-context-menu.service';
import { Document } from '@hylandsoftware/hxcs-js-client';
import {
    DocumentActionService,
    HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE,
    HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
} from '@alfresco/adf-hx-content-services/services';
import { MockService } from 'ng-mocks';

describe('VersionContextMenuActionsService', () => {
    let service: VersionContextMenuActionsService;
    let mockDownloadService: DocumentActionService;
    let mockShareService: DocumentActionService;
    let mockRestoreService: DocumentActionService;
    let mockEditService: DocumentActionService;
    let mockDeleteService: DocumentActionService;
    let testDocument: Document;
    let testParentDocument: Document;

    beforeEach(() => {
        mockDownloadService = MockService(DocumentActionService);
        mockShareService = MockService(DocumentActionService);
        mockRestoreService = MockService(DocumentActionService);
        mockEditService = MockService(DocumentActionService);
        mockDeleteService = MockService(DocumentActionService);

        TestBed.configureTestingModule({
            providers: [
                VersionContextMenuActionsService,
                { provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE, useValue: mockDownloadService },
                { provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE, useValue: mockShareService },
                { provide: HXP_DOCUMENT_RESTORE_VERSION_ACTION_SERVICE, useValue: mockRestoreService },
                { provide: HXP_DOCUMENT_VERSION_EDIT_ACTION_SERVICE, useValue: mockEditService },
                { provide: HXP_DOCUMENT_VERSION_DELETE_ACTION_SERVICE, useValue: mockDeleteService },
            ],
        });
        service = TestBed.inject(VersionContextMenuActionsService);
        testDocument = { sys_id: 'doc1' } as Document;
        testParentDocument = { sys_id: 'parent1' } as Document;
    });

    it('should return version context actions based on the provided document', () => {
        mockDownloadService.isAvailable = () => true;
        mockShareService.isAvailable = () => true;
        mockRestoreService.isAvailable = () => true;
        mockEditService.isAvailable = () => true;
        mockDeleteService.isAvailable = () => true;

        const contextActions: VersionContextActionConfiguration[] = service.getVersionContextActions(testDocument, testParentDocument);

        expect(contextActions.length).toBe(5);
        expect(contextActions[0].data).toEqual(testDocument);
        expect(contextActions[0].model.key).toBe('download');
        expect(contextActions[1].data).toEqual(testDocument);
        expect(contextActions[1].model.key).toBe('share');
        expect(contextActions[2].data).toEqual(testDocument);
        expect(contextActions[2].model.key).toBe('restore-version');
        expect(contextActions[3].data).toEqual(testDocument);
        expect(contextActions[3].model.key).toBe('edit-version');
        expect(contextActions[4].data).toEqual(testDocument);
        expect(contextActions[4].model.key).toBe('delete-version');
    });

    it('should set visible to false if isAvailable returns false', () => {
        mockDownloadService.isAvailable = () => false;
        mockShareService.isAvailable = () => false;
        mockRestoreService.isAvailable = () => false;
        mockEditService.isAvailable = () => false;
        mockDeleteService.isAvailable = () => false;
        const contextActions: VersionContextActionConfiguration[] = service.getVersionContextActions(testDocument, testParentDocument);
        for (const action of contextActions) {
            expect(action.model.visible).toBeFalsy();
        }
    });
});
