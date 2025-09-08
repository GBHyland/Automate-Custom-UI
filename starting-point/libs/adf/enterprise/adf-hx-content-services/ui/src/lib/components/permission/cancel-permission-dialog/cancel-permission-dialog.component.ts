/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { PermissionsPanelRequestService } from '@alfresco/adf-hx-content-services/services';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

export interface DismissPermissionDialogData<T = any> {
    dialogTitle: string;
    dialogDescription: string;
    dialogRejectButton: string;
    dialogConfirmButton: string;
    permissionDialogRef?: MatDialogRef<T>;
}

export abstract class DismissPermission {
    protected abstract close(isEdited: boolean): void;
    protected abstract cancel(isEdited: boolean): void;
}

@Component({
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatRadioModule, FormsModule, TranslatePipe],
})
export class CancelPermissionDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<CancelPermissionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) readonly dialogData: DismissPermissionDialogData,
        private permissionsPanelRequestService: PermissionsPanelRequestService
    ) {}

    reject() {
        this.dialogRef.close();
    }

    confirm() {
        this.dialogRef.close();
        if (this.dialogData?.permissionDialogRef) {
            this.dialogData.permissionDialogRef.close();
        } else {
            this.permissionsPanelRequestService.requestClosePanel();
        }
    }
}
