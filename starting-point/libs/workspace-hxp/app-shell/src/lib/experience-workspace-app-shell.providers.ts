/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { provideRouter } from '@angular/router';
import { HxpAppShellService } from './app-shell.service';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { STORAGE_PREFIX_FACTORY_SERVICE } from '@alfresco/adf-core';
import { IdentityUserService } from '@alfresco-dbp/shared/identity';
import { APP_ROUTES } from './experience-workspace-app-shell.routes';
import { ShellModule, SHELL_APP_SERVICE } from '@alfresco/adf-core/shell';
import { StoragePrefixFactory } from './prefix-factory/storage-prefix.factory';
import { IDENTITY_USER_SERVICE_TOKEN } from '@alfresco/adf-hx-content-services/services';
import { EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { provideHxwContentServices } from '@hxp/workspace-hxp/content-services-extension/domain-shell';
import { provideIdpServicesDomainShell } from '@hxp/workspace-hxp/idp-services-extension/domain-shell';
import { provideGovernanceServicesExtension } from '@hxp/workspace-hxp/governance-services-extension/domain-shell';
import { HEADER_CONFIG_TOKEN, HeaderConfig } from '@hxp/shared-hxp/navigation/header';

const headerConfig: HeaderConfig = {
    title: 'Workspace',
    documentationUrl: 'https://support.hyland.com/p/hylandexperience',
};

export function provideExperienceWorkspaceAppShell(): EnvironmentProviders {
    return makeEnvironmentProviders([
        provideRouter(APP_ROUTES),
        provideHxwContentServices(),
        provideGovernanceServicesExtension(),
        provideIdpServicesDomainShell(),
        importProvidersFrom([ShellModule, ExtensionsModule]),
        {
            provide: SHELL_APP_SERVICE,
            useClass: HxpAppShellService,
        },
        {
            provide: STORAGE_PREFIX_FACTORY_SERVICE,
            useClass: StoragePrefixFactory,
        },
        {
            provide: IDENTITY_USER_SERVICE_TOKEN,
            useExisting: IdentityUserService,
        },
        { provide: HEADER_CONFIG_TOKEN, useValue: headerConfig },
    ]);
}
