/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CopyDialogData, DocumentCopyDialogComponent } from '../document-copy-dialog/document-copy-dialog.component';
import { hasPermission, ActionContext, DocumentActionService, DocumentPermissions, isVersion } from '@alfresco/adf-hx-content-services/services';
import { ROOT_DOCUMENT } from '@alfresco/adf-hx-content-services/api';
import { DialogConfig } from '@alfresco/adf-hx-content-services/ui';

@Injectable()
export class CopyButtonActionService extends DocumentActionService {
    constructor(public dialog: MatDialog) {
        super();
    }

    public isAvailable(context: ActionContext): boolean {
        return context.documents?.length > 0 && hasPermission(context.documents[0], DocumentPermissions.READ) && !isVersion(context.documents[0]);
    }

    public execute(context: ActionContext): void {
        if (context.documents?.length > 0) {
            this.dialog.open<DocumentCopyDialogComponent, CopyDialogData>(DocumentCopyDialogComponent, {
                width: DialogConfig.small.width,
                height: DialogConfig.small.height,
                data: {
                    parentDocument: context.parentDocument || ROOT_DOCUMENT,
                    documentToCopy: context.documents[0],
                },
            });
        }
    }
}
