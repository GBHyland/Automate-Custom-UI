/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService } from 'ng-mocks';
import { jestMocks } from '@hxp/workspace-hxp/shared/testing';
import { ContentShareButtonActionService } from './content-share-button-action.service';
import { ActionContext, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { MatDialog } from '@angular/material/dialog';
import { ContentShareDialogComponent } from '../content-share-dialog/content-share-dialog.component';

describe('ContentShareButtonActionService', () => {
    const mockMatDialog = MockService(MatDialog);
    const contentShareButtonActionService: ContentShareButtonActionService = new ContentShareButtonActionService(mockMatDialog);

    it("action is not available if there's no documents in context", () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [],
        };
        expect(contentShareButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have `Read` permission", () => {
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [] }],
        };
        expect(contentShareButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('action is available if user has `Read` permission', () => {
        const actionContext: ActionContext = {
            parentDocument: jestMocks.folderDocument,
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }],
        };
        expect(contentShareButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('should not open dialog on action execution', () => {
        const spy = jest.spyOn(mockMatDialog, 'open');
        const actionContext: ActionContext = {
            documents: [],
        };
        contentShareButtonActionService.execute(actionContext);
        expect(spy).not.toHaveBeenCalled();
    });

    it('should open dialog on action execution', () => {
        const spy = jest.spyOn(mockMatDialog, 'open');
        const actionContext: ActionContext = {
            documents: [{ ...jestMocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }],
        };
        contentShareButtonActionService.execute(actionContext);
        expect(spy).toHaveBeenCalledWith(ContentShareDialogComponent, {
            width: '750px',
            data: {
                sharedDocument: actionContext.documents[0],
            },
        });
    });
});
