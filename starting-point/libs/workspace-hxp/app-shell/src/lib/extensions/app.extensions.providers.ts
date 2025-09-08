/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { combineLatest } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { AppConfigService } from '@alfresco/adf-core';
import { AppExtensionService } from './app.extension.service';
import { ExtensionConfig, ExtensionRef, ExtensionService, mergeObjects } from '@alfresco/adf-extensions';
import { APP_INITIALIZER, EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { ProcessServicesCloudExtensionProcessFormFeatureShellModule } from '@alfresco-dbp/workspace-hxp/process-services-cloud-extension/process-form/feature-shell';

export function setupExtensions(service: AppExtensionService): () => void {
    return () => service.load();
}

export function setupDynamicExtension(
    extensions: ExtensionService,
    appConfigService: AppConfigService,
    appExtensionService: AppExtensionService
): () => void {
    return () => {
        const customModeledExtension$ = appConfigService.select('custom-modeled-extension').pipe(
            filter((ext) => !!ext?.$id),
            take(1)
        );

        combineLatest([customModeledExtension$, extensions.setup$, appExtensionService.onLoad$])
            .pipe(take(1))
            .subscribe(([customModeledExtension, extensionConfig]) => {
                if (!extensionConfig?.$references?.find((ref) => ref['$id'] === customModeledExtension.$id)) {
                    initializeExtension(extensionConfig, customModeledExtension, extensions);
                }
            });
    };
}

function initializeExtension(config: ExtensionConfig, customModeledExtension: ExtensionRef, extensions: ExtensionService) {
    config.features = config.features ? mergeObjects(config.features, customModeledExtension.features || {}) : customModeledExtension.features;
    config.rules = customModeledExtension.rules ? [...(config.rules || []), ...customModeledExtension.rules] : config.rules;
    config.actions = customModeledExtension.actions ? [...(config.actions || []), ...customModeledExtension.actions] : config.actions;
    config.routes = customModeledExtension.routes ? [...(config.routes || []), ...customModeledExtension.routes] : config.routes;
    config.appConfig = config.appConfig ? mergeObjects(config.appConfig, customModeledExtension.appConfig) : customModeledExtension.appConfig;

    config.$references = config.$references || [];
    config.$references.push({
        $id: customModeledExtension.$id,
        $name: customModeledExtension.$name,
        $description: customModeledExtension.$description,
        $vendor: customModeledExtension.$vendor,
        $license: customModeledExtension.$license,
        $version: customModeledExtension.$version,
    });

    extensions.setup(config);
}

export function provideAppExtensions(): EnvironmentProviders {
    return makeEnvironmentProviders([
        importProvidersFrom([ProcessServicesCloudExtensionProcessFormFeatureShellModule]),

        {
            provide: APP_INITIALIZER,
            useFactory: setupExtensions,
            deps: [AppExtensionService],
            multi: true,
        },

        {
            provide: APP_INITIALIZER,
            useFactory: setupDynamicExtension,
            deps: [ExtensionService, AppConfigService, AppExtensionService],
            multi: true,
        },
    ]);
}
