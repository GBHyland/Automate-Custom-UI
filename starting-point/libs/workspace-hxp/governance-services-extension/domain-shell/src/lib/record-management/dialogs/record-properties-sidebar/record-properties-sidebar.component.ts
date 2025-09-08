/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ActionContext, GovernanceRecord, RecordIdentity } from '../../../mocks/record.type';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BLOCK_EDIT_STATUSES, HxpNotificationService, RecordStatusType } from '@alfresco/adf-hx-content-services/services';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { RecordPropertiesButtonService } from '../../actions/record-properties-button/record-properties-button.service';
import { take } from 'rxjs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { UnsavedChangesDialogComponent } from '../unsaved-changes/unsaved-changes-dialog.component';
import { GovernanceRecordService } from '../../services/governance-record.service';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'hxp-record-properties-sidebar',
    standalone: true,
    templateUrl: './record-properties-sidebar.component.html',
    styleUrls: ['./record-properties-sidebar.component.scss'],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatIconModule,
        MatButtonModule,
        MatTabsModule,
        MatFormFieldModule,
        MatProgressSpinnerModule,
        TranslatePipe,
        MatInputModule,
        MatDatepickerModule,
        MatNativeDateModule,
        MatTooltipModule,
    ],
})
export class RecordPropertiesSidebarComponent implements OnInit {
    @Input() actionContext!: ActionContext;

    @Output() closeSidebar = new EventEmitter<void>();

    activeTabIndex = 0;
    initialDate: Date | null = null;
    cutoffDateControl!: FormControl<Date | null>;

    protected collapsed = false;
    protected editMode = false;
    protected isSaving = false;
    protected isEditableRecord = false;

    private readonly hxpNotificationService = inject(HxpNotificationService);
    private readonly recordPropertiesButtonService = inject(RecordPropertiesButtonService);
    private readonly governanceRecordService = inject(GovernanceRecordService);
    private readonly translate = inject(TranslateService);
    private readonly dialog = inject(MatDialog);

    get record(): GovernanceRecord {
        return this.actionContext.records?.[0];
    }

    get isContentChanged(): boolean {
        if (!this.cutoffDateControl?.value) return false;

        return this.cutoffDateControl?.value?.toDateString() !== this.initialDate?.toDateString();
    }

    ngOnInit(): void {
        if (this.record) {
            this.cutoffDateControl = new FormControl<Date | null>(this.record.cutOffDate ? new Date(this.record.cutOffDate) : null);
            this.initialDate = this.cutoffDateControl.value;
            this.isEditableRecord = !BLOCK_EDIT_STATUSES.includes(this.record.status as RecordStatusType);
        }
    }

    toggleCollapse(): void {
        this.collapsed = !this.collapsed;
    }

    toggleEditMode(): void {
        this.editMode = true;
    }

    cancelEdit(): void {
        if (this.isContentChanged) {
            this.openUnsavedChangesDialog();
        } else {
            this.editMode = false;
        }
    }

    saveChanges(): void {
        if (!this.record?.id || !this.record.environmentDataSourceId || !this.record.categoryId) {
            return;
        }

        this.isSaving = true;

        const payload: RecordIdentity = {
            cutOffDate: this.getCutoffDate().toISOString(),
            environmentDataSourceId: this.record.environmentDataSourceId,
            categoryId: this.record.categoryId,
        };

        this.governanceRecordService
            .editRecord(encodeURIComponent(this.record.id), payload)
            .pipe(take(1))
            .subscribe({
                next: (updatedRecord) => this.handleSuccess(updatedRecord, payload),
                error: () => this.handleError(),
            });
    }

    clearDate(): void {
        this.cutoffDateControl.setValue(null);
    }

    onClose(): void {
        if (this.editMode && this.isContentChanged) {
            this.openUnsavedChangesDialog();
        } else {
            this.recordPropertiesButtonService.execute({ ...this.actionContext, showPanel: false });
        }
    }

    private openUnsavedChangesDialog(): void {
        const dialogRef = this.dialog.open(UnsavedChangesDialogComponent, {
            width: '400px',
        });

        dialogRef.afterClosed().subscribe((result) => {
            if (result) {
                this.editMode = false;
                this.recordPropertiesButtonService.execute({ ...this.actionContext, showPanel: false });
            }
        });
    }

    private getCutoffDate(): Date {
        return this.cutoffDateControl.value ?? new Date();
    }

    private handleSuccess(updatedRecord: GovernanceRecord, payload: RecordIdentity): void {
        this.isSaving = false;
        this.editMode = false;
        this.record.cutOffDate = payload.cutOffDate;
        this.initialDate = this.cutoffDateControl.value;
        this.governanceRecordService.emitUpdateConfirmed(updatedRecord);
        this.recordPropertiesButtonService.execute({ ...this.actionContext, showPanel: false });
        this.hxpNotificationService.showSuccess(this.translate.instant('GOVERNANCE.NOTIFICATIONS.PROPERTY_UPDATE_SUCCESS'));
    }

    private handleError(): void {
        this.isSaving = false;
        this.hxpNotificationService.showError(this.translate.instant('GOVERNANCE.NOTIFICATIONS.PROPERTY_UPDATE_ERROR'));
    }
}
