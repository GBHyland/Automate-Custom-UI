/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { AppComponent } from './app/app.component';
import { registerLocaleData } from '@angular/common';
import { environment } from './environments/environment';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { AppExtensionService } from '@alfresco/adf-extensions';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, withHashLocation } from '@angular/router';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { provideTranslateService, TranslateLoader } from '@ngx-translate/core';
import { CustomAlfrescoApiFactory } from './app/services/alfresco-api-factory';
import { APP_INITIALIZER, enableProdMode, importProvidersFrom } from '@angular/core';
import { SHARED_IDENTITY_FULL_NAME_PIPE_INCLUDE_EMAIL } from '@alfresco-dbp/shared/identity';
import { provideCustomAuthStoragePrefix } from '@alfresco-dbp/shared-authentication-services';
import { provideFeatureFlagsWithInitializer } from './app/feature-flags/feature-flags.providers';
import { providePublicAccessShell } from '@hxp/workspace-hxp/public-access-extension/domain-shell';
import { AuthModule, CoreModule, provideTranslations, TranslateLoaderService } from '@alfresco/adf-core';
import { provideExperienceWorkspaceAppShell, provideAppExtensions, setupExtensions } from '@hxp/workspace-hxp/app-shell';
import { ALFRESCO_API_FACTORY, AlfrescoApiLoaderService, createAlfrescoApiInstance } from '@alfresco/adf-content-services';
import { PluginsModule } from '@plugins';

import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeJa from '@angular/common/locales/ja';
import localeNl from '@angular/common/locales/nl';
import localePt from '@angular/common/locales/pt';
import localeNb from '@angular/common/locales/nb';
import localeRu from '@angular/common/locales/ru';
import localeCh from '@angular/common/locales/zh';
import localeAr from '@angular/common/locales/ar';
import localeCs from '@angular/common/locales/cs';
import localePl from '@angular/common/locales/pl';
import localeFi from '@angular/common/locales/fi';
import localeDa from '@angular/common/locales/da';
import localeSv from '@angular/common/locales/sv';
import { provideAnalytics } from '@alfresco-dbp/shared/analytics';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localeJa);
registerLocaleData(localeNl);
registerLocaleData(localePt);
registerLocaleData(localeNb);
registerLocaleData(localeRu);
registerLocaleData(localeCh);
registerLocaleData(localeAr);
registerLocaleData(localeCs);
registerLocaleData(localePl);
registerLocaleData(localeFi);
registerLocaleData(localeDa);
registerLocaleData(localeSv);

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(AppComponent, {
    providers: [
        provideAnimations(),
        provideHttpClient(),
        provideAppExtensions(),
        provideAnalytics(),
        providePublicAccessShell(),
        provideFeatureFlagsWithInitializer(),
        provideRouter([], withHashLocation()),
        provideExperienceWorkspaceAppShell(),
        importProvidersFrom([CoreModule.forRoot(), StoreModule.forRoot({}), EffectsModule.forRoot(), AuthModule.forRoot({ useHash: true })]),
        importProvidersFrom(PluginsModule),
        provideTranslateService({
            loader: {
                provide: TranslateLoader,
                useExisting: TranslateLoaderService,
                deps: [HttpClient],
            },
            defaultLanguage: 'en',
        }),
        {
            provide: APP_INITIALIZER,
            useFactory: setupExtensions,
            deps: [AppExtensionService],
            multi: true,
        },
        {
            provide: APP_INITIALIZER,
            useFactory: createAlfrescoApiInstance,
            deps: [AlfrescoApiLoaderService],
            multi: true,
        },
        {
            provide: ALFRESCO_API_FACTORY,
            useClass: CustomAlfrescoApiFactory,
        },
        {
            provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
            useValue: { appearance: 'outline' },
        },
        {
            provide: SHARED_IDENTITY_FULL_NAME_PIPE_INCLUDE_EMAIL,
            useValue: true,
        },
        provideTranslations('app', 'resources'),
        provideTranslations('idp-viewer', 'assets/idp-viewer'),
        provideTranslations('upload-files', 'assets/upload-files'),
        provideTranslations('shared-filters-smart', `resources/shared/filters/smart`),
        provideTranslations('idp-services-extension-shared', 'assets/idp-services-extension-shared'),
        provideTranslations('public-access-extension-forms', 'assets/public-access-extension/public-forms'),
        provideTranslations('idp-services-extension-domain-shell', 'assets/idp-services-extension-domain-shell'),
        provideTranslations('adf-hx-content-services-search-icons', 'assets/adf-enterprise-adf-hx-content-services-icons'),
        provideTranslations('content-services-extension-search-feature-shell', 'assets/content-services-extension-search'),
        provideTranslations('idp-services-extension-class-verification', 'assets/idp-services-extension-class-verification'),
        provideTranslations('idp-services-extension-field-verification', 'assets/idp-services-extension-field-verification'),
        provideTranslations('content-services-extension-shared-content-repository-ui', 'assets/content-services-extension-shared-content-repository'),
        provideTranslations('navigation-application-chrome', 'assets/navigation/application-chrome'),
        provideTranslations('satori-ui', 'assets/satori-ui'),
        provideTranslations('navigation-header', `assets/navigation/header`),
        ...provideCustomAuthStoragePrefix(),
        ...(environment.production ? [] : [provideStoreDevtools({ maxAge: 25 })]),
    ],
    // eslint-disable-next-line unicorn/prefer-top-level-await
}).catch((error) => console.error(error));
