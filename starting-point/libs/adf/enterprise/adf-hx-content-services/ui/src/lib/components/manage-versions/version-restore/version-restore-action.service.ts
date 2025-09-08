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
    DocumentService,
    hasPermission,
    HxpNotificationService,
    isVersion,
} from '@alfresco/adf-hx-content-services/services';
import { Injectable } from '@angular/core';
import { from } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class VersionRestoreActionService extends DocumentActionService {
    constructor(private hxpNotificationService: HxpNotificationService, private documentService: DocumentService) {
        super();
    }

    isAvailable(context: ActionContext): boolean {
        return (
            !!context.documents &&
            isVersion(context.documents[0]) &&
            hasPermission(context.documents[0], DocumentPermissions.READ) &&
            !!context.parentDocument &&
            hasPermission(context.parentDocument, DocumentPermissions.WRITE)
        );
    }

    execute(context: ActionContext): void {
        const document = context.documents[0];

        if (!document?.sys_id) {
            this.hxpNotificationService.showError('DOCUMENT_VERSION.SNACKBAR.RESTORE_ERROR');
            return;
        }
        from(this.documentService.restoreVersion(document.sys_id)).subscribe({
            next: () => {
                this.documentService.requestReload();
                this.hxpNotificationService.showSuccess('DOCUMENT_VERSION.SNACKBAR.RESTORE_SUCCESS');
            },
            error: () => this.hxpNotificationService.showError('DOCUMENT_VERSION.SNACKBAR.RESTORE_ERROR'),
        });
    }
}
