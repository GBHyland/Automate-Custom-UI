/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable, Optional } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import {
    hasPermission,
    ActionContext,
    DocumentActionService,
    DocumentPermissions,
    PermissionsPanelRequestService,
    PermissionsManagementComponentType,
    PermissionsManagementDialogData,
    PERMISSIONS_MANAGEMENT_COMPONENT_TYPE,
    isVersion,
} from '@alfresco/adf-hx-content-services/services';
import { DIALOG_MIN_WIDTH, PermissionsManagementDialogComponent } from '../permissions-management-dialog/permissions-management-dialog.component';

@Injectable()
export class PermissionsButtonActionService extends DocumentActionService {
    constructor(
        private dialog: MatDialog,
        private permissionsPanelRequestService: PermissionsPanelRequestService,
        @Optional()
        @Inject(PERMISSIONS_MANAGEMENT_COMPONENT_TYPE)
        private componentType: PermissionsManagementComponentType = 'dialog'
    ) {
        super();
    }

    isAvailable(context: ActionContext): boolean {
        return (
            context.documents?.length > 0 &&
            hasPermission(context.documents[0], DocumentPermissions.WRITE) &&
            hasPermission(context.documents[0], DocumentPermissions.MANAGE_SECURITY) &&
            !isVersion(context.documents[0])
        );
    }

    execute(context: ActionContext): void {
        if (context.documents?.length > 0 && context.parentDocument) {
            const isDialog = this.componentType === 'dialog';
            if (isDialog) {
                this.openPermissionsManagementDialog({
                    document: context.documents[0],
                    parentDocument: context.parentDocument,
                });
            } else {
                this.permissionsPanelRequestService.requestOpenPanel();
            }
        }
    }

    private openPermissionsManagementDialog(permissionsManagementDialogData: PermissionsManagementDialogData) {
        this.dialog.open<PermissionsManagementDialogComponent, PermissionsManagementDialogData>(PermissionsManagementDialogComponent, {
            width: DIALOG_MIN_WIDTH + 'px',
            height: '100vh',
            position: { top: '0px', right: '0px' },
            data: permissionsManagementDialogData,
            disableClose: true,
        });
    }
}
