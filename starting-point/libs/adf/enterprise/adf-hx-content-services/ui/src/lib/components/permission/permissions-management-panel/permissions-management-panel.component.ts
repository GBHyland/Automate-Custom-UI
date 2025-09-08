/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { PermissionsPanelRequestService, PermissionsManagementStateService } from '@alfresco/adf-hx-content-services/services';
import {
    CancelPermissionDialogComponent,
    DismissPermission,
    DismissPermissionDialogData,
} from '../cancel-permission-dialog/cancel-permission-dialog.component';
import { DialogConfig } from '../../../util/dialog/config';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { PermissionsDocumentTitleComponent } from '../permissions-document-title/permissions-document-title.component';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { PermissionManagementContainerComponent } from '../permission-management-container/permission-management-container.component';
import { RestorePermissionDialogComponent } from '../cancel-permission-dialog/restore-permission-dialog.component';

/**
 * This component is responsible for managing the permissions in the form of a panel.
 * The rest of the application is still accessible.
 *
 * It includes functionalities to add, edit, and display permissions to `User`s and `Group`s.
 *
 * Available permissions are `Read`, `Write` and `Everything`.
 *
 * Permissions are inherited from the parent `Document`.
 * It's possible to only upgrade a inherited permission.
 *
 * To use the `PermissionsManagementPanelComponent`, you need first to import the component in your module
 *
 * ```ts
 * import { PermissionsManagementPanelComponent } from '@alfresco/adf-hx-content-services/ui';
 * @NgModule({
 *     imports: [
 *         PermissionsManagementPanelComponent,
 *         ...
 *     ],
 *    [...]
 * })
 * export class AppModule {}
 * ```
 *
 * Then use it in your Angular template as shown in the example below:
 *
 * @example
 * <hxp-permissions-management-panel></hxp-permissions-management-panel>
 */
@Component({
    selector: 'hxp-permissions-management-panel',
    templateUrl: './permissions-management-panel.component.html',
    styleUrls: ['./permissions-management-panel.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        MatDialogModule,
        MatButtonModule,
        MatTabsModule,
        MatIconModule,
        MatDividerModule,
        TranslatePipe,
        PermissionsDocumentTitleComponent,
        MatSnackBarModule,
        PermissionManagementContainerComponent,
    ],
    providers: [PermissionsManagementStateService],
})
export class PermissionsManagementPanelComponent extends DismissPermission {
    /**
     * The document to display and manage permissions for.
     * @type {Document}
     */
    @Input()
    document!: Document;

    @Input()
    parentDocument!: Document;

    constructor(private permissionsPanelRequestService: PermissionsPanelRequestService, private dialog: MatDialog) {
        super();
    }

    protected cancel(isEdited: boolean) {
        if (!isEdited) {
            return this.close();
        }
        this.dialog.open<CancelPermissionDialogComponent, DismissPermissionDialogData>(CancelPermissionDialogComponent, {
            width: DialogConfig.small.width,
            data: {
                dialogTitle: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.TITLE',
                dialogDescription: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.DESCRIPTION',
                dialogRejectButton: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.REJECT',
                dialogConfirmButton: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.CONFIRM',
            },
        });
    }

    protected close() {
        this.permissionsPanelRequestService.requestClosePanel();
    }

    protected restore() {
        this.dialog.open<RestorePermissionDialogComponent, DismissPermissionDialogData>(RestorePermissionDialogComponent, {
            width: DialogConfig.small.width,
        });
    }
}
