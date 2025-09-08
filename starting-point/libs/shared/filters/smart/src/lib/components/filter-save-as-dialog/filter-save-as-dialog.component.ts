/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'hxp-filter-save-as-dialog',
    templateUrl: './filter-save-as-dialog.component.html',
    styleUrls: ['./filter-save-as-dialog.component.scss'],
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatFormFieldModule, MatInputModule, FormsModule, ReactiveFormsModule, MatDialogModule, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterSaveAsDialogComponent {
    readonly dialogRef = inject(MatDialogRef<FilterSaveAsDialogComponent>);
    name: string | null = null;

    nameControl = new FormControl<string | null>(null);
}
