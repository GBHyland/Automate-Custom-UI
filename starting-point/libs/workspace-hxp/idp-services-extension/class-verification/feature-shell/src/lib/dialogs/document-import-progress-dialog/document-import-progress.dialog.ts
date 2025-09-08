/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { TranslatePipe } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { DocumentImportStatus } from '../../services/document-import/idp-document-import-dialog.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    templateUrl: './document-import-progress.dialog.html',
    styleUrls: ['./document-import-progress.dialog.scss'],
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [AsyncPipe, MatButtonModule, MatDialogModule, MatIconModule, MatProgressBarModule, MatTooltipModule, TranslatePipe],
})
export class DocumentImportProgressDialogComponent {
    @Output() cancelDocumentUpload = new EventEmitter<DocumentImportStatus[]>();

    documents$: BehaviorSubject<DocumentImportStatus[]>;

    private readonly data: BehaviorSubject<DocumentImportStatus[]> = inject(MAT_DIALOG_DATA);

    constructor() {
        this.documents$ = this.data;
    }

    getDocumentUploadErrorTranslationKey(errorCode: number | undefined): string {
        return `IDP_CLASS_VERIFICATION.DOCUMENT_UPLOAD_PROGRESS_DIALOG.ERROR.${errorCode ?? 'GENERIC'}`;
    }

    onCancel(documents: DocumentImportStatus[]): void {
        this.cancelDocumentUpload.emit(documents);
    }

    static open(dialog: MatDialog, data: BehaviorSubject<DocumentImportStatus[]>): MatDialogRef<DocumentImportProgressDialogComponent> {
        return dialog.open(DocumentImportProgressDialogComponent, {
            data: data,
            hasBackdrop: false,
            position: { bottom: '10px', left: '10px' },
            width: '28em',
            maxHeight: '19em',
        });
    }
}
