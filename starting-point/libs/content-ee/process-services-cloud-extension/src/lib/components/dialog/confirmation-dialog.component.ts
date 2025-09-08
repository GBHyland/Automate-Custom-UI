/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export interface ConfirmDialogSettings {
    title: string;
    message: string;
    action: string;
}

@Component({
    standalone: true,
    imports: [MatDialogModule, MatButtonModule, TranslatePipe],
    selector: 'apa-confirmation-dialog',
    templateUrl: './confirmation-dialog.component.html',
})
export class ConfirmationDialogComponent {
    constructor(public dialogRef: MatDialogRef<ConfirmationDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogSettings) {}
}
