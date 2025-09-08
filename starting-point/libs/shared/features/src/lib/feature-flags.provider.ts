/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER } from '@angular/core';
import { HxPFeatureFlagConfig, HxPFeaturesService } from './hxp-features.service';
import {
    FeaturesServiceConfigToken,
    IFeaturesService,
    FeaturesServiceToken,
    OverridableFeaturesServiceToken,
} from '@alfresco/adf-core/feature-flags';

export function provideFeaturesFlags(featureFlagServiceConfig: HxPFeatureFlagConfig) {
    // makeEnvironmentProviders is a helper for Angular 16 migration, this is how we need to rewrite this function in A16
    // return makeEnvironmentProviders([
    return [
        { provide: OverridableFeaturesServiceToken, useClass: HxPFeaturesService },
        { provide: FeaturesServiceToken, useExisting: OverridableFeaturesServiceToken },
        { provide: FeaturesServiceConfigToken, useValue: featureFlagServiceConfig },
        {
            provide: APP_INITIALIZER,
            useFactory: (featuresService: IFeaturesService) => () => featuresService.init().subscribe(() => {}),
            deps: [OverridableFeaturesServiceToken],
            multi: true,
        },
    ];
    // ]);
}
