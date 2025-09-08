/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    BaseFilterFormType,
    SearchFilterData,
    SearchFilterValueService,
    FilterId,
    BaseSearchFilter,
} from '@alfresco/adf-hx-content-services/services';
import { Directive, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { SearchFilterContainerComponent } from '../filters/search-filter-container/search-filter-container.component';

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

    constructor(protected searchFilterValueService: SearchFilterValueService) {
        this.filterForm = new FormGroup(this.getFormControls());
        this.initialFormValue = { ...this.filterForm.value };
        this.oldFormValue = { ...this.filterForm.value };
    }

    /**
     * Gets the unique identifier of the filter.
     * Note that filters should contribute their own id to the FilterId type.
     */
    public abstract get id(): FilterId;

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

    /**
     * Populates whatever properties the filter needs with the provided data and updates the filter container.
     */
    populateWith(data: SearchFilterData): void {
        this.setData(data);

        if (this.searchFilterContainer) {
            this.searchFilterContainer.selectedValue = this.selectedValue;
            this.searchFilterContainer.applyChanges();
        }
        this.applyFilter();
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
     * Converts the provided data value to an HXQL string.
     */
    abstract toHXQL(data: SearchFilterData): string;

    /**
     * Filters extending this class should implement this method to provide the necessary form controls.
     */
    protected abstract getFormControls(): { [key: string]: AbstractControl };

    /**
     * Sets the provided data to the filter's internal properties.
     * Filters extending this class should implement this method to populate their properties with the provided data.
     */
    protected abstract setData(data: SearchFilterData): void;
}
