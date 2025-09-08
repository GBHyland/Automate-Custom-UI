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
import { MatIconModule } from '@angular/material/icon';

@Component({
    templateUrl: './discard-changes-dialog.html',
    styleUrls: ['./discard-changes-dialog.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [MatDialogModule, MatIconModule, MatButtonModule, TranslatePipe],
})
export class DiscardChangesDialogComponent {
    constructor(private readonly dialogRef: MatDialogRef<DiscardChangesDialogComponent>) {}

    protected onDiscard() {
        this.dialogRef.close(true);
    }
}
