/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService } from 'ng-mocks';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import {
    ActionContext,
    DocumentPermissions,
    FileDownloadService,
    IsSingleDocumentWithMainBlobService,
} from '@alfresco/adf-hx-content-services/services';
import { SingleItemDownloadButtonActionService } from './single-item-download-button-action.service';

describe('DocumentCopyButtonActionService', () => {
    const service = new IsSingleDocumentWithMainBlobService();
    const mockFileDownloadService = MockService(FileDownloadService);
    const singleItemDownloadButtonActionService = new SingleItemDownloadButtonActionService(mockFileDownloadService, service);

    it("action is not available if there's no documents in context", () => {
        const actionContext: ActionContext = {
            documents: [],
        };
        expect(singleItemDownloadButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if there's no blob in the file", () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sysfile_blob: {} }],
        };
        expect(singleItemDownloadButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have `Read` permission on selected document", () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [] }],
        };
        expect(singleItemDownloadButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('action is available if user has `Read` permission on selected document and document has a main blob', () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }],
        };

        expect(singleItemDownloadButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });
});
