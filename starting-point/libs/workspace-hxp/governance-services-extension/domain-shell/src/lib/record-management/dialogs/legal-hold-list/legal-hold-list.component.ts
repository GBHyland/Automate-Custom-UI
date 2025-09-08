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
import { AssignRecordPayload, LegalHoldInitiator, LegalHoldInitiatorType } from '../../../legal-hold-management/config/legal-config.type';
import { TranslateModule, TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ActionContext, LegalCase } from '../../../mocks/record.type';
import { GovernanceLegalHoldComponent } from '../../../search/search-results/tabs/governance-legal-hold.component';
import { MatIcon } from '@angular/material/icon';
import { take } from 'rxjs';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';
@Component({
    selector: 'hxp-legal-hold-list',
    standalone: true,
    imports: [
        CommonModule,
        MatDialogModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        TranslateModule,
        TranslatePipe,
        GovernanceLegalHoldComponent,
        MatIcon,
    ],
    templateUrl: './legal-hold-list.component.html',
    styleUrl: '../governance-dialogs.component.scss',
})
export class LegalHoldListComponent {
    context: ActionContext = inject(MAT_DIALOG_DATA);
    dialogRef = inject(MatDialogRef<LegalHoldListComponent>);
    selectedLegalCase: LegalCase[] = [];
    isAssigning = false;

    protected readonly clickedFrom: LegalHoldInitiatorType = LegalHoldInitiator.Record;

    private readonly governanceLegalHoldManagementService = inject(GovernanceLegalHoldManagementService);
    private readonly hxpNotificationService = inject(HxpNotificationService);
    private readonly translate = inject(TranslateService);

    onSelectedLegalCaseChange(legalCases: LegalCase[]): void {
        this.selectedLegalCase = legalCases;
    }

    addRecordsToLegalCase(): void {
        this.isAssigning = true;

        const payload: AssignRecordPayload = {
            records: this.context.records.map((record) => ({
                edsId: record.environmentDataSourceId,
                categoryId: record.categoryId,
                recordId: record.id,
            })),
            legalCaseIds: this.selectedLegalCase.map((c) => c.legalCaseId),
        };

        this.governanceLegalHoldManagementService
            .assignRecordToLegalCase(payload)
            .pipe(take(1))
            .subscribe({
                next: () => this.handleSuccess(),
                error: () => this.handleError(),
            });
    }

    onCancel(): void {
        this.dialogRef.close(false);
    }

    private handleSuccess(): void {
        this.isAssigning = false;
        this.dialogRef.close();
        this.hxpNotificationService.showSuccess(this.translate.instant('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_ASSIGNMENT_SUCCESS'));
        this.governanceLegalHoldManagementService.emitRecordAssignmentComplete();
    }

    private handleError(): void {
        this.isAssigning = false;
        this.hxpNotificationService.showError(this.translate.instant('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_ASSIGNMENT_ERROR'));
    }
}
