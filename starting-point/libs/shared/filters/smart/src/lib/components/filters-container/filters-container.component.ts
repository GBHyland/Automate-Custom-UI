/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter, FilterService } from '@alfresco-dbp/shared-filters-services';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject, ChangeDetectionStrategy, OnInit, OnChanges, DestroyRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { FilterFactoryDirective } from '../filters/filter-factory.directive';
import { TranslatePipe } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { withLatestFrom } from 'rxjs/operators';
import { MatChipsModule } from '@angular/material/chips';
import { MoreFiltersMenuComponent } from '../more-filters-menu/more-filters-menu.component';
import { FiltersContainerActionsComponent } from '../filters-container-actions/filters-container-actions.component';
import { cloneDeep } from 'es-toolkit/compat';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTooltipModule } from '@angular/material/tooltip';

export type FiltersContainerActions = 'save' | 'saveAs' | 'delete' | 'reset';

@Component({
    selector: 'hxp-filters-container',
    templateUrl: './filters-container.component.html',
    styleUrls: ['./filters-container.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatExpansionModule,
        OverlayModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        TranslatePipe,
        MatChipsModule,
        FilterFactoryDirective,
        MoreFiltersMenuComponent,
        FiltersContainerActionsComponent,
    ],
    providers: [
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: {
                appearance: 'outline',
                subscriptSizing: 'dynamic',
            },
        },
        FilterService,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FiltersContainerComponent implements OnInit, OnChanges {
    private readonly filterService = inject(FilterService);
    private readonly destroyRef = inject(DestroyRef);

    @Input() filters: Filter[] = [];
    @Input() isDefaultFilter = false;
    @Input() loading = true;
    @Input() visibleActions: FiltersContainerActions[] = ['save', 'saveAs', 'delete', 'reset'];

    @Output() filtersChange = new EventEmitter<Filter[]>();

    @Output() saveFilterAs = new EventEmitter<string>();
    @Output() saveFilter = new EventEmitter<void>();
    @Output() deleteFilter = new EventEmitter<void>();

    allFilters: Filter[] = [];
    visibleFilters: Filter[] = [];

    isMenuOpen = false;
    isPanelExpanded = false;

    ngOnInit(): void {
        this.filterService
            .getAllFilters()
            .pipe(withLatestFrom(this.filterService.filterValuesChanged$), takeUntilDestroyed(this.destroyRef))
            .subscribe(([allFilters, filterValuesChanged]) => {
                this.allFilters = cloneDeep(allFilters);
                this.visibleFilters = allFilters.filter((filter) => filter.visible);
                if (filterValuesChanged) {
                    this.filtersChange.emit(allFilters);
                }
            });
    }

    ngOnChanges(): void {
        if (this.filters.length > 0) {
            this.filterService.setFilters(this.filters);
        }
    }

    onFilterValueChange(filter: Filter): void {
        this.filterService.updateFilter(filter);
    }

    onFilterRemove(filter: Filter): void {
        filter.visible = false;

        this.filterService.updateFilter(filter);
    }

    onFiltersSave(): void {
        this.filterService.setFilters(this.allFilters);
        this.saveFilter.emit();
    }

    trackByFilterName(index: number, filter: Filter): Filter {
        return filter;
    }
}
