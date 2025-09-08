/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EditDocumentVersion, VersionableDocument } from '@alfresco/adf-hx-content-services/services';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AsyncPipe, DatePipe, NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'hxp-edit-version-dialog',
    templateUrl: './edit-version-dialog.component.html',
    styleUrls: ['./edit-version-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        NgClass,
        MatDialogModule,
        MatButtonModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatProgressSpinnerModule,
        TranslatePipe,
        AsyncPipe,
        DatePipe,
    ],
})
export class EditVersionDialogComponent implements OnInit {
    public isUpdating = false;
    public versionUpdated$ = new Subject<EditDocumentVersion>();

    protected form!: FormGroup;
    private dateFormat = 'medium';

    constructor(@Inject(MAT_DIALOG_DATA) public version: VersionableDocument, private fb: FormBuilder, private datePipe: DatePipe) {}

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

    save(): void {
        if (this.form.invalid) {
            return;
        }

        this.isUpdating = true;
        const updatedVersion = {
            sys_id: this.version.sys_id,
            sysver_title: this.form.value.sysver_title,
            sysver_description: this.form.value.sysver_description,
        };

        this.versionUpdated$.next(updatedVersion as EditDocumentVersion);
    }
}
