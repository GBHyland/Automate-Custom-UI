/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NumberFilter, NumberFilterOperatorType, NumberFilterValue } from '@alfresco-dbp/shared-filters-services';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FilterComponent } from '../filter.component';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { NumberFilterMenuComponent } from './number-filter-menu/number-filter-menu.component';
import { FilterMenuOverlayDirective } from '../../filter-menu/filter-menu-overlay.directive';

export const OPERATOR_ICON_MAP = new Map<NumberFilterOperatorType, string>([
    [NumberFilterOperatorType.EQUALS, '='],
    [NumberFilterOperatorType.NOT_EQUALS, '&ne;'],
    [NumberFilterOperatorType.LESS_THAN, '&lt;'],
    [NumberFilterOperatorType.LESS_THAN_OR_EQUALS, '&le;'],
    [NumberFilterOperatorType.GREATER_THAN, '&gt;'],
    [NumberFilterOperatorType.GREATER_THAN_OR_EQUALS, '&ge;'],
    [NumberFilterOperatorType.BETWEEN, '–'],
]);

@Component({
    selector: 'hxp-number-filter',
    templateUrl: './number-filter.component.html',
    standalone: true,
    imports: [CommonModule, FilterMenuOverlayDirective, OverlayModule, TranslatePipe, FilterChipComponent, NumberFilterMenuComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NumberFilterComponent extends FilterComponent<NumberFilter> implements OnInit {
    private readonly translateService = inject(TranslateService);

    labelSuffix = '';

    compareOptions: Map<NumberFilterOperatorType, string> = OPERATOR_ICON_MAP;

    ngOnInit(): void {
        this.updateSuffix();
    }

    override setUp(filter: NumberFilter): void {
        super.setUp(filter);

        if (filter.compareOptions) {
            this.compareOptions = filter.compareOptions;
        }
    }

    onUpdate(data: NumberFilterValue): void {
        if (!this.filter) {
            return;
        }

        this.filter.value = data;

        this.filterChange.emit(this.filter);
        this.updateSuffix();
        this.isMenuOpen = false;
    }

    private updateSuffix(): void {
        if (!this.filter?.value) {
            return;
        }

        if (this.filter.value.value1 === null) {
            this.labelSuffix = '';
            return;
        }

        const { value1, value2, operator } = this.filter.value;

        if (operator === NumberFilterOperatorType.BETWEEN) {
            this.labelSuffix = this.translateService.instant('FILTERS.NUMBER_FILTER.RANGE.BETWEEN_AND', { from: value1, to: value2 });
        } else {
            const operatorTranslationKey = `FILTERS.NUMBER_FILTER.${operator}`;
            const translatedOperator = this.translateService.instant(operatorTranslationKey);
            this.labelSuffix = `${translatedOperator} ${value1}`;
        }
    }
}
