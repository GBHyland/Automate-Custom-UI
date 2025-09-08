/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AsyncPipe } from '@angular/common';
import { provideTranslations } from '@alfresco/adf-core';
import { UserResolverPipe } from './pipes/user-resolver.pipe';
import { DocumentService } from './document/document.service';
import { DOCUMENT_SERVICE } from './document/document-token/document-token.service';
import { ADF_HX_CONTENT_SERVICES_API_PROVIDERS } from '@alfresco/adf-hx-content-services/api';
import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { DocumentPropertiesService } from './document/document-properties/document-properties.service';
import { DOCUMENT_PROPERTIES_SERVICE } from './document/document-properties/shared-document-properties.service';
import { PermissionsManagementComponentType } from './permission/models/permission-management-dialog-data.interface';

export const PERMISSIONS_MANAGEMENT_COMPONENT_TYPE = new InjectionToken<PermissionsManagementComponentType>('PERMISSIONS_MANAGEMENT_COMPONENT_TYPE', {
    factory: () => 'dialog',
});

export const USER_RESOLVER_PROVIDERS = [UserResolverPipe, AsyncPipe];

export const DOCUMENT_PROVIDERS = [
    { provide: DOCUMENT_SERVICE, useExisting: DocumentService },
    { provide: DOCUMENT_PROPERTIES_SERVICE, useExisting: DocumentPropertiesService },
];

export function provideAdfEnterpriseAdfHxContentServicesServices(): EnvironmentProviders {
    return makeEnvironmentProviders([
        ...ADF_HX_CONTENT_SERVICES_API_PROVIDERS,
        ...USER_RESOLVER_PROVIDERS,
        ...DOCUMENT_PROVIDERS,
        provideTranslations('adf-enterprise-adf-hx-content-services-services', 'assets/adf-enterprise-adf-hx-content-services-services'),
    ]);
}
