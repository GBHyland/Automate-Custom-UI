/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { DataRow } from '@alfresco/adf-core';
import { ContextMenuActionsService, ContextActionConfiguration } from './context-menu.service';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { mockHxcsJsClientConfigurationService, ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { MockService } from 'ng-mocks';
import {
    HXP_DOCUMENT_COPY_ACTION_SERVICE,
    HXP_DOCUMENT_DELETE_ACTION_SERVICE,
    HXP_DOCUMENT_MOVE_ACTION_SERVICE,
    HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
    HXP_DOCUMENT_SHARE_ACTION_SERVICE,
    HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
} from '../actions/action.tokens';
import { DocumentActionService } from '../actions/document-action.service';
import { provideAdfEnterpriseAdfHxContentServicesServices } from '../../adf-enterprise-adf-hx-content-services-services.providers';
import { provideMockFeatureFlags } from '@alfresco/adf-core/feature-flags';
import { ManageVersionsButtonActionService } from '../../manage-versions/manage-versions-button/manage-versions-button-action.service';

describe('ContextMenuActionsService', () => {
    let service: ContextMenuActionsService;

    const mockDocumentCopyActionService: DocumentActionService = MockService(DocumentActionService);
    const mockDocumentMoveActionService: DocumentActionService = MockService(DocumentActionService);
    const mockContentShareButtonActionService: DocumentActionService = MockService(DocumentActionService);
    const mockDeleteButtonActionService: DocumentActionService = MockService(DocumentActionService);
    const mockPermissionsButtonActionService: DocumentActionService = MockService(DocumentActionService);
    const mockSingleItemDownloadButtonActionService: DocumentActionService = MockService(DocumentActionService);
    const mockSingleItemInfoButtonActionService: DocumentActionService = MockService(DocumentActionService);
    const mockManageVersionsButtonActionService = MockService(ManageVersionsButtonActionService);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                provideHttpClientTesting(),
                provideAdfEnterpriseAdfHxContentServicesServices(),
                mockHxcsJsClientConfigurationService,
                {
                    provide: HXP_DOCUMENT_MOVE_ACTION_SERVICE,
                    useValue: mockDocumentMoveActionService,
                },
                {
                    provide: HXP_DOCUMENT_SHARE_ACTION_SERVICE,
                    useValue: mockContentShareButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_DELETE_ACTION_SERVICE,
                    useValue: mockDeleteButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_COPY_ACTION_SERVICE,
                    useValue: mockDocumentCopyActionService,
                },
                {
                    provide: HXP_DOCUMENT_PERMISSIONS_ACTION_SERVICE,
                    useValue: mockPermissionsButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_SINGLE_ITEM_DOWNLOAD_ACTION_SERVICE,
                    useValue: mockSingleItemDownloadButtonActionService,
                },
                {
                    provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
                    useValue: mockSingleItemInfoButtonActionService,
                },
                {
                    provide: ManageVersionsButtonActionService,
                    useValue: mockManageVersionsButtonActionService,
                },
                provideMockFeatureFlags({ 'workspace-versioning': false }),
            ],
        });
        service = TestBed.inject(ContextMenuActionsService);
        mockDocumentMoveActionService.isAvailable = () => true;
        mockContentShareButtonActionService.isAvailable = () => true;
        mockDeleteButtonActionService.isAvailable = () => true;
        mockDocumentCopyActionService.isAvailable = () => true;
        mockPermissionsButtonActionService.isAvailable = () => true;
        mockSingleItemDownloadButtonActionService.isAvailable = () => true;
        mockSingleItemInfoButtonActionService.isAvailable = () => true;
        mockManageVersionsButtonActionService.isAvailable = () => true;
    });

    it('should return context actions based on the provided row data', () => {
        const rowData: DataRow = {
            isSelected: false,
            hasValue: () => true,
            getValue: () => {},
            obj: jestMocks.fileDocument,
        };

        const contextActions: ContextActionConfiguration[] = service.getContextActions(jestMocks.fileDocument, ROOT_DOCUMENT);

        expect(contextActions.length).toBe(8);
        expect(contextActions[0].data).toEqual(rowData['obj']);
        expect(contextActions[0].model.key).toBe('download');
        expect(contextActions[1].data).toEqual(rowData['obj']);
        expect(contextActions[1].model.key).toBe('share');
        expect(contextActions[2].data).toEqual(rowData['obj']);
        expect(contextActions[2].model.key).toBe('delete');
        expect(contextActions[3].data).toEqual(rowData['obj']);
        expect(contextActions[3].model.key).toBe('copy');
        expect(contextActions[4].data).toEqual(rowData['obj']);
        expect(contextActions[4].model.key).toBe('move');
        expect(contextActions[5].data).toEqual(rowData['obj']);
        expect(contextActions[5].model.key).toBe('permissions-management');
        expect(contextActions[6].data).toEqual(rowData['obj']);
        expect(contextActions[6].model.key).toBe('doc-info');
        expect(contextActions[7].data).toEqual(rowData['obj']);
        expect(contextActions[7].model.key).toBe('manage-versions');
    });

    it('should not show context action move when folder is selected', () => {
        mockDocumentMoveActionService.isAvailable = () => false;

        const contextActions: ContextActionConfiguration[] = service.getContextActions(jestMocks.fileDocument, ROOT_DOCUMENT);

        expect(contextActions[4].model.key).toBe('move');
        expect(contextActions[4].model.visible).toBeFalsy();
    });
});
