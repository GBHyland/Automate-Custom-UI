/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, inject, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { DatePipe, NgClass } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TableSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RecordListComponent } from '.././record-list/record-list.component';
import { GovernanceRecord, ActionContext } from '../../../mocks/record.type';
import { DataColumnComponent } from '.././record-list/data-column.component';
import { GovernanceSearchService } from '.././services/governance-search.service';
import { debounceTime, filter, map } from 'rxjs/operators';
import { distinctUntilChanged, finalize, merge, Subject } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RecordStatusClassPipe } from '.././format/record-status-class.pipe';
import { SearchFilterValueService } from '../../filters/base/search-filter-value.service';
import { RecordDeleteButtonComponent } from '../../../record-management/actions/record-delete-button/record-delete-button.component';
import { RecordPropertiesButtonComponent } from '../../../record-management/actions/record-properties-button/record-properties-button.component';
import { RecordPropertiesButtonService } from '../../../record-management/actions/record-properties-button/record-properties-button.service';
import { CategorySearchFilterComponent } from '../../filters/category/category-search-filter.component';
import { StatusSearchFilterComponent } from '../../filters/status/status-search-filter.component';
import { ModifierSearchFilterComponent } from '../../filters/modifier/modifier-search-filter.component';
import { DataSourceSearchFilterComponent } from '../../filters/data-source/data-source-search-filter.component';
import { RecordCategoryLabelPipe } from '.././format/record-category-label.pipe';
import { RecordStatusLabelPipe } from '.././format/record-status-label.pipe';
import { CutoffSearchFilterComponent } from '../../filters/cutoff/cutoff-search-filter.component';
import { DispositionSearchFilterComponent } from '../../filters/disposition/disposition-search-filter.component';
import { RecordNameSearchFilterComponent } from '../../filters/record-name/record-name-search-filter.component';
import { RecordDataSourceLabelPipe } from '.././format/record-data-source-label.pipe';
import { RecordDispositionLabelPipe } from '.././format/record-disposition-display.pipe';
import { ResultsPaginatorComponent } from '../pagination/results-paginator.component';
import { GovernanceRecordService } from '../../../record-management/services/governance-record.service';
import { AddLegalHoldButtonComponent } from '../../../record-management/actions/add-legal-hold-button/add-legal-hold-button.component';
import { RecordStatus } from '@alfresco/adf-hx-content-services/services';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';
@Component({
    selector: 'hxp-governance-search-results',
    standalone: true,
    imports: [
        DatePipe,
        CategorySearchFilterComponent,
        DataSourceSearchFilterComponent,
        ModifierSearchFilterComponent,
        StatusSearchFilterComponent,
        NgClass,
        MatButtonModule,
        MatDividerModule,
        MatIconModule,
        MatToolbarModule,
        RecordListComponent,
        RecordCategoryLabelPipe,
        RecordStatusClassPipe,
        RecordStatusLabelPipe,
        DataColumnComponent,
        TableSkeletonLoaderComponent,
        RecordDeleteButtonComponent,
        RecordPropertiesButtonComponent,
        TranslatePipe,
        RecordNameSearchFilterComponent,
        CutoffSearchFilterComponent,
        DispositionSearchFilterComponent,
        RecordDataSourceLabelPipe,
        RecordDispositionLabelPipe,
        AddLegalHoldButtonComponent,
        ResultsPaginatorComponent,
    ],
    templateUrl: './governance-search-results.component.html',
    styleUrl: './governance-search-results.component.scss',
})
export class GovernanceSearchResultsComponent implements OnInit {
    @Output() sidebarToggle = new EventEmitter<boolean>();
    @Output() selectedRecordsChange = new EventEmitter<GovernanceRecord[]>();
    @Output() actionContextChange = new EventEmitter<ActionContext>();
    @ViewChild('recordList') public recordList!: RecordListComponent;

    public records: GovernanceRecord[] = [];
    public hasPendingChanges = false;
    public initialState = true;
    public noResults = false;
    public isLoading = false;
    public pageSize = 25;
    public previousKeys: string[] = [];
    public lastEvaluatedKey?: string;
    public query?: any;
    public isLastPage = false;
    public selectedRecords: GovernanceRecord[] = [];
    public RecordStatus = RecordStatus;
    public actionContext: ActionContext = {
        records: [],
        showPanel: false,
    };

    private triggerSearchSubject = new Subject();
    private governanceSearchService = inject(GovernanceSearchService);
    private searchFilterValueService = inject(SearchFilterValueService);
    private readonly recordPropertiesButtonService = inject(RecordPropertiesButtonService);
    private governanceRecordService = inject(GovernanceRecordService);
    private governanceLegalHoldManagementService = inject(GovernanceLegalHoldManagementService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.triggerSearchSubject.pipe(debounceTime(500)).subscribe({
            next: () => this.search(),
        });

        this.recordPropertiesButtonService.showSidebar$.pipe(distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe({
            next: (shouldShow) => {
                this.actionContext = { ...this.actionContext, showPanel: shouldShow };
                this.actionContextChange.emit(this.actionContext);
                this.sidebarToggle.emit(shouldShow);
            },
            error: ({ error }) => console.error(error),
        });

        this.governanceRecordService.updateConfirmed$.pipe(filter(Boolean), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.search(),
            error: ({ error }) => console.error(error),
        });

        this.governanceRecordService.deleteConfirmed$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.search(),
            error: ({ error }) => console.error(error),
        });

        this.governanceLegalHoldManagementService.recordAssigned$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.search(),
            error: ({ error }) => console.error(error),
        });
    }

    ngOnInit() {
        merge(
            this.searchFilterValueService.filterApplied$.pipe(map(() => 'applied')),
            this.searchFilterValueService.filterReset$.pipe(map(() => 'reset'))
        )
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(() => this.debounceSearch());
    }

    public search(direction: 'next' | 'prev' | 'init' = 'init'): void {
        if (!this.searchFilterValueService.hasFilters()) {
            this.reset();
            this.isLoading = false;
            return;
        }

        this.hasPendingChanges = true;
        this.initialState = false;
        this.isLoading = true;

        let exclusiveStartKey: string | undefined;
        if (direction === 'next') {
            exclusiveStartKey = this.lastEvaluatedKey;
        } else if (direction === 'prev') {
            exclusiveStartKey = this.previousKeys.at(-2);
            this.previousKeys.pop(); // Remove current key
        } else {
            // init => remove the cache if any
            this.governanceSearchService.clearCache();
            exclusiveStartKey = undefined;
        }

        this.governanceSearchService
            .search(this.buildSearchParams(), {
                exclusiveStartKey,
                limit: this.pageSize,
            })
            .pipe(
                map((response) => ({
                    records: response.content,
                    lastEvaluatedKey: response.lastEvaluatedKey,
                })),
                takeUntilDestroyed(this.destroyRef),
                finalize(() => (this.isLoading = false))
            )
            .subscribe({
                next: ({ records, lastEvaluatedKey }) => {
                    this.noResults = records.length === 0;
                    this.records = records;

                    if (direction === 'next' && this.lastEvaluatedKey) {
                        this.previousKeys.push(this.lastEvaluatedKey);
                    }

                    if (direction === 'init') {
                        this.previousKeys = [];
                    }

                    this.lastEvaluatedKey = lastEvaluatedKey;
                    this.isLastPage = records.length < this.pageSize;
                },
                error: (error) => {
                    this.noResults = true;
                    this.isLoading = false;
                    console.error('Governance Search failed:', error);
                },
            });
    }

    reset(): void {
        this.hasPendingChanges = false;
        this.initialState = true;
        this.noResults = false;
        this.isLoading = false;
        this.previousKeys = [];
        this.lastEvaluatedKey = undefined;
        this.searchFilterValueService.clearFilters();
    }

    get isAllSelected(): boolean {
        return this.recordList?.isAllSelected() ?? false;
    }

    public toggleSelectAll(select: boolean): void {
        if (select) {
            this.recordList.selectAll();
        } else {
            this.recordList.clearSelection();
        }
    }

    public onSelectionChanged(records: GovernanceRecord[]): void {
        this.selectedRecords = records;
        this.actionContext = { ...this.actionContext, records };

        // Emit changes
        this.selectedRecordsChange.emit(this.selectedRecords);
        this.actionContextChange.emit(this.actionContext);

        if (this.selectedRecords.length === 0 || this.selectedRecords.length === 2) {
            const updatedContext = { ...this.actionContext, showPanel: false };
            this.recordPropertiesButtonService.execute(updatedContext);

            // Emit false to hide sidebar
            this.sidebarToggle.emit(false);
        }
    }

    public onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.lastEvaluatedKey = undefined;
        this.search('init');
    }

    public loadNextPage() {
        if (this.lastEvaluatedKey) {
            this.search('next');
        }
    }

    public loadPreviousPage() {
        if (this.previousKeys.length > 0) {
            this.search('prev');
        }
    }

    private debounceSearch(): void {
        this.triggerSearchSubject.next(undefined);
    }

    /**
     * Builds the search params based on the current filters.
     */
    private buildSearchParams() {
        this.query = this.searchFilterValueService.toQueryParams();
        return this.query;
    }
}
