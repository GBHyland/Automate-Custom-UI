/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ActionContext, DocumentActionService, DocumentPermissions, hasPermission, isVersion } from '@alfresco/adf-hx-content-services/services';
import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { VersionDeleteConfirmationDialogComponent } from '../version-delete-confirmation-dialog/version-delete-confirmation-dialog.component';
import { VersionDeleteDialogData } from '../configs/version-delete-dialog.interface';

@Injectable()
export class VersionDeleteButtonActionService extends DocumentActionService {
    constructor(private dialog: MatDialog) {
        super();
    }

    isAvailable(context: ActionContext): boolean {
        return (
            !!context.documents &&
            context.documents.length === 1 &&
            isVersion(context.documents[0]) &&
            hasPermission(context.documents[0], DocumentPermissions.DELETE) &&
            !!context.parentDocument &&
            hasPermission(context.parentDocument, DocumentPermissions.DELETE_CHILD)
        );
    }

    execute(context: ActionContext): void {
        const document = context.documents[0];

        this.dialog.open<VersionDeleteConfirmationDialogComponent, VersionDeleteDialogData>(VersionDeleteConfirmationDialogComponent, {
            data: {
                version: document,
                shouldRedirect: context.shouldRedirect || false,
                parentId: document.sys_parentId || '',
            },
        });
    }
}
