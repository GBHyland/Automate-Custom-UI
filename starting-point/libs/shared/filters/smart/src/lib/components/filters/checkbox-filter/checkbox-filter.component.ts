/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { CheckboxFilter, Option } from '@alfresco-dbp/shared-filters-services';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FilterComponent } from '../filter.component';
import { CommonModule } from '@angular/common';
import { OverlayModule } from '@angular/cdk/overlay';
import { FilterChipComponent } from '../../filter-chip/filter-chip.component';
import { CheckboxFilterMenuComponent } from './checkbox-filter-menu/checkbox-filter-menu.component';
import { cloneDeep } from 'es-toolkit/compat';
import { FilterMenuOverlayDirective } from '../../filter-menu/filter-menu-overlay.directive';

@Component({
    selector: 'hxp-checkbox-filter',
    templateUrl: './checkbox-filter.component.html',
    standalone: true,
    imports: [CommonModule, FilterMenuOverlayDirective, OverlayModule, FilterChipComponent, CheckboxFilterMenuComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFilterComponent extends FilterComponent<CheckboxFilter> implements OnInit {
    labelSuffix: { label: string; count: number } | null = null;

    options: Option[] = [];

    ngOnInit(): void {
        if (!this.filter) {
            return;
        }

        this.filter.options.forEach((option) => {
            option.checked = !!this.filter?.value?.find((o) => o.value === option.value);
        });
        this.options = cloneDeep(this.filter.options);
        this.updateSuffix();
    }

    onFilterButtonClick(): void {
        if (!this.filter) {
            return;
        }

        this.filter.options.forEach((option) => {
            option.checked = !!this.filter?.value?.find((o) => o.value === option.value);
        });
        this.options = cloneDeep(this.filter.options);
        this.isMenuOpen = !this.isMenuOpen;
    }

    onUpdate(selectedOptions: Option[]): void {
        if (!this.filter) {
            return;
        }

        this.filter.value = selectedOptions.length > 0 ? selectedOptions : null;
        this.updateSuffix();
        this.isMenuOpen = false;
        this.filterChange.emit(this.filter);
    }

    private updateSuffix(): void {
        if (!this.filter) {
            return;
        }

        const selectedOptions = this.filter.value;
        this.labelSuffix = selectedOptions?.length
            ? {
                  label: selectedOptions[0].label,
                  count: selectedOptions.length,
              }
            : null;
    }
}
