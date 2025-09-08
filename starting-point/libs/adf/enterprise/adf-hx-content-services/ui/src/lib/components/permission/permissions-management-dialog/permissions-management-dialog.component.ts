/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectionStrategy, Component, Inject, ViewChild, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { PermissionsManagementDialogData, PermissionsManagementStateService } from '@alfresco/adf-hx-content-services/services';
import {
    CancelPermissionDialogComponent,
    DismissPermission,
    DismissPermissionDialogData,
} from '../cancel-permission-dialog/cancel-permission-dialog.component';
import { DialogConfig } from '../../../util/dialog/config';
import { ClosePermissionDialogComponent } from '../cancel-permission-dialog/close-permission-dialog.component';
import { TranslatePipe } from '@ngx-translate/core';
import { PermissionManagementContainerComponent } from '../permission-management-container/permission-management-container.component';
import { RestorePermissionDialogComponent } from '../cancel-permission-dialog/restore-permission-dialog.component';

export const DIALOG_MIN_WIDTH = 436;

/**
 * This component is responsible for managing the permissions in the form of dialog.
 * The dialog overlay prevent the user to interact with the rest of the application.
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
 * import { MatDialog } from '@angular/material/dialog';
 * import { PermissionsManagementPanelComponent } from '@alfresco/adf-hx-content-services/ui';
 * import { PermissionsManagementDialogData } from '@alfresco/adf-hx-content-services/services';
 *
 * @Component({
 *     template: '<button (click)="openPermissionsManagementDialog(document)">{{ document.sys_title }}</button>',
 *     standalone: true,
 * })
 * class OpenDialogButtonComponent {
 *
 *     constructor(
 *         private dialog: MatDialog,
 *     ) {}
 *
 *     openPermissionsManagementDialog(document: Document) {
 *         this.dialog.open<
 *             PermissionsManagementDialogComponent,
 *             PermissionsManagementDialogData
 *         >(PermissionsManagementDialogComponent, {
 *             data: { document }
 *          });
 *     }
 * }
 * ```
 */
@Component({
    selector: 'hxp-permissions-management-dialog',
    templateUrl: './permissions-management-dialog.component.html',
    styleUrls: ['./permissions-management-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [MatDialogModule, TranslatePipe, PermissionManagementContainerComponent],
    providers: [PermissionsManagementStateService],
})
export class PermissionsManagementDialogComponent extends DismissPermission {
    /**
     * The `Document` to display and manage permissions for.
     *
     * To pass the `Document` open the dialog and provide `MAT_DIALOG_DATA` as `PermissionsManagementDialogData`.
     *
     * ```ts
     * interface PermissionsManagementDialogData {
     *     document: Document;
     * }
     * ```
     *
     * @type {Document}
     */
    document: Document;

    parentDocument: Document;

    @ViewChild(PermissionManagementContainerComponent) container!: PermissionManagementContainerComponent;

    constructor(
        @Inject(MAT_DIALOG_DATA) data: PermissionsManagementDialogData,
        private dialog: MatDialog,
        private dialogRef: MatDialogRef<PermissionsManagementDialogComponent>
    ) {
        super();
        this.document = data.document;
        this.parentDocument = data.parentDocument;
    }

    protected cancel(isEdited: boolean) {
        if (!isEdited) {
            return this.dialogRef.close();
        }
        this.dialog.open<CancelPermissionDialogComponent, DismissPermissionDialogData<PermissionsManagementDialogComponent>>(
            CancelPermissionDialogComponent,
            {
                width: DialogConfig.small.width,
                data: {
                    dialogTitle: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.TITLE',
                    dialogDescription: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.DESCRIPTION',
                    dialogRejectButton: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.REJECT',
                    dialogConfirmButton: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_CANCEL_DIALOG.CONFIRM',
                    permissionDialogRef: this.dialogRef,
                },
            }
        );
    }

    protected close(isEdited: boolean) {
        if (!isEdited) {
            return this.dialogRef.close();
        }
        const closeDialogRef = this.dialog.open<ClosePermissionDialogComponent, DismissPermissionDialogData>(ClosePermissionDialogComponent, {
            width: DialogConfig.small.width,
            data: {
                dialogTitle: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_SAVE_DIALOG.TITLE',
                dialogDescription: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_SAVE_DIALOG.DESCRIPTION',
                dialogRejectButton: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_SAVE_DIALOG.REJECT',
                dialogConfirmButton: 'PERMISSIONS_MANAGEMENT_ACTION.ASK_TO_SAVE_DIALOG.CONFIRM',
            },
        });

        closeDialogRef.afterClosed().subscribe((result) => {
            this.dialogRef.close();
            if (result.save) {
                this.container.savePermissions();
            }
        });
    }

    protected restore() {
        const restoreDialogRef = this.dialog.open<RestorePermissionDialogComponent, DismissPermissionDialogData>(RestorePermissionDialogComponent, {
            width: DialogConfig.small.width,
        });

        restoreDialogRef.afterClosed().subscribe((result) => {
            if (result && result.restore) {
                this.container.restorePermissions(result.option);
            }
        });
    }
}
