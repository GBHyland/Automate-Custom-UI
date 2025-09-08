/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActionContext, DocumentActionService } from '@alfresco/adf-hx-content-services/services';
import { ManageColumnDialogComponent } from '../manage-column-dialog/manage-column-dialog.component';
import { DialogConfig } from '../../../../util/dialog/config';

@Injectable()
export class ManageColumnActionService extends DocumentActionService {
    constructor(public dialog: MatDialog) {
        super();
    }

    public isAvailable(context: ActionContext): boolean {
        return /search/i.test(context.refererURL || '');
    }

    public execute(context: ActionContext): void {
        this.dialog.open<ManageColumnDialogComponent, any>(ManageColumnDialogComponent, {
            width: DialogConfig.medium.width,
            height: DialogConfig.medium.height,
            data: context,
        });
    }
}
