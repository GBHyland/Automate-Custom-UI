/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component } from '@angular/core';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
    selector: 'aps-waiting-screen-dialog',
    standalone: true,
    imports: [MatProgressSpinner, TranslatePipe, MatDialogModule, MatButtonModule],
    templateUrl: './waiting-screen-dialog.component.html',
    styleUrl: './waiting-screen-dialog.component.scss',
})
export class WaitingScreenDialogComponent {
    constructor(public dialogRef: MatDialogRef<WaitingScreenDialogComponent>) {}
}
