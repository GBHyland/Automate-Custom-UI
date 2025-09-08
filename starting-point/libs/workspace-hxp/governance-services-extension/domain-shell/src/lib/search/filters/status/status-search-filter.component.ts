/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MultiSelectListSearchFilterBase } from '../base/multi-select-list-filter/multi-select-list-search-filter.directive';
import { StatusSearchFilterService } from './status-search-filter.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { SearchFilterContainerComponent } from '../base/search-filter-container/search-filter-container.component';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
    MultiSelectListSearchFilterData,
    MultiSelectListSearchFilterValue,
} from '../base/multi-select-list-filter/multi-select-list-search-filter.data';
import { SearchFilterInputComponent } from '../base/search-filter-input/search-filter-input.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SearchFilterData } from '../../models/search-filter.data';

@Component({
    selector: 'hxp-governance-search-status-filter',
    standalone: true,
    templateUrl: '../base/multi-select-list-filter/multi-select-list-search-filter.directive.html',
    styleUrls: ['../base/multi-select-list-filter/multi-select-list-search-filter.directive.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatTooltipModule,
        MatProgressSpinnerModule,
        ReactiveFormsModule,
        SearchFilterContainerComponent,
        TranslatePipe,
        SearchFilterInputComponent,
    ],
})
export class StatusSearchFilterComponent extends MultiSelectListSearchFilterBase {
    private readonly statusSearchFilterService = inject(StatusSearchFilterService);

    constructor() {
        super();
        this.filterLabelKey = 'GOVERNANCE.SEARCH.FILTERS.STATUS.LABEL';
    }

    toQueryParams(data: SearchFilterData): Record<string, any> {
        return this.statusSearchFilterService.toQueryParams(data as MultiSelectListSearchFilterData);
    }

    protected loadOptions(): Observable<MultiSelectListSearchFilterValue[]> {
        return of(this.statusSearchFilterService.getStatuses());
    }
}
