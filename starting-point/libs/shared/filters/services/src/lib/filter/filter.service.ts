/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Filter } from './filter.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, map, share, take } from 'rxjs/operators';
import { cloneDeep } from 'es-toolkit/compat';
import { isProcessVariableFilter } from './utils';

@Injectable()
export class FilterService {
    // stores the filters set in setFilters or resetFilters
    private originalFilters: Filter[] = [];
    // stores the filters set in update
    private mostRecentFilters: Filter[] = [];

    private filtersSubject$ = new BehaviorSubject<Filter[]>([]);

    // indicates if the filters have been changed from their original state
    filtersDirty$ = this.filtersSubject$.pipe(
        map((currentFilters) => {
            return currentFilters.some((currentFilter) => {
                const originalFilter = this.originalFilters.find((f) => f.name === currentFilter.name);
                if (!originalFilter) {
                    throw new Error(`Filter ${currentFilter.name} not found in original filters`);
                }
                return !originalFilter.isValueEqualTo(currentFilter);
            });
        })
    );

    // indicates if the filter values have been changed from their most recent state
    filterValuesChanged$ = this.filtersSubject$.pipe(
        map((currentFilters) => {
            const areFiltersUpdated = currentFilters.some((currentFilter) => {
                const mostRecentFilter = this.mostRecentFilters.find((f) => f.name === currentFilter.name);
                if (!mostRecentFilter) {
                    throw new Error(`Filter ${currentFilter.name} not found in mostRecent filters`);
                }
                return !mostRecentFilter.isValueEqualTo(currentFilter);
            });
            this.mostRecentFilters = cloneDeep(currentFilters);
            return areFiltersUpdated;
        })
    );

    getAllFilters(): Observable<Filter[]> {
        return this.filtersSubject$.pipe(
            filter((filters) => !!filters?.length),
            map((filters) => this.sortFilters(filters)),
            share()
        );
    }

    setFilters(filters: Filter[]): void {
        this.originalFilters = cloneDeep(filters);
        this.mostRecentFilters = cloneDeep(filters);
        this.filtersSubject$.next(filters);
    }

    resetFilters(): void {
        this.filtersSubject$.next(this.originalFilters);
    }

    updateFilter(updatedFilter: Filter): void {
        if (!updatedFilter.visible) {
            updatedFilter.value = null;
        }

        this.filtersSubject$.pipe(take(1)).subscribe((previousFilters) => {
            const updatedFilters = previousFilters.map((previousFilter) => {
                return previousFilter.name === updatedFilter.name ? updatedFilter : previousFilter;
            });

            this.filtersSubject$.next(updatedFilters);
        });
    }

    /**
     * Sorts an array of filters based on specific criteria.
     *
     * The sorting strategy is as follows:
     * 1. If the filter's name is 'appName', it is placed first.
     * 2. Filters that are process variable filters are placed after default filters.
     * 3. Filters that are visible are placed before those that are hidden.
     * 4. If both filters are either visible or not visible, they are sorted alphabetically by their label.
     *
     * [appName, Not appName]
     *          V
     * [Default filters, Process variable filters]
     *          V
     * [Visible filters, Hidden filters]
     *          V
     * [Alphabetical order]
     *
     * @param filters - The array of filters to be sorted.
     * @returns The sorted array of filters.
     */
    sortFilters(filters: Filter[]): Filter[] {
        return filters.sort((a, b) => {
            if (a.name === 'appName') {
                return -1;
            } else if (b.name === 'appName') {
                return 1;
            } else if (isProcessVariableFilter(a) && !isProcessVariableFilter(b)) {
                return 1;
            } else if (!isProcessVariableFilter(a) && isProcessVariableFilter(b)) {
                return -1;
            } else if (a.visible && !b.visible) {
                return -1;
            } else if (!a.visible && b.visible) {
                return 1;
            } else {
                return a.label.localeCompare(b.label);
            }
        });
    }
}
