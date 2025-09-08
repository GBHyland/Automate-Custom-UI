/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ExtensionConfig, ExtensionElement, ExtensionService } from '@alfresco/adf-extensions';
import { Inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, toArray } from 'rxjs/operators';

export interface SearchFiltersRef extends ExtensionElement {
    items?: Array<SearchFiltersRef>;
    component?: string;
    rules?: {
        [key: string]: string | undefined;
        enabled?: string;
        visible?: string;
        featureFlag?: string;
    };
}

@Injectable({
    providedIn: 'root',
})
export class SearchFiltersExtensionsService {
    private featureName = 'search';
    private actionType = 'filters';

    constructor(private extensionService: ExtensionService, @Inject(FeaturesServiceToken) private featuresService: IFeaturesService) {}

    getSearchFiltersItems(): Observable<SearchFiltersRef> {
        return this.extensionService.setup$.pipe(
            filter((config) => this.hasFeatureConfig(config)),
            map((config) => this.extractFeatureConfig(config)),
            switchMap((config) => this.filterItemsByFeatureFlag(config)),
            shareReplay(1)
        );
    }

    private hasFeatureConfig(config: ExtensionConfig): boolean {
        return !!config?.features?.[this.featureName]?.[this.actionType];
    }

    private extractFeatureConfig(config: ExtensionConfig): SearchFiltersRef {
        return config.features?.[this.featureName][this.actionType];
    }

    private filterItemsByFeatureFlag(config: SearchFiltersRef): Observable<SearchFiltersRef> {
        return from(config.items || []).pipe(
            switchMap((item) =>
                this.shouldIncludeItem(item).pipe(
                    filter((shouldInclude) => shouldInclude),
                    map(() => item)
                )
            ),
            toArray(),
            map((filteredItems) => ({ ...config, items: filteredItems }))
        );
    }

    private shouldIncludeItem(item: SearchFiltersRef): Observable<boolean> {
        return item.rules?.featureFlag ? this.featuresService.isOn$(item.rules.featureFlag) : of(true);
    }
}
