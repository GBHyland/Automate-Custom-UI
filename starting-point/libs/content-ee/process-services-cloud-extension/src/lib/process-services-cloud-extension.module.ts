/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { InjectionToken, ModuleWithProviders, NgModule, Provider } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { CoreModule, AuthGuard, AppConfigService, ThumbnailService, provideTranslations, FORM_RULES_MANAGER } from '@alfresco/adf-core';
import { ExtensionService, ExtensionsModule, provideExtensionConfig } from '@alfresco/adf-extensions';
import { ProcessExtensionServiceCloud } from './services/process-extension-cloud.service';
import {
    processServiceCloudPluginLoaderFactory,
    ExtensionLoaderCallback,
    EXTENSION_DATA_LOADERS,
} from './services/process-service-cloud-plugin-loader.factory';
import { isProcessServiceCloudPluginEnabled } from './rules/process-services-cloud.rules';
import { ProcessServicesCloudExtensionStoreModule } from './store/process-services-cloud-extension.store.module';
import { SidenavCloudExtComponent } from './components/sidenav-cloud-ext/sidenav-cloud-ext.component';
import { TaskFiltersCloudExtComponent } from './features/task-list/components/task-filters-ext/task-filters-cloud-ext.component';
import { TaskCloudModule, ProcessServicesCloudModule, UserPreferenceCloudService } from '@alfresco/adf-process-services-cloud';
import { ProcessListCloudModule } from './features/process-list/process-list.module';
import { ProcessFiltersCloudExtComponent } from './features/process-list/components/process-filters/process-filters-cloud-ext.component';
import { TaskDetailsCloudModule } from './features/task-details/task-details-cloud.module';
import { ConfirmationDialogComponent } from './components/dialog/confirmation-dialog.component';
import { FormRulesImplementationService } from '@alfresco-dbp/shared/form-rules';
import { TaskFiltersProxyComponent } from './components/task-filters-proxy/task-filters-proxy.component';
import { ProcessFiltersProxyComponent } from './components/process-filters-proxy/process-filters-proxy.component';
import { DisplayMessageComponent } from './components/display-message/display-message.component';
import { RouterModule, Routes } from '@angular/router';
import { ProcessDetailsCloudExtComponent } from './features/process-details/components/process-details/process-details-cloud-ext.component';
import { EffectsModule } from '@ngrx/effects';
import { StartProcessEffects } from './features/start-process/effects/start-process.effects';
import { StartProcessComponent } from './features/start-process/components/start-process/start-process.component';
import { canShow } from './features/start-process/rules/start-process.rules';
import { TaskListCloudEffects } from './features/task-list/store/effects/task-list-cloud.effects';
import { TaskListCloudContainerExtComponent } from './features/task-list/components/task-list-cloud-ext/task-list-cloud-container-ext.component';
import { MainActionButtonComponent } from './components/main-action-button/main-action-button.component';
import { Apollo } from 'apollo-angular';

interface ProcessServicesCloudExtensionModuleConfig {
    extensionDataLoadersToken?: InjectionToken<ExtensionLoaderCallback>;
}

const processServicesCloudExtensionRoutes: Routes = [
    {
        path: 'display-message',
        component: DisplayMessageComponent,
    },
];

const defaultExtensionLoaderProvider = {
    provide: EXTENSION_DATA_LOADERS,
    multi: true,
    useFactory: processServiceCloudPluginLoaderFactory,
    deps: [ProcessExtensionServiceCloud, AppConfigService, Store],
};

@NgModule({
    imports: [
        CommonModule,
        ExtensionsModule,
        CoreModule,
        ProcessServicesCloudExtensionStoreModule,
        TranslateModule,
        EffectsModule.forFeature([StartProcessEffects, TaskListCloudEffects]),
        TaskCloudModule,
        ProcessServicesCloudModule.forRoot(undefined, UserPreferenceCloudService as any),
        ProcessListCloudModule,
        TaskDetailsCloudModule,
        ConfirmationDialogComponent,
        TaskFiltersProxyComponent,
        ProcessFiltersProxyComponent,
        RouterModule.forChild(processServicesCloudExtensionRoutes),
        TaskFiltersCloudExtComponent,
        ProcessFiltersCloudExtComponent,
        SidenavCloudExtComponent,
    ],
    providers: [
        Apollo,
        {
            provide: FORM_RULES_MANAGER,
            useExisting: FormRulesImplementationService,
        },
        provideTranslations('process-services-cloud-extension', 'assets/adf-process-services-cloud-extension'),
        defaultExtensionLoaderProvider,
        provideExtensionConfig(['process-services-cloud.extension.json']),
    ],
})
export class ProcessServicesCloudExtensionModule {
    constructor(
        extensions: ExtensionService,
        processExtensionServiceCloud: ProcessExtensionServiceCloud,
        // ThumbnailService is used for icons registration
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _thumbnailService: ThumbnailService
    ) {
        extensions.setAuthGuards({
            'process-services-cloud.auth': AuthGuard,
        });

        extensions.setComponents({
            'process-services-cloud.process-services-cloud.sidenav': SidenavCloudExtComponent,
            'process-services-cloud.task-filters-proxy': TaskFiltersProxyComponent,
            'process-services-cloud.process-filters-proxy': ProcessFiltersProxyComponent,
            'process-services-cloud.message-display': DisplayMessageComponent,
            'process-services-cloud.process-details': ProcessDetailsCloudExtComponent,
            'process-services-cloud.start-process.start': StartProcessComponent,
            'process-services-cloud.task-list': TaskListCloudContainerExtComponent,
            'task-list-header-action': MainActionButtonComponent,
        });

        extensions.setEvaluators({
            'hide-element': () => false,
            'process-services-cloud.isEnabled': isProcessServiceCloudPluginEnabled,
            'process-services-cloud.isRunning': isProcessServiceCloudRunning,
            'process-services-cloud.start-process.canShow': canShow,
        });

        function isProcessServiceCloudRunning(): boolean {
            return processExtensionServiceCloud.processServicesCloudRunning;
        }
    }

    static withConfig(config: ProcessServicesCloudExtensionModuleConfig): ModuleWithProviders<ProcessServicesCloudExtensionModule> {
        const providers: Provider[] = [];

        if (config.extensionDataLoadersToken) {
            providers.push({
                ...defaultExtensionLoaderProvider,
                provide: config.extensionDataLoadersToken,
            });
        }

        return {
            ngModule: ProcessServicesCloudExtensionModule,
            providers,
        };
    }
}
