/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { provideTranslations } from '@alfresco/adf-core';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { governancePermissionGuard } from './guards/governance-permission.guard';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { APP_INITIALIZER, EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { GovernanceSidenavMenuItemComponent } from './sidenav/sidenav-menu-item/sidenav-menu-item.component';
import { GovernanceManagementTabsComponent } from './search/search-results/governance-management-tabs.component';

export function provideGovernanceServicesExtension(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideExtensionConfig(['governance-services.extension.json']),
        provideTranslations('governance-services-extension-domain-shell', 'assets/governance-services-extension-domain-shell'),

        {
            provide: APP_INITIALIZER,
            useFactory: (extensions: ExtensionService, sanitizer: DomSanitizer, iconRegistry: MatIconRegistry) => () => {
                extensions.setAuthGuards({
                    'governance-app.auth': governancePermissionGuard,
                });

                extensions.setComponents({
                    'governance-services-app.search-results': GovernanceManagementTabsComponent,
                    'governances-services.sidenav-item': GovernanceSidenavMenuItemComponent,
                });

                iconRegistry.addSvgIcon('governance_search', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/Governance_search.svg'));

                iconRegistry.addSvgIcon(
                    'internal_repository',
                    sanitizer.bypassSecurityTrustResourceUrl('assets/icons/datasources/Internal_Repository.svg')
                );

                iconRegistry.addSvgIcon('governance_record', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/Record.svg'));

                iconRegistry.addSvgIcon('governance_record_onHold', sanitizer.bypassSecurityTrustResourceUrl('assets/icons/Record_onHold.svg'));
            },
            deps: [ExtensionService, DomSanitizer, MatIconRegistry],
            multi: true,
        },
    ]);
}
