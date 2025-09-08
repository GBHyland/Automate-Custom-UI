/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, inject } from '@angular/core';
import { DateSearchFilterBase } from '../base/date-filter/date-search-filter.directive';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { TranslatePipe } from '@ngx-translate/core';
import { SearchFilterContainerComponent } from '../base/search-filter-container/search-filter-container.component';
import { SearchFilterData } from '../../models/search-filter.data';
import { CutoffSearchFilterService } from './cutoff-search-filter.service';

@Component({
    selector: 'hxp-governance-cutoff-search-filter',
    standalone: true,
    templateUrl: '../base/date-filter/date-search-filter.directive.html',
    styleUrls: ['../base/date-filter/date-search-filter.directive.scss'],
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatDividerModule,
        MatDatepickerModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        ReactiveFormsModule,
        TranslatePipe,
        SearchFilterContainerComponent,
    ],
    providers: [CutoffSearchFilterService],
})
export class CutoffSearchFilterComponent extends DateSearchFilterBase {
    private readonly cutoffSearchFilterService = inject(CutoffSearchFilterService);

    constructor() {
        super();
        this.filterLabelKey = 'GOVERNANCE.SEARCH.FILTERS.CUTOFF.LABEL';
    }

    toQueryParams(data: SearchFilterData): Record<string, any> {
        return this.cutoffSearchFilterService.toQueryParams(data);
    }
}
