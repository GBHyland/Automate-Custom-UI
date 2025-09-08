/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewEncapsulation } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';
import { UserType } from '@alfresco/adf-hx-content-services/services';

@Component({
    selector: 'hxp-restore-permission-dialog',
    templateUrl: './restore-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, MatRadioModule, FormsModule, TranslatePipe],
})
export class RestorePermissionDialogComponent {
    restoreOption: UserType = UserType.ALL;

    constructor(private dialogRef: MatDialogRef<RestorePermissionDialogComponent>) {}

    reject() {
        this.dialogRef.close();
    }

    confirm() {
        this.dialogRef.close({ restore: true, option: this.restoreOption });
    }
}
