/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MockService } from 'ng-mocks';
import { CopyButtonActionService } from './document-copy-button-action.service';
import { MatDialog } from '@angular/material/dialog';
import { ActionContext, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { mocks } from '@hxp/workspace-hxp/shared/testing';
import { DocumentCopyDialogComponent } from '../document-copy-dialog/document-copy-dialog.component';
import { DialogConfig } from '@alfresco/adf-hx-content-services/ui';

describe('DocumentCopyButtonActionService', () => {
    const mockMatDialog = MockService(MatDialog);
    const copyButtonActionService: CopyButtonActionService = new CopyButtonActionService(mockMatDialog);

    it("action is not available if there' no documents in context", () => {
        const actionContext: ActionContext = {
            documents: [],
        };
        expect(copyButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it("action is not available if user doesn't have `Read` permission on provided document", () => {
        const actionContext: ActionContext = {
            documents: [{ ...mocks.fileDocument, sys_effectivePermissions: [] }],
        };
        expect(copyButtonActionService.isAvailable(actionContext)).toBeFalsy();
    });

    it('action is available if user has `Read` permission on provided document', () => {
        const actionContext: ActionContext = {
            documents: [{ ...mocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }],
        };
        expect(copyButtonActionService.isAvailable(actionContext)).toBeTruthy();
    });

    it('should open dialog on action execution', () => {
        const spy = spyOn(mockMatDialog, 'open');
        const actionContext: ActionContext = {
            parentDocument: mocks.folderDocument,
            documents: [{ ...mocks.fileDocument, sys_effectivePermissions: [DocumentPermissions.READ] }],
        };
        copyButtonActionService.execute(actionContext);
        expect(spy).toHaveBeenCalledWith(DocumentCopyDialogComponent, {
            width: DialogConfig.small.width,
            height: DialogConfig.small.height,
            data: {
                parentDocument: actionContext.parentDocument,
                documentToCopy: actionContext.documents[0],
            },
        });
    });
});
