/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter } from '@alfresco-dbp/shared-filters-services';
import { ChangeDetectorRef, EventEmitter, inject } from '@angular/core';

export abstract class FilterComponent<T = Filter> {
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    filter: T | undefined;
    filterChange: EventEmitter<T> = new EventEmitter<T>();
    filterRemove: EventEmitter<void> = new EventEmitter<void>();

    isMenuOpen = false;

    setUp(filter: T): void {
        this.filter = filter;
    }

    markForCheck(): void {
        this.changeDetectorRef.markForCheck();
    }

    removeFilter(): void {
        this.filterRemove.emit();
    }

    abstract onUpdate(data: any): void;
}
