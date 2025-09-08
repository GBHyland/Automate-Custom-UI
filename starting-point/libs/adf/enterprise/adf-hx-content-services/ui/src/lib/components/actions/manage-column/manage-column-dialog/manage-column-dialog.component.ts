/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ColumnConfig,
    ColumnConfigService,
    IDENTITY_USER_SERVICE_TOKEN,
    IIdentityUserService,
    IdentityUserModel,
} from '@alfresco/adf-hx-content-services/services';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, inject, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TranslatePipe } from '@ngx-translate/core';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    selector: 'hxp-manage-column-dialog',
    templateUrl: './manage-column-dialog.component.html',
    styleUrls: ['./manage-column-dialog.component.scss'],
    imports: [
        NgIf,
        NgFor,
        MatDialogModule,
        MatIconModule,
        MatButtonModule,
        MatFormFieldModule,
        MatTooltipModule,
        MatInputModule,
        FormsModule,
        DragDropModule,
        TranslatePipe,
    ],
})
export class ManageColumnDialogComponent implements OnInit {
    public availableColumns: ColumnConfig[] = [];
    public selectedColumns: ColumnConfig[] = [];
    public canReset = false;
    public canUpdate = false;
    public canAdd = false;
    public searchTerm = '';
    userInfo!: IdentityUserModel;

    private initialDefaultColumns: ColumnConfig[] = [];
    private initialSelectedColumns: ColumnConfig[] = [];
    private initialCustomColumns: ColumnConfig[] = [];
    private allColumns: ColumnConfig[] = [];
    private identityUser$: Observable<IdentityUserModel>;
    private searchTerms = new Subject<string>();
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        @Inject(MAT_DIALOG_DATA) public manageColumnDialogData: any,
        private dialogRef: MatDialogRef<ManageColumnDialogComponent>,
        private columnConfigService: ColumnConfigService,
        @Inject(IDENTITY_USER_SERVICE_TOKEN) private identityUserService: IIdentityUserService
    ) {
        this.identityUser$ = of(this.identityUserService.getCurrentUserInfo());

        this.columnConfigService
            .getCustomColumns()
            .pipe(takeUntilDestroyed())
            .subscribe((customColumns) => {
                this.initialCustomColumns = customColumns;
            });
    }

    ngOnInit(): void {
        this.identityUser$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((userInfo: IdentityUserModel) => {
            this.userInfo = userInfo;
            this.initializeColumns();
        });

        this.searchTerms.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.applySearch();
        });
    }

    public selectColumn(column: ColumnConfig): void {
        this.selectedColumns.push(column);
        this.availableColumns = this.availableColumns.filter((c) => c.key !== column.key);
        this.checkForChanges();
    }

    public deselectColumn(column: ColumnConfig): void {
        this.availableColumns.push(column);
        this.selectedColumns = this.selectedColumns.filter((c) => c.key !== column.key);
        this.checkForChanges();
    }

    public totalSelectableColumns(): number {
        return this.initialDefaultColumns.length;
    }

    public onSearchChange(): void {
        this.searchTerms.next(this.searchTerm);
    }

    public applyChanges(): void {
        this.columnConfigService.setCurrentSelectedColumnsForCurrentUser(this.userInfo, this.selectedColumns);
        this.closeDialog();
    }

    public clearSearch(): void {
        this.searchTerm = '';
        this.onSearchChange();
    }

    public drop(event: CdkDragDrop<ColumnConfig[]>): void {
        moveItemInArray(this.selectedColumns, event.previousIndex, event.currentIndex);
        this.checkForChanges();
    }

    public resetToDefault(): void {
        this.selectedColumns = this.initialDefaultColumns;
        this.availableColumns = [...this.initialCustomColumns];
        this.searchTerm = '';
        this.checkForChanges();
    }

    public hasSelectionChanged(): boolean {
        return JSON.stringify(this.selectedColumns) !== JSON.stringify(this.initialSelectedColumns);
    }

    public hasDefaultChanged(): boolean {
        return JSON.stringify(this.selectedColumns) !== JSON.stringify(this.initialDefaultColumns);
    }

    private addColumnEnabled(): boolean {
        return this.selectedColumns.length !== this.totalSelectableColumns();
    }

    private initializeColumns(): void {
        this.selectedColumns = this.columnConfigService.getSelectedColumnsForCurrentUser(this.userInfo);
        this.initialDefaultColumns = this.columnConfigService.getDefaultColumns();
        this.allColumns = [...this.initialDefaultColumns, ...this.initialCustomColumns];

        this.availableColumns = this.allColumns.filter((column) => !this.selectedColumns.some((selected) => selected.key === column.key));

        this.initialSelectedColumns = [...this.selectedColumns];
        this.checkForChanges();
    }

    private applySearch(): void {
        if (this.searchTerm) {
            const searchLower = this.searchTerm.toLowerCase();
            this.availableColumns = this.allColumns.filter(
                (column) => column.title.toLowerCase().includes(searchLower) && !this.selectedColumns.some((selected) => selected.key === column.key)
            );
        } else {
            this.availableColumns = this.allColumns.filter((column) => !this.selectedColumns.some((selected) => selected.key === column.key));
        }
    }

    private checkForChanges(): void {
        this.canReset = this.hasDefaultChanged();
        this.canUpdate = this.hasSelectionChanged();
        this.canAdd = this.addColumnEnabled();
    }

    private closeDialog(): void {
        this.dialogRef.close();
    }
}
