/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Inject, Injectable } from '@angular/core';
import { SearchFilterData } from './models/search-filter.data';
import { StorageService } from '@alfresco/adf-core';
import { BaseSearchFilter } from './models/search-filter.interface';
import { IDENTITY_USER_SERVICE_TOKEN, IIdentityUserService } from '../../identity-user/identity-user.service';

@Injectable({
    providedIn: 'root',
})
export class SearchFilterValueStoreService {
    readonly SEARCH_FILTER_VALUES_KEY = 'hxp-search-filters-value-store';

    protected storedValues: Map<string, SearchFilterData> = new Map<string, SearchFilterData>();

    constructor(@Inject(IDENTITY_USER_SERVICE_TOKEN) private identityUserService: IIdentityUserService, private storageService: StorageService) {
        this.load();
    }

    private get storageKey(): string {
        return `${this.identityUserService.getCurrentUserInfo().email}_${this.SEARCH_FILTER_VALUES_KEY}`;
    }

    reset(): void {
        this.storedValues?.clear();
        this.storageService.removeItem(this.storageKey);
    }

    addValue(filter: BaseSearchFilter, data: SearchFilterData): void {
        this.storedValues?.set(filter.id, data);
        this.save();
    }

    deleteValue(filter: BaseSearchFilter): void {
        this.storedValues?.delete(filter.id);
        this.save();
    }

    getValue(filter: BaseSearchFilter): SearchFilterData | undefined {
        return this.storedValues?.get(filter.id);
    }

    hasValues(): boolean {
        return this.storedValues?.size > 0;
    }

    private load(): void {
        const data = this.storageService.getItem(this.storageKey);
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                this.storedValues = new Map<string, SearchFilterData>(Object.entries(parsedData));
            } catch (error) {
                console.error('Error parsing search filter values', error);
            }
        }
    }

    private save(): void {
        const filtersValuesMap: any = {};
        for (const [key, value] of this.storedValues.entries()) {
            filtersValuesMap[key] = value;
        }
        this.storageService.setItem(this.storageKey, JSON.stringify(filtersValuesMap));
    }
}
