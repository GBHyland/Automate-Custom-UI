/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { provideTranslations } from '@alfresco/adf-core';
import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CONTEXT_MENU_ACTIONS_PROVIDERS } from '@alfresco/adf-hx-content-services/ui';
import { ADF_HX_CONTENT_SERVICES_API_PROVIDERS } from '@alfresco/adf-hx-content-services/api';
import { DOCUMENT_PROVIDERS, USER_RESOLVER_PROVIDERS } from '@alfresco/adf-hx-content-services/services';

export function provideAdfEnterpriseAdfHxContentServices(): EnvironmentProviders {
    return makeEnvironmentProviders([
        ...DOCUMENT_PROVIDERS,
        ...USER_RESOLVER_PROVIDERS,
        ...CONTEXT_MENU_ACTIONS_PROVIDERS,
        ...ADF_HX_CONTENT_SERVICES_API_PROVIDERS,
        provideTranslations('adf-enterprise-adf-hx-content-services-ui', 'assets/adf-enterprise-adf-hx-content-services-ui'),
        provideTranslations('adf-enterprise-adf-hx-content-services-services', 'assets/adf-enterprise-adf-hx-content-services-services'),
    ]);
}
