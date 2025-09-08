/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';

export const ConfirmButtonColor = {
    Primary: 'primary',
    Warn: 'warn',
} as const;
export type ConfirmButtonColor = typeof ConfirmButtonColor[keyof typeof ConfirmButtonColor];
export interface DialogSettings {
    dialogHeader: string;
    confirmLabel: string;
    confirmButtonColor: ConfirmButtonColor;
    cancelLabel: string;
    content: string;
}

@Component({
    templateUrl: './confirmation.dialog.html',
    styleUrls: ['./confirmation.dialog.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, MatButtonModule, MatDialogModule, TranslatePipe],
})
export class ConfirmationDialogComponent {
    settings: DialogSettings;
    confirmButtonColor: ConfirmButtonColor = ConfirmButtonColor.Primary;
    constructor(@Inject(MAT_DIALOG_DATA) data: { settings: DialogSettings }) {
        this.settings = data.settings;
        if (this.settings.confirmButtonColor) {
            this.confirmButtonColor = this.settings.confirmButtonColor;
        }
    }
}
