/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter, FilterType } from '@alfresco-dbp/shared-filters-services';
import { ComponentRef, DestroyRef, Directive, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewContainerRef } from '@angular/core';
import { getFilterComponent as getFilterComponentType } from './filter-component-map';
import { FilterComponent } from './filter.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Directive({
    selector: '[hxpFilterFactory]',
    standalone: true,
})
export class FilterFactoryDirective<T extends Filter = Filter> implements OnChanges {
    @Input() type?: FilterType;
    @Input('hxpFilterFactory') filter!: T;
    @Output() filterChange = new EventEmitter<T>();
    @Output() filterRemove: EventEmitter<void> = new EventEmitter<void>();

    private readonly container = inject(ViewContainerRef);
    private filterComponent?: ComponentRef<FilterComponent<T>>;
    private readonly destroyRef = inject(DestroyRef);

    ngOnChanges(changes: SimpleChanges) {
        const typeChanged = 'type' in changes && changes['type'].previousValue !== changes['type'].currentValue;

        if (typeChanged && this.type) {
            this.initFilter(this.type);
        }

        if ('filter' in changes && this.filter) {
            this.applyFilterInput(this.filter);
        }
    }

    private initFilter(type: FilterType): void {
        const filterComponentType = getFilterComponentType<T>(type);

        if (!filterComponentType) {
            return;
        }

        if (this.filterComponent) {
            this.container.clear();
            this.filterComponent = undefined;
        }

        this.filterComponent = this.container.createComponent(filterComponentType);

        if (this.filter) {
            this.applyFilterInput(this.filter);

            this.filterComponent.instance.filterChange.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: T) => {
                this.filterChange.emit(value);
            });

            this.filterComponent.instance.filterRemove.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
                this.filterRemove.emit();
            });
        }
    }

    private applyFilterInput(filter: T): void {
        if (this.filterComponent) {
            this.filterComponent.instance.filter = filter;
            this.filterComponent.instance.markForCheck();
        }
    }
}
