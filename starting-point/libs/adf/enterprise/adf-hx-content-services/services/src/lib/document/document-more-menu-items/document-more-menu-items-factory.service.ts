/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ContentActionRef, ExtensionConfig, ExtensionService } from '@alfresco/adf-extensions';
import { Inject, Injectable } from '@angular/core';
import { from, Observable, of } from 'rxjs';
import { filter, map, shareReplay, switchMap, take, toArray } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class DocumentMoreMenuItemsFactoryService {
    constructor(private extensionService: ExtensionService, @Inject(FeaturesServiceToken) private featuresService: IFeaturesService) {}

    getMoreMenuItems(): Observable<ContentActionRef> {
        const featureName = 'document';
        const actionType = 'menu';

        return this.extensionService.setup$.pipe(
            filter((config) => this.hasFeature(featureName, config)),
            map<ExtensionConfig, ContentActionRef[]>((config) => config.features?.[featureName]),
            map<ContentActionRef[], ContentActionRef>(
                (actionsRef) => actionsRef.find((actionRef) => actionRef.type === actionType) as ContentActionRef
            ),
            switchMap((config) => this.filterItemsByFeatureFlag(config)),
            filter((moreMenuAction) => !!moreMenuAction.children?.length),
            shareReplay(1)
        );
    }

    private hasFeature(featureName: string, config?: ExtensionConfig): boolean {
        const feature = config?.features?.[featureName];
        return feature !== undefined && Array.isArray(feature);
    }

    private filterItemsByFeatureFlag(config: ContentActionRef): Observable<ContentActionRef> {
        return from(config.children || []).pipe(
            switchMap((item) =>
                this.shouldIncludeItem(item).pipe(
                    filter((shouldInclude) => shouldInclude),
                    map(() => item)
                )
            ),
            toArray(),
            map((filteredItems) => ({ ...config, children: filteredItems }))
        );
    }

    private shouldIncludeItem(item: ContentActionRef): Observable<boolean> {
        // Adding the `take(1)` to force the observable to complete, otherwise the upstream will never complete
        return item.rules?.['featureFlag'] ? this.featuresService.isOn$(item.rules['featureFlag']).pipe(take(1)) : of(true);
    }
}
