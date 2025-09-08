/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER, EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DecimalNumberPipe } from '@alfresco/adf-core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { FeaturesDirective, NotFeaturesDirective } from '@alfresco/adf-core/feature-flags';
import {
    provideAdfEnterpriseAdfHxContentServicesServices,
    HXP_DOCUMENT_INFO_ACTION_SERVICE,
    PermissionLevelPipe,
} from '@alfresco/adf-hx-content-services/services';
import {
    ContentPropertyViewerActionService,
    FormatDocumentPathDirective,
    CreatedDateSearchFiltersComponent,
    DocumentCategorySearchFiltersComponent,
    FileTypeSearchFilterComponent,
} from '@alfresco/adf-hx-content-services/ui';
import { PageSizeStorageService } from '@hxp/workspace-hxp/content-services-extension/shared/util';
import { DocumentLocationSearchFilterComponent } from './components/filters/document-location/document-location-search-filter.component';
import { SearchMenuItemComponent } from './components/search-menu-item/search-menu-item.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';

export function provideContentServicesExtensionSearchFeatureShell(): EnvironmentProviders {
    return makeEnvironmentProviders([
        importProvidersFrom([FeaturesDirective, NotFeaturesDirective, PermissionLevelPipe, DecimalNumberPipe, FormatDocumentPathDirective]),

        provideAdfEnterpriseAdfHxContentServicesServices(),
        DatePipe,
        {
            provide: HXP_DOCUMENT_INFO_ACTION_SERVICE,
            useClass: ContentPropertyViewerActionService,
        },
        PageSizeStorageService,
        PermissionLevelPipe,

        {
            provide: APP_INITIALIZER,
            useFactory: (extensions: ExtensionService) => () => {
                extensions.setComponents({
                    'content-services-app.search-results': SearchResultsComponent,
                    'content-services-app.search': SearchMenuItemComponent,
                    'workspace-hxp-search-filter.created-date-filter': CreatedDateSearchFiltersComponent,
                    'workspace-hxp-search-filter.document-category-filter': DocumentCategorySearchFiltersComponent,
                    'workspace-hxp-search-filter.document-location-search-filter': DocumentLocationSearchFilterComponent,
                    'workspace-hxp-search-filter.file-type-search-filter': FileTypeSearchFilterComponent,
                });
            },
            deps: [ExtensionService],
            multi: true,
        },
    ]);
}
