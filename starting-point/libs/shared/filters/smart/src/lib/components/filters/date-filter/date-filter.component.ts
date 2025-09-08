/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DateFilter, DateFilterValue, RANGE_DATE_OPTION } from '@alfresco-dbp/shared-filters-services';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FilterComponent } from '../filter.component';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { DateFilterMenuComponent } from './date-filter-menu/date-filter-menu.component';
import { TranslateService } from '@ngx-translate/core';
import { FilterMenuOverlayDirective } from '../../filter-menu/filter-menu-overlay.directive';

@Component({
    selector: 'hxp-date-filter',
    templateUrl: './date-filter.component.html',
    standalone: true,
    imports: [CommonModule, FilterMenuOverlayDirective, OverlayModule, FilterChipComponent, DateFilterMenuComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DateFilterComponent extends FilterComponent<DateFilter> implements OnInit {
    private readonly translateService = inject(TranslateService);

    labelSuffix = '';

    ngOnInit(): void {
        this.updateSuffix();
    }

    onUpdate(newValue: DateFilterValue | null): void {
        if (!this.filter) {
            return;
        }

        if (!newValue?.range && !newValue?.selectedOption) {
            this.filter.value = null;
        } else {
            this.filter.value = newValue;
        }

        this.updateSuffix();
        this.filterChange.emit(this.filter);
        this.isMenuOpen = false;
    }

    private updateSuffix(): void {
        if (!this.filter) {
            return;
        }

        if (this.filter.value?.selectedOption?.value === RANGE_DATE_OPTION.value) {
            const fromLocaleString = this.formatDate(this.filter.value.range?.from);
            const toLocaleString = this.formatDate(this.filter.value.range?.to);

            if (fromLocaleString && toLocaleString) {
                this.labelSuffix = `${fromLocaleString} - ${toLocaleString}`;
            } else if (fromLocaleString) {
                this.labelSuffix = this.translateService.instant('FILTERS.DATE_FILTER.FROM_DATE', { date: fromLocaleString });
            } else if (toLocaleString) {
                this.labelSuffix = this.translateService.instant('FILTERS.DATE_FILTER.TO_DATE', { date: toLocaleString });
            }
        } else {
            this.labelSuffix = this.filter.value?.selectedOption ? this.filter.value.selectedOption.label : '';
        }
    }

    private formatDate(date: Date | undefined): string {
        if (!date) {
            return '';
        }

        if (this.filter.useTime) {
            return date.toLocaleString();
        }

        return date.toLocaleDateString();
    }
}
