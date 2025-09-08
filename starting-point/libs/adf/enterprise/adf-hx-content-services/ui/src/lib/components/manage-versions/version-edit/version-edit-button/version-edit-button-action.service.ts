/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ActionContext,
    DocumentActionService,
    DocumentPermissions,
    hasPermission,
    isVersion,
    VersionableDocument,
} from '@alfresco/adf-hx-content-services/services';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VersionEditDialogComponent } from '../version-edit-dialog/version-edit-dialog.component';
import { DialogConfig } from '../../../../util/dialog/config';

@Injectable()
export class VersionEditButtonActionService extends DocumentActionService {
    constructor(private dialog: MatDialog) {
        super();
    }

    isAvailable(context: ActionContext): boolean {
        return (
            !!context.documents &&
            context.documents.length === 1 &&
            hasPermission(context.documents[0], DocumentPermissions.WRITE) &&
            hasPermission(context.documents[0], DocumentPermissions.WRITE_VERSION) &&
            isVersion(context.documents[0])
        );
    }

    execute(context: ActionContext): void {
        const document = context.documents[0];

        this.dialog.open<VersionEditDialogComponent, VersionableDocument>(VersionEditDialogComponent, {
            width: DialogConfig.small.width,
            data: document,
        });
    }
}
