/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ContentPropertyViewerActionService } from './content-properties-viewer-button-action.service';

describe('ContentPropertyViewerActionService', () => {
    const propertyViewerButtonActionService: ContentPropertyViewerActionService = new ContentPropertyViewerActionService();

    it("action is not available if there's no documents in context", () => {
        const actionContext: ActionContext = { documents: [] };
        expect(propertyViewerButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if there's multiple documents in context", () => {
        const actionContext: ActionContext = { documents: [jestMocks.fileDocument, jestMocks.nestedDocument] };
        expect(propertyViewerButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have required permission on provided document", () => {
        const actionContext: ActionContext = { documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [] }] };
        expect(propertyViewerButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is available if there's a single document and user has required permission on provided document", () => {
        const actionContext: ActionContext = { documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }] };
        expect(propertyViewerButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('should update showPropertyPanelSubject on action execution', () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }],
            showPanel: 'property',
        };
        propertyViewerButtonActionService.execute(actionContext);
        propertyViewerButtonActionService.showPropertyPanel$.subscribe((value) => {
            expect(value).toBeTruthy();
        });
    });
});
