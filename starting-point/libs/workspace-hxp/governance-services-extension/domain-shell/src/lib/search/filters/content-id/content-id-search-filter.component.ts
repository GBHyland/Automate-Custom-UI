/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { AbstractControl, FormControl, FormsModule } from '@angular/forms';
import { ContentIdSearchFilterService } from './content-id-search-filter.service';
import { CommonModule } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { TranslatePipe } from '@ngx-translate/core';
import { MatInputModule } from '@angular/material/input';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { ContentIdSearchFilterData } from './content-id-search-filter.data';
import { BaseSearchFilterDirective } from '../base/base-search-filter.directive';
import { SearchFilterContainerComponent } from '../base/search-filter-container/search-filter-container.component';

@Component({
    selector: 'hxp-content-id-search-filter',
    templateUrl: './content-id-search-filter.component.html',
    styleUrls: ['./content-id-search-filter.component.scss'],
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
    providers: [ContentIdSearchFilterService],
})
export class ContentIdSearchFilterComponent extends BaseSearchFilterDirective {
    inputValue = '';

    private contentIdSearchFilterService = inject(ContentIdSearchFilterService);

    protected getFormControls(): { [key: string]: AbstractControl } {
        return {
            selectedContentId: new FormControl([]),
        };
    }

    protected get isValid() {
        return this.filterForm.valid;
    }

    protected override overlayClosed(): void {
        super.overlayClosed();
        this.inputValue = this.oldFormValue['selectedContentId'].length === 0 ? '' : this.oldFormValue['selectedContentId'];
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

        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(this.inputValue)) {
            this.filterForm.get('selectedContentId')?.setErrors({ invalidUuid: true });
            this.filterForm.markAsDirty();
            return;
        }

        this.filterForm.get('selectedContentId')?.setErrors(null);
        this.filterForm.markAsDirty();
        this.setSelectedValue();
    }

    protected setSelectedValue(): void {
        if (this.filterForm.valid) {
            this.filterForm?.patchValue({
                selectedContentId: this.inputValue,
            });

            const selectedValues = [{ label: this.inputValue, value: this.inputValue }];
            this.selectedValue = new ContentIdSearchFilterData(selectedValues);
        }
    }

    public toQueryParams(data: ContentIdSearchFilterData): Record<string, any> {
        return this.contentIdSearchFilterService.toQueryParams(data);
    }
}
