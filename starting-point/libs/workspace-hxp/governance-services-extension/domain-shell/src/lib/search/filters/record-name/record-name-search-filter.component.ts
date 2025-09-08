/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecordNameSearchFilterService } from './record-name-search-filter.service';
import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchFilterContainerComponent } from '../base/search-filter-container/search-filter-container.component';
import { MatInputModule } from '@angular/material/input';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { BaseSearchFilterDirective } from '../base/base-search-filter.directive';
import { RecordNameSearchFilterData } from './record-name-search-filter.data';

@Component({
    selector: 'hxp-record-name-search-filter',
    templateUrl: './record-name-search-filter.component.html',
    styleUrls: ['./record-name-search-filter.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTooltipModule,
        SearchFilterContainerComponent,
        MatInputModule,
        MatFormFieldModule,
        MatChipsModule,
        MatError,
        TranslatePipe,
    ],
    providers: [RecordNameSearchFilterService],
})
export class RecordNameSearchFilterComponent extends BaseSearchFilterDirective {
    inputValue = '';
    private recordNameSearchFilterService = inject(RecordNameSearchFilterService);

    protected override getFormControls(): { [key: string]: AbstractControl } {
        return {
            selectedRecordName: new FormControl([]),
        };
    }

    protected get isValid() {
        return this.filterForm.valid;
    }

    protected override overlayClosed(): void {
        super.overlayClosed();
        this.inputValue = this.oldFormValue['selectedRecordName'].length === 0 ? '' : this.oldFormValue['selectedRecordName'];
    }

    override clearFilter(): void {
        super.clearFilter();
        this.inputValue = '';
        this.searchFilterContainer.clearChanges();
    }

    override clearChanges(): void {
        super.clearChanges();
        this.inputValue = '';
    }

    protected onInputChange(event: Event): void {
        const inputElement = event.target as HTMLInputElement;
        this.inputValue = inputElement.value;

        if (this.inputValue === '') {
            this.filterForm.markAsPristine();
            return;
        }

        this.filterForm.get('selectedRecordName')?.setErrors(null);
        this.filterForm.markAsDirty();
        this.setSelectedValue();
    }

    protected setSelectedValue(): void {
        if (this.filterForm.valid) {
            this.filterForm?.patchValue({
                selectedRecordName: this.inputValue,
            });

            const selectedValues = [{ label: this.inputValue, value: this.inputValue }];
            this.selectedValue = new RecordNameSearchFilterData(selectedValues);
        }
    }

    public toQueryParams(data: RecordNameSearchFilterData): Record<string, string> {
        return this.recordNameSearchFilterService.toQueryParams(data);
    }
}
