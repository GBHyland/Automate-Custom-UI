/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AuthGuard, provideTranslations } from '@alfresco/adf-core';
import { APP_INITIALIZER, makeEnvironmentProviders } from '@angular/core';
import { isContentServiceEnabled } from './rules/content-services-extension-rules';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { provideManageVersions } from './extensions/manage-versions/manage-versions.providers';
import { provideSingleItemCopy } from './extensions/single-item-copy/single-item-copy.providers';
import { provideSingleItemMove } from './extensions/single-item-move/single-item-move.providers';
import { providePermissionManagement } from './extensions/permission-management/permission-management.providers';
import {
    HxpSidenavComponent,
    ContentBrowserComponent,
    provideContentServicesExtensionContentBrowserFeatureShell,
} from '@hxp/workspace-hxp/content-services-extension/content-browser/feature-shell';

export function provideHxwContentServices() {
    return makeEnvironmentProviders([
        provideSingleItemCopy(),
        provideSingleItemMove(),
        provideManageVersions(),
        providePermissionManagement(),
        provideContentServicesExtensionContentBrowserFeatureShell(),
        provideExtensionConfig(['content-services.extension.json']),
        provideTranslations('content-services-extension-domain-shell', 'assets/content-services-extension-domain-shell'),

        {
            provide: APP_INITIALIZER,
            useFactory: (extensions: ExtensionService) => () => {
                extensions.setAuthGuards({
                    'content-services-app.auth': AuthGuard,
                });
                extensions.setComponents({
                    'content-services-app.sidenav': HxpSidenavComponent,
                    'content-services-app.main-content': ContentBrowserComponent,
                });

                extensions.setEvaluators({
                    isContentServiceEnabled,
                });
            },
            deps: [ExtensionService],
            multi: true,
        },
    ]);
}
