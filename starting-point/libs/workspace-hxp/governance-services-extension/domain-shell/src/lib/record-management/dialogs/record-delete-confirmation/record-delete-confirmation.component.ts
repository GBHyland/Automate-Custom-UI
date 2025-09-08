/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { GovernanceRecordService } from '../../services/governance-record.service';
import { catchError, forkJoin, of, take } from 'rxjs';
import { ActionContext } from '../../../mocks/record.type';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';

@Component({
    selector: 'hxp-record-delete-confirmation',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatProgressSpinnerModule, TranslateModule, TranslatePipe],
    templateUrl: './record-delete-confirmation.component.html',
    styleUrl: '../governance-dialogs.component.scss',
})
export class RecordDeleteConfirmationComponent {
    context: ActionContext = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef<RecordDeleteConfirmationComponent>);

    protected isDeleting = false;

    private governanceRecordService = inject(GovernanceRecordService);
    private readonly hxpNotificationService = inject(HxpNotificationService);
    private readonly translate = inject(TranslateService);

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onConfirm(): void {
        const deletableRecords = this.getDeletableRecords();
        if (deletableRecords.length === 0) {
            return;
        }

        this.isDeleting = true;

        const deleteRequests = deletableRecords.map((record) =>
            this.governanceRecordService.deleteRecord(record.id, record.environmentDataSourceId, record.categoryId).pipe(
                take(1),
                catchError(() => of(false))
            )
        );

        forkJoin(deleteRequests)
            .pipe(take(1))
            .subscribe({
                next: this.handleDeleteResults.bind(this),
                error: this.handleDeleteFailure.bind(this),
            });
    }

    private getDeletableRecords(): Array<{ id: string; environmentDataSourceId: string; categoryId: string }> {
        return (this.context.records ?? []).filter(
            (r): r is { id: string; environmentDataSourceId: string; categoryId: string } => !!r?.id && !!r.environmentDataSourceId && !!r.categoryId
        );
    }

    private handleDeleteResults(results: boolean[]): void {
        this.isDeleting = false;

        const { successCount, failureCount } = this.countDeleteResults(results);
        this.dialogRef.close(failureCount === 0);

        if (failureCount === 0) {
            return this.showDeleteSuccess();
        } else if (successCount > 0) {
            return this.showPartialDeleteSuccess(successCount, failureCount);
        }

        this.showDeleteFailure();
    }

    private countDeleteResults(results: boolean[]): { successCount: number; failureCount: number } {
        const successCount = results.filter(Boolean).length;
        return {
            successCount,
            failureCount: results.length - successCount,
        };
    }

    private showDeleteSuccess(): void {
        this.governanceRecordService.emitDeleteConfirmed();
        this.hxpNotificationService.showSuccess(this.translate.instant('GOVERNANCE.NOTIFICATIONS.RECORD_DELETE_SUCCESS'));
    }

    private showPartialDeleteSuccess(successCount: number, failureCount: number): void {
        this.governanceRecordService.emitDeleteConfirmed();
        this.hxpNotificationService.showInfo(
            this.translate.instant('GOVERNANCE.NOTIFICATIONS.RECORD_DELETE_PARTIAL', {
                successCount,
                failureCount,
            })
        );
    }

    private showDeleteFailure(): void {
        this.hxpNotificationService.showError(this.translate.instant('GOVERNANCE.NOTIFICATIONS.RECORD_DELETE_ERROR'));
    }

    private handleDeleteFailure(): void {
        this.isDeleting = false;
        this.dialogRef.close(false);
        this.showDeleteFailure();
    }
}
