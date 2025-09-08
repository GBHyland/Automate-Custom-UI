/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentVersionsService, HxpNotificationService, VersionableDocument } from '@alfresco/adf-hx-content-services/services';
import { DatePipe, NgClass } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'hxp-version-edit-dialog',
    standalone: true,
    imports: [
        NgClass,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinner,
        TranslateModule,
    ],
    templateUrl: './version-edit-dialog.component.html',
    styleUrl: './version-edit-dialog.component.scss',
})
export class VersionEditDialogComponent implements OnInit {
    protected isUpdating = false;
    protected form!: FormGroup;

    private dateFormat = 'medium';

    constructor(
        @Inject(MAT_DIALOG_DATA) public version: VersionableDocument,
        private fb: FormBuilder,
        private datePipe: DatePipe,
        private hxpNotificationService: HxpNotificationService,
        private dialogRef: MatDialogRef<VersionEditDialogComponent>,
        private documentVersionService: DocumentVersionsService
    ) {}

    ngOnInit(): void {
        this.form = this.fb.group({
            sysver_title: [
                this.version?.sysver_title ||
                    this.datePipe.transform(this.version.sys_modified, this.dateFormat) ||
                    this.datePipe.transform(this.version.sysver_created, this.dateFormat) ||
                    '',
                Validators.required,
            ],
            sysver_description: [this.version?.sysver_description || ''],
        });
    }

    protected onSave(): void {
        if (this.form.invalid) {
            return;
        }

        this.isUpdating = true;
        const updatedVersion = {
            sys_id: this.version.sys_id,
            sysver_title: this.form.get('sysver_title')?.value,
            sysver_description: this.form.get('sysver_description')?.value,
        };

        this.documentVersionService.updateVersion(updatedVersion).subscribe({
            next: () => {
                this.hxpNotificationService.showSuccess('MANAGE_VERSIONS.EDIT_DIALOG.NOTIFICATION.SUCCESS');
            },
            error: (error) => {
                console.error(error);
                this.hxpNotificationService.showError('MANAGE_VERSIONS.EDIT_DIALOG.NOTIFICATION.ERROR');
                this.isUpdating = false;
            },
            complete: () => {
                this.isUpdating = false;
                this.dialogRef.close();
            },
        });
    }
}
