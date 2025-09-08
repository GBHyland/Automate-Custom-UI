/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ChangeDetectorRef, Directive, OnInit, DestroyRef, inject, ViewChild, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';
import { SelectionModel } from '@angular/cdk/collections';
import { BehaviorSubject, Observable } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BaseSearchFilterDirective } from '../base-search-filter.directive';
import { MultiSelectListFilterFormType } from './multi-select-list-filter-form.type';
import { MultiSelectListSearchFilterData, MultiSelectListSearchFilterValue } from './multi-select-list-search-filter.data';
import { SearchFilterInputComponent } from '../search-filter-input/search-filter-input.component';

@Directive()
export abstract class MultiSelectListSearchFilterBase<T extends MultiSelectListSearchFilterValue = MultiSelectListSearchFilterValue>
    extends BaseSearchFilterDirective<MultiSelectListFilterFormType>
    implements OnInit
{
    @Input() filterLabelKey = '';

    protected showSearchInput = true;
    protected showSummaryChips = true;

    protected isLoading = false;
    protected options: T[] = [];
    protected filteredOptions: T[] = [];
    protected searchTerm = '';
    protected selection = new SelectionModel<MultiSelectListSearchFilterValue>(true, []);
    @ViewChild(SearchFilterInputComponent) protected searchFilterComponent?: SearchFilterInputComponent;

    private search$ = new BehaviorSubject<string>('');

    private changeDetectorRef = inject(ChangeDetectorRef);
    private destroy = inject(DestroyRef);

    ngOnInit(): void {
        this.isLoading = true;
        this.loadOptions()
            .pipe(takeUntilDestroyed(this.destroy))
            .subscribe((list) => {
                this.options = this.filteredOptions = list;
                this.isLoading = false;
                this.changeDetectorRef.markForCheck();
            });
        this.search$.pipe(takeUntilDestroyed(this.destroy)).subscribe((term) => this.applyClientFilter(term));
    }

    override clearFilter(): void {
        super.clearFilter();
        this.searchFilterComponent?.clearInput();
        this.selection.clear();
        this.searchFilterContainer.clearChanges();
    }

    override applyFilter(): void {
        if (this.selection.selected.length === 0) {
            return this.clearFilter();
        }
        super.applyFilter();
        this.clearSearch();
    }

    override overlayClosed(): void {
        this.selection.clear();
        if (this.oldFormValue.selectedValues.length > 0) {
            for (const selectedValue of this.oldFormValue.selectedValues) {
                this.selection.select(selectedValue);
            }
        }

        this.discardPendingChanges();
        this.clearSearch();
    }

    /**
     * Override this method to provide the options for the multi-select filter.
     */
    protected abstract loadOptions(): Observable<T[]>;

    protected getFormControls(): { [key: string]: AbstractControl } {
        return { selectedValues: new FormControl([]) };
    }

    protected onSearch(term: string): void {
        this.searchTerm = term;
        this.search$.next(term.toLowerCase());
    }

    protected onSelectionChange(value: MultiSelectListSearchFilterValue): void {
        this.selection.toggle(value);
        this.setSelectedValue();
    }

    protected onDeselect(value: MultiSelectListSearchFilterValue): void {
        this.selection.deselect(value);
        this.setSelectedValue();
    }

    protected clearSearch(): void {
        this.clearInput();
        this.searchFilterComponent?.clearInput();
    }

    protected clearInput(): void {
        this.searchTerm = '';
        this.filteredOptions = this.options;
        this.changeDetectorRef.markForCheck();
    }

    private applyClientFilter(term: string): void {
        this.filteredOptions = this.options.filter(
            (option) => option.label.toLowerCase().includes(term) || option.tooltip?.toLowerCase().includes(term)
        );
        this.changeDetectorRef.markForCheck();
    }

    protected setSelectedValue(): void {
        this.filterForm.patchValue({
            selectedValues: this.selection.selected,
        });

        if (this.selection.selected.length === 0) {
            this.selectedValue = undefined;
            return;
        }

        const selectedValues =
            this.selection.selected.length === 0
                ? undefined
                : this.selection.selected.map((sel) => ({
                      ...sel,
                  }));

        this.selectedValue = new MultiSelectListSearchFilterData(selectedValues);
    }
}
