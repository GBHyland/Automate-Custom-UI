/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { VersionDeleteButtonActionService } from './version-delete-button-action.service';
import { MockService } from 'ng-mocks';
import { MatDialog } from '@angular/material/dialog';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';

describe('VersionDeleteButtonActionService', () => {
    const mockMatDialog = MockService(MatDialog);
    const versionDeleteButtonActionService: VersionDeleteButtonActionService = new VersionDeleteButtonActionService(mockMatDialog);

    it('should disable action when there is no document in context', () => {
        const actionContext: ActionContext = {
            documents: [],
        };

        expect(versionDeleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("should disable action when user doesn't have `Delete` permission on selected document", () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileVersionDocument, sys_effectivePermissions: [] }],
        };

        expect(versionDeleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('should disable action when selected document is not a version', () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] }],
        };

        expect(versionDeleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('should disable action when there are multiple documents in the context', () => {
        const actionContext: ActionContext = {
            documents: [
                { ...jestMocks.fileVersionDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] },
                { ...jestMocks.fileVersionDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] },
            ],
        };

        expect(versionDeleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('should enable action when user has `Delete` permission on selected document, `Delete Child` on parent document and document is a version', () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileVersionDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] }],
            parentDocument: {
                ...jestMocks.fileDocument,
                sys_effectivePermissions: [DocumentPermissions.DELETE_CHILD],
            },
        };

        expect(versionDeleteButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('should open the dialog on action execution', () => {
        const spy = jest.spyOn(mockMatDialog, 'open');

        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileVersionDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] }],
        };

        versionDeleteButtonActionService.execute(actionContext);

        expect(spy).toHaveBeenCalled();
    });
});
