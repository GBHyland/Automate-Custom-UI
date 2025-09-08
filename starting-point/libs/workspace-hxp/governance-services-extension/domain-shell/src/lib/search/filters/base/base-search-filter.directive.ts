/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Directive, EventEmitter, inject, Input, Output, ViewChild } from '@angular/core';
import { SearchFilterData } from '../../models/search-filter.data';
import { AbstractControl, FormGroup } from '@angular/forms';
import { BaseFilterFormType } from '../../models/base-search-filter-form.type';
import { SearchFilterContainerComponent } from './search-filter-container/search-filter-container.component';
import { SearchFilterValueService } from './search-filter-value.service';
import { BaseSearchFilter } from '../../models/search-filter.interface';

@Directive()
export abstract class BaseSearchFilterDirective<T = BaseFilterFormType> implements BaseSearchFilter {
    @Input()
    selectedValue?: SearchFilterData;

    @Output()
    filterCleared: EventEmitter<void> = new EventEmitter();

    @Output()
    filterApplied: EventEmitter<SearchFilterData | undefined> = new EventEmitter();

    @ViewChild('searchFilter')
    protected searchFilterContainer!: SearchFilterContainerComponent;

    protected filterForm: FormGroup;
    protected oldFormValue: T;
    protected initialFormValue: T;

    value?: SearchFilterData;

    [key: string]: any;

    protected searchFilterValueService: SearchFilterValueService = inject(SearchFilterValueService);

    constructor() {
        this.filterForm = new FormGroup(this.getFormControls());
        this.initialFormValue = { ...this.filterForm.value };
        this.oldFormValue = { ...this.filterForm.value };
    }

    clearFilter(): void {
        this.clearChanges();
        this.filterCleared.emit();
        this.searchFilterValueService.filterReset$.next(this as BaseSearchFilterDirective);
        this.clearForm();
    }

    applyFilter(): void {
        this.applyChanges();
        this.filterApplied.emit(this.value);
        this.searchFilterValueService.filterApplied$.next({
            filter: this,
            value: this.value as SearchFilterData,
        });
    }

    applyChanges(): void {
        this.value = this.selectedValue;
        this.oldFormValue = { ...this.filterForm.value };
    }

    clearChanges(): void {
        this.selectedValue = undefined;
        this.value = undefined;
        this.clearForm();
    }

    /**
     * A change is pending if the currently selected value is different from the value already applied.
     */
    hasPendingChanges(): boolean {
        return this.oldFormValue !== this.filterForm.value || this.value !== this.selectedValue;
    }

    /**
     * Discards pending changes by resetting the selected value to the applied value.
     */
    discardPendingChanges(): void {
        this.selectedValue = this.value;
        this.filterForm.setValue({ ...(this.oldFormValue as SearchFilterData) });
    }

    protected clearForm(): void {
        this.filterForm.reset({ ...this.initialFormValue });
        this.oldFormValue = { ...this.initialFormValue };
    }

    /**
     * Called when the overlay is closed.
     * Discards any pending changes, because neither clear and filter actions were applied.
     */
    protected overlayClosed(): void {
        this.discardPendingChanges();
    }

    /**
     * Filters extending this class should implement this method to provide the necessary form controls.
     */
    protected abstract getFormControls(): { [key: string]: AbstractControl };

    /**
     * Converts the provided data value to query parameters.
     */
    abstract toQueryParams(data: SearchFilterData): Record<string, any>;
}
