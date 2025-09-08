/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { CreateLegalHoldCaseDialogData, LegalHoldCaseIdentity, LegalHoldInitiator } from '../../config/legal-config.type';
import { GovernanceLegalHoldManagementService } from '../../services/governance-legal-hold-management.service';
import { filter, take } from 'rxjs';
import { HxpNotificationService } from '@alfresco/adf-hx-content-services/services';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
    selector: 'hxp-create-legal-hold-case',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule, MatInputModule, MatProgressSpinnerModule, TranslatePipe, ReactiveFormsModule],
    templateUrl: './create-legal-hold-case.component.html',
    styleUrl: './create-legal-hold-case.component.scss',
})
export class CreateLegalHoldCaseComponent {
    readonly dialogData: CreateLegalHoldCaseDialogData = inject(MAT_DIALOG_DATA);
    readonly dialogRef = inject(MatDialogRef<CreateLegalHoldCaseComponent>);

    protected isCreating = false;

    private readonly governanceLegalHoldManagementService = inject(GovernanceLegalHoldManagementService);
    private readonly hxpNotificationService = inject(HxpNotificationService);
    private readonly translate = inject(TranslateService);
    private readonly _fb = inject(FormBuilder);

    constructor() {
        this.dialogRef
            .keydownEvents()
            .pipe(
                filter((e) => e.key === 'Escape'),
                takeUntilDestroyed()
            )
            .subscribe(() => this.performCancelEffects());

        this.dialogRef
            .backdropClick()
            .pipe(takeUntilDestroyed())
            .subscribe(() => this.performCancelEffects());
    }

    readonly createLegalHoldCaseForm = this._fb.group({
        legal_name: ['', [Validators.required, Validators.maxLength(64)]],
        legal_reason: ['', [Validators.required, Validators.maxLength(512)]],
        legal_description: ['', Validators.maxLength(512)],
    });

    onCancel(): void {
        this.performCancelEffects();
        this.dialogRef.close();
    }

    onCreate(): void {
        if (this.createLegalHoldCaseForm.valid) {
            this.isCreating = true;

            const payload: LegalHoldCaseIdentity = {
                legalCaseName: this.createLegalHoldCaseForm.get('legal_name')?.value ?? '',
                legalCaseReason: this.createLegalHoldCaseForm.get('legal_reason')?.value ?? '',
                legalCaseDescription: this.createLegalHoldCaseForm.get('legal_description')?.value,
            };

            this.governanceLegalHoldManagementService
                .createLegalHoldCase(payload)
                .pipe(take(1))
                .subscribe({
                    next: () => this.handleSuccess(),
                    error: (err: HttpErrorResponse) => this.handleError(err),
                });
        }
    }

    private handleSuccess(): void {
        this.isCreating = false;
        this.dialogRef.close();
        this.hxpNotificationService.showSuccess(this.translate.instant('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_CREATE_SUCCESS'));
        this.governanceLegalHoldManagementService.emitRefreshList();
    }

    private handleError(error?: HttpErrorResponse): void {
        this.isCreating = false;
        if (error?.status === 409) {
            this.hxpNotificationService.showError(this.translate.instant('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_NAME_EXISTS'));
        } else {
            this.hxpNotificationService.showError(this.translate.instant('GOVERNANCE.NOTIFICATIONS.LEGAL_HOLD_CASE_CREATE_ERROR'));
        }
    }

    private performCancelEffects(): void {
        if (this.dialogData.clickedFrom === LegalHoldInitiator.Record) {
            this.governanceLegalHoldManagementService.emitRefreshList();
        }
    }
}
