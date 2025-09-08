/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DismissPermissionDialogData } from './cancel-permission-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, TranslatePipe],
})
export class ClosePermissionDialogComponent {
    constructor(
        private dialogRef: MatDialogRef<ClosePermissionDialogComponent>,
        @Inject(MAT_DIALOG_DATA) readonly dialogData: DismissPermissionDialogData
    ) {}

    reject() {
        this.closeDialog();
    }

    confirm() {
        this.closeDialog(true);
    }

    private closeDialog(save: boolean = false) {
        this.dialogRef.close({ save });
    }
}
