/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { provideFeaturesFlags } from '@features';
import { provideTranslations } from '@alfresco/adf-core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { environment } from '../../environments/environment';
import { FeatureFlagsMenuItemComponent } from './feature-flag-menu-item.component';
import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders, Optional } from '@angular/core';
import { provideDummyFeatureFlags, provideDebugFeatureFlags, FlagsOverrideToken } from '@alfresco/adf-core/feature-flags';

export function featureFlagsInitializer(extensions: ExtensionService, flagsOverride: boolean | null): () => void {
    return () => {
        extensions.setComponents({
            'feature-flags.menu-button': FeatureFlagsMenuItemComponent,
        });

        extensions.setEvaluators({
            'feature-flags.isEnabled': () => !!flagsOverride,
        });
    };
}

export function provideFeatureFlagsWithInitializer(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideFeatureFlags(),
        {
            provide: APP_INITIALIZER,
            useFactory: featureFlagsInitializer,
            deps: [ExtensionService, [new Optional(), FlagsOverrideToken]],
            multi: true,
        },
    ]);
}

export function provideFeatureFlags(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideTranslations('feature-flags', 'assets/feature-flags'),
        ...provideDummyFeatureFlags(),
        ...provideFeaturesFlags({ isApplicationAware: true, serviceRelativePath: '/rb' }),
        ...(environment.devTools ? provideDebugFeatureFlags({ storageKey: 'hxw-feature-flags' }) : []),
    ]);
}
