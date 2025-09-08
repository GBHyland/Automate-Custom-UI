/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService } from 'ng-mocks';
import { MatDialog } from '@angular/material/dialog';
import { ActionContext, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { DeleteButtonActionService } from './content-delete-button-action.service';
import { ContentDeleteConfirmationDialogComponent } from '../content-delete-confirmation-dialog/content-delete-confirmation-dialog.component';

describe('DeleteButtonActionService', () => {
    const mockMatDialog = MockService(MatDialog);
    const deleteButtonActionService: DeleteButtonActionService = new DeleteButtonActionService(mockMatDialog);

    it('action is not available if parent document is not in context', () => {
        const actionContext: ActionContext = {
            documents: [jestMocks.fileDocument],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if there's no documents in context", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if there's multiple documents in context", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [jestMocks.fileDocument, jestMocks.nestedDocument],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have `DeleteChild` permission on parent document", () => {
        const actionContext: ActionContext = {
            parentDocument: { ...jestMocks.folderDocument, sys_effectivePermissions: [] },
            documents: [jestMocks.fileDocument],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have `Delete` permission on provided document", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [] }],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('action is available if user has `Delete` permission on provided document and `DeleteChild` permission on parent document', () => {
        const actionContext: ActionContext = {
            parentDocument: { ...jestMocks.folderDocument, sys_effectivePermissions: [DocumentPermissions.DELETE_CHILD] },
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] }],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('action is not available if document status is in BLOCK_DELETE_STATUSES (e.g., UnderRetention)', () => {
        const retainedDoc = {
            ...jestMocks.fileDocument,
            sys_effectivePermissions: [DocumentPermissions.DELETE],
            sys_mixinTypes: ['SysGovernable', 'SysFilish'],
            sysgov_isRecord: true,
            sysgov_retainUntil: '2999-12-31T00:00:00Z',
        };

        const parent = {
            ...jestMocks.folderDocument,
            sys_effectivePermissions: [DocumentPermissions.DELETE_CHILD],
        };

        const actionContext: ActionContext = {
            parentDocument: parent,
            documents: [retainedDoc],
        };

        expect(deleteButtonActionService.isAvailable(actionContext)).toBe(false);
    });

    it('should open dialog on action execution', () => {
        const spy = jest.spyOn(mockMatDialog, 'open');
        const actionContext: ActionContext = {
            parentDocument: { ...jestMocks.folderDocument, sys_effectivePermissions: [DocumentPermissions.DELETE_CHILD] },
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.DELETE] }],
            shouldRedirect: false,
            refererURL: '',
        };
        deleteButtonActionService.execute(actionContext);

        expect(spy).toHaveBeenCalledWith(ContentDeleteConfirmationDialogComponent, {
            data: {
                documents: actionContext.documents,
                shouldRedirect: false,
                refererURL: '',
            },
        });
    });
});
