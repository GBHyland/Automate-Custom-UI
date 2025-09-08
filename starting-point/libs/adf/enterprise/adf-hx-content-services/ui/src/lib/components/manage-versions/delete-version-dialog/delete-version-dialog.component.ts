/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { VersionableDocument } from '@alfresco/adf-hx-content-services/services';
import { Subject } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgClass, NgIf } from '@angular/common';

@Component({
    selector: 'hxp-delete-version-dialog',
    templateUrl: './delete-version-dialog.component.html',
    styleUrls: ['./delete-version-dialog.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [NgIf, NgClass, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
})
export class DeleteVersionDialogComponent {
    public isDeleting = false;
    public versionDeleted$ = new Subject<boolean>();

    constructor(@Inject(MAT_DIALOG_DATA) public version: VersionableDocument) {}

    delete(): void {
        this.isDeleting = true;
        this.versionDeleted$.next(true);
    }
}
