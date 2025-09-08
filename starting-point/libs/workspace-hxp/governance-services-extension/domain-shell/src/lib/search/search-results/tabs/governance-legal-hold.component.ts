/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, ViewChild, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { RecordListComponent } from '.././record-list/record-list.component';
import { LegalCase } from '../../../mocks/record.type';
import { DataColumnComponent } from '.././record-list/data-column.component';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { SatIconModule } from '@hylandsoftware/satori-ui';
import { GovernanceLegalHoldService } from '../services/legal-hold/governance-legal-hold.service';
import { TableSkeletonLoaderComponent } from '@alfresco/adf-hx-content-services/ui';
import { ResultsPaginatorComponent } from '../pagination/results-paginator.component';
import { Sort } from '@angular/material/sort';
import { SearchBoxComponent } from '../../filters/search-box/search-box.component';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CreateLegalHoldCaseButtonComponent } from '../../../legal-hold-management/actions/create-legal-hold-case-button/create-legal-hold-case-button.component';
import { LegalHoldInitiator, LegalHoldInitiatorType } from '../../../legal-hold-management/config/legal-config.type';
import { GovernanceLegalHoldManagementService } from '../../../legal-hold-management/services/governance-legal-hold-management.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
    selector: 'hxp-governance-legal-hold',
    standalone: true,
    templateUrl: './governance-legal-hold.component.html',
    styleUrls: ['./governance-legal-hold.component.scss'],
    imports: [
        NgClass,
        RecordListComponent,
        DataColumnComponent,
        MatIconModule,
        DatePipe,
        TranslatePipe,
        SatIconModule,
        TableSkeletonLoaderComponent,
        ResultsPaginatorComponent,
        SearchBoxComponent,
        CreateLegalHoldCaseButtonComponent,
    ],
})
export class GovernanceLegalHoldComponent implements OnInit, OnDestroy {
    @ViewChild('legalCasesList') public legalCasesList!: RecordListComponent;

    legalCases: LegalCase[] = [];
    selectedLegalCases: LegalCase[] = [];
    @Output() selectedLegalCase = new EventEmitter<LegalCase[]>();
    noResults = false;
    isLoading = false;
    pageSize = 25;
    sortColumn = 'dateOfCreation';
    sortDirection: 'asc' | 'desc' | '' = 'desc';
    searchText = '';
    allCases: LegalCase[] = [];
    lastEvaluatedKey = '';
    pageKeyStack: string[] = [];
    currentPageIndex = 0;

    @Input() clickedFrom: LegalHoldInitiatorType = LegalHoldInitiator.Legal;

    private onDestroy$ = new Subject<void>();

    constructor(
        private legalHoldService: GovernanceLegalHoldService,
        private sanitizer: DomSanitizer,
        private governanceLegalHoldManagementService: GovernanceLegalHoldManagementService
    ) {
        this.governanceLegalHoldManagementService.shouldRefreshList$.pipe(takeUntil(this.onDestroy$)).subscribe((shouldReopen: boolean) => {
            if (shouldReopen) {
                this.queryTable('', true);
            }
        });
    }

    ngOnInit() {
        this.queryTable('', true);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }

    hasSelection(): boolean {
        return this.selectedLegalCases.length > 0;
    }

    onSelectionChanged(cases: LegalCase[]): void {
        this.selectedLegalCases = cases;
        this.selectedLegalCase.emit(this.selectedLegalCases);
    }

    clearAll(): void {
        this.selectedLegalCases = [];
        this.legalCasesList.clearSelection();
    }

    onPageSizeChange(size: number): void {
        this.pageSize = size;
        this.resetPagination();
        this.queryTable('', true);
    }

    loadNextPage() {
        if (!this.lastEvaluatedKey) return;

        this.currentPageIndex++;
        this.pageKeyStack[this.currentPageIndex] = this.lastEvaluatedKey;
        this.queryTable(this.lastEvaluatedKey, false);
    }

    loadPreviousPage() {
        if (this.currentPageIndex <= 0) return;

        this.currentPageIndex--;
        const prevKey = this.pageKeyStack[this.currentPageIndex];
        this.queryTable(prevKey, true);
    }

    queryTable(lastEvaluatedKey = '', navigatingBack = false): void {
        this.isLoading = true;
        this.searchText = '';

        this.legalHoldService
            .queryLegalCases({
                lastEvalKey: lastEvaluatedKey,
                limit: this.pageSize,
            })
            .subscribe({
                next: (records) => {
                    this.legalCases = this.allCases = records.contents;
                    this.isLoading = false;
                    this.noResults = records.contents.length === 0;

                    this.lastEvaluatedKey = records.lastEvaluatedKey || '';

                    // Only store forward keys when going forward
                    if (!navigatingBack && this.lastEvaluatedKey) {
                        this.pageKeyStack[this.currentPageIndex + 1] = this.lastEvaluatedKey;
                    }
                },
                error: (err) => {
                    console.error('Error loading legal holds', err);
                    this.isLoading = false;
                    this.noResults = true;
                },
            });
    }

    onSortingChanged(sort: Sort) {
        this.sortColumn = sort.active;
        this.sortDirection = sort.direction as 'asc' | 'desc' | '';
        this.resetPagination();
        // Reload the data with the new sorting
        this.queryTable('', true);
    }

    onSearchInputChange(value: string): void {
        this.searchText = value.trim().toLowerCase();
        this.applyFilter();
    }

    resetPagination(): void {
        this.pageKeyStack = [''];
        this.currentPageIndex = 0;
        this.lastEvaluatedKey = '';
    }

    applyFilter(): void {
        this.legalCases = this.searchText
            ? this.allCases.filter((record) => record.legalCaseName?.toLowerCase().includes(this.searchText))
            : this.allCases;

        this.noResults = this.legalCases.length === 0;
    }

    private static readonly REGEX_ESCAPE_PATTERN = /[.*+?^${}()|[\]\\]/g;

    highlightMatch(text: string): SafeHtml {
        if (!text || !this.searchText) {
            return text;
        }

        const escapedSearchText = this.searchText.replace(GovernanceLegalHoldComponent.REGEX_ESCAPE_PATTERN, '\\$&');
        const regex = new RegExp(`(${escapedSearchText})`, 'gi');

        const highlighted = text.replace(regex, '<mark>$1</mark>');
        return this.sanitizer.bypassSecurityTrustHtml(highlighted);
    }

    get selectedCount(): number {
        return this.selectedLegalCases.length;
    }

    get previousDisabled(): boolean {
        return this.currentPageIndex <= 0;
    }

    get nextDisabled(): boolean {
        return !this.lastEvaluatedKey;
    }
}
