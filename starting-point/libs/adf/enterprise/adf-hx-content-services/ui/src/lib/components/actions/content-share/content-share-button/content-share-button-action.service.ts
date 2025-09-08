/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { hasPermission, ActionContext, DocumentActionService, DocumentPermissions } from '@alfresco/adf-hx-content-services/services';
import { MatDialog } from '@angular/material/dialog';
import { ContentShareDialogComponent } from '../content-share-dialog/content-share-dialog.component';

@Injectable()
export class ContentShareButtonActionService extends DocumentActionService {
    constructor(private dialog: MatDialog) {
        super();
    }

    isAvailable(context: ActionContext): boolean {
        return context.documents?.length === 1 && hasPermission(context.documents[0], DocumentPermissions.READ);
    }

    execute(context: ActionContext): void {
        const DIALOG_MIN_WIDTH = '750px';
        if (context.documents?.[0]?.sys_id) {
            this.dialog.open(ContentShareDialogComponent, {
                width: DIALOG_MIN_WIDTH,
                data: { sharedDocument: context.documents[0] },
            });
        }
    }
}
