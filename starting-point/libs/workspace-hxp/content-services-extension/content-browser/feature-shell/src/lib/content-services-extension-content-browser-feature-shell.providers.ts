/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { APP_INITIALIZER, EnvironmentProviders, importProvidersFrom, makeEnvironmentProviders } from '@angular/core';
import { CoreModule, provideTranslations } from '@alfresco/adf-core';
import { provideContentServicesExtensionSearchFeatureShell } from '@hxp/workspace-hxp/content-services-extension/search/feature-shell';
import { IsFolderishDocumentPipe } from './components/content-browser/is-folderish-document.pipe';
import { SharedHxpServicesModule, UPLOAD_MIDDLEWARE_SERVICE } from '@hxp/shared-hxp/services';
import { FeaturesDirective, NotFeaturesDirective } from '@alfresco/adf-core/feature-flags';
import { MAT_PAGINATOR_DEFAULT_OPTIONS } from '@angular/material/paginator';
import {
    DocumentService,
    DocumentPropertiesService,
    PermissionLevelPipe,
    UserResolverPipe,
    HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE,
    HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE,
    DateTimeFormatPipe,
    provideAdfEnterpriseAdfHxContentServicesServices,
} from '@alfresco/adf-hx-content-services/services';
import { CONTEXT_MENU_ACTIONS_PROVIDERS } from '@alfresco/adf-hx-content-services/ui';
import { DomSanitizer } from '@angular/platform-browser';
import { MatIconRegistry } from '@angular/material/icon';
import { provideAdfEnterpriseAdfHxContentServices } from '@alfresco/adf-hx-content-services';
import { UploadManagerService } from '@hxp/workspace-hxp/content-services-extension/shared/upload/feature-shell';
import { ReplaceFileButtonComponentActionService } from './components/document-create/replace-file/replace-file-button/replace-file-button-component-action.service';
import { ExtensionService } from '@alfresco/adf-extensions';
import { CreateDocumentVersionButtonComponent } from './components/document-version/document-version.component';
import { CreateDocumentVersionActionService } from './components/document-version/document-version.service';
import { CheckInApi } from '@hylandsoftware/hxcs-js-client';
import { uploadApiProvider } from '@alfresco/adf-hx-content-services/api';
import { ReplaceFileButtonComponent } from './components/document-create/replace-file/replace-file-button/replace-file-button-component';

export function provideContentServicesExtensionContentBrowserFeatureShell(): EnvironmentProviders {
    return makeEnvironmentProviders([
        importProvidersFrom([
            CoreModule,
            SharedHxpServicesModule.forContent({
                DocumentPropertiesService,
                DocumentService,
            }),
            FeaturesDirective,
            NotFeaturesDirective,
            PermissionLevelPipe,
            UserResolverPipe,
            UserResolverPipe,
            DateTimeFormatPipe,
            IsFolderishDocumentPipe,
        ]),
        provideAdfEnterpriseAdfHxContentServices(),
        provideAdfEnterpriseAdfHxContentServicesServices(),
        provideContentServicesExtensionSearchFeatureShell(),
        uploadApiProvider,
        DocumentService,
        provideTranslations('content-services-extension-content-browser-feature-shell', 'assets/content-services-extension-content-browser'),
        provideTranslations('adf-enterprise-adf-hx-content-services-ui', 'assets/adf-enterprise-adf-hx-content-services-ui'),
        ...CONTEXT_MENU_ACTIONS_PROVIDERS,
        UploadManagerService,
        {
            provide: MAT_PAGINATOR_DEFAULT_OPTIONS,
            useValue: { formFieldAppearance: 'outline' },
        },
        {
            provide: HXP_DOCUMENT_REPLACE_FILE_ACTION_SERVICE,
            useExisting: ReplaceFileButtonComponentActionService,
        },
        {
            provide: HXP_DOCUMENT_CREATE_DOCUMENT_VERSION_ACTION_SERVICE,
            useExisting: CreateDocumentVersionActionService,
        },
        CheckInApi,
        { provide: UPLOAD_MIDDLEWARE_SERVICE, useValue: null },
        {
            provide: APP_INITIALIZER,
            useFactory: (domSanitizer: DomSanitizer, matIconRegistry: MatIconRegistry, extensions: ExtensionService) => () => {
                matIconRegistry.addSvgIcon('location_picker_folder_icon', domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/Folder.svg'));
                matIconRegistry.addSvgIcon('location_picker_pencil_icon', domSanitizer.bypassSecurityTrustResourceUrl('assets/icons/Pencil.svg'));

                extensions.setComponents({
                    'document.create_version': CreateDocumentVersionButtonComponent,
                });

                extensions.setComponents({
                    'document.replace_file': ReplaceFileButtonComponent,
                });
            },
            deps: [DomSanitizer, MatIconRegistry, ExtensionService],
            multi: true,
        },
    ]);
}
