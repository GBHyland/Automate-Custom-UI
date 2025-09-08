/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ManageVersionsButtonActionService } from './manage-versions-button-action.service';
import { ActionContext } from '../../context-menu-actions/actions/action-context.interface';
import { DocumentPermissions } from '../../document/configs/document-permissions.enum';

describe('ManageVersionsButtonActionService', () => {
    const manageVersionsButtonActionService: ManageVersionsButtonActionService = new ManageVersionsButtonActionService();

    it("should not be available if there's no documents in context", () => {
        const actionContext: ActionContext = { documents: [] };
        expect(manageVersionsButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("should not be available if there's multiple documents in context", () => {
        const actionContext: ActionContext = { documents: [jestMocks.fileDocument, jestMocks.nestedDocument] };
        expect(manageVersionsButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('should be available if document support versioning and user has required permission on provided document', () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.versionSupportedDocument, sys_effectivePermissions: [DocumentPermissions.READ_VERSION] }],
        };
        expect(manageVersionsButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('should update showVersionsPanelSubject on action execution', () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.versionSupportedDocument, sys_effectivePermissions: [DocumentPermissions.READ_VERSION] }],
            showPanel: 'version',
        };
        manageVersionsButtonActionService.execute(actionContext);
        manageVersionsButtonActionService.showVersionsPanel$.subscribe((value) => {
            expect(value).toBeTruthy();
        });
    });
});
