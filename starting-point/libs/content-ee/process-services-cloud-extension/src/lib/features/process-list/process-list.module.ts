/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { ExtensionService } from '@alfresco/adf-extensions';
import { ProcessServicesCloudModule } from '@alfresco/adf-process-services-cloud';
import { ProcessListCloudExtComponent } from './components/process-list/process-list-cloud-ext.component';
import { ProcessListCloudEffects } from '../../store/effects/process-list-cloud.effects';
import { ProcessListCloudContainerExtComponent } from './components/process-list/process-list-cloud-container-ext.component';
import { MainActionButtonComponent } from '../../components/main-action-button/main-action-button.component';
import { RelatedProcessComponent } from './components/related-process/related-process.component';

@NgModule({
    imports: [
        ProcessServicesCloudModule,
        EffectsModule.forFeature([ProcessListCloudEffects]),
        ProcessListCloudExtComponent,
        ProcessListCloudContainerExtComponent,
    ],
})
export class ProcessListCloudModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.process-list': ProcessListCloudContainerExtComponent,
            'processes-list-header-action': MainActionButtonComponent,
            'processes-list-related-process': RelatedProcessComponent,
        });
    }
}
