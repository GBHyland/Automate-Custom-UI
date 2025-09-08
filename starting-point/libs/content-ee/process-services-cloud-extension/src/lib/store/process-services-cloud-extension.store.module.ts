/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { ProcessCloudHealthEffects } from './effects/process-cloud-health.effects';
import { ProcessDefinitionEffects } from './effects/process-definition.effects';
import * as fromProcessServicesCloud from './reducers/reducer';
import { ProcessManagementFilterEffects } from './effects/process-management-filter.effects';
import { ProcessDetailsEffects } from './effects/process-details.effects';
import { TaskDetailsEffects } from './effects/task-details.effects';
import { ProcessInstanceEffect } from './effects/process-cloud-instance.effect';

@NgModule({
    imports: [
        EffectsModule.forFeature([
            ProcessCloudHealthEffects,
            ProcessDefinitionEffects,
            ProcessManagementFilterEffects,
            ProcessDetailsEffects,
            TaskDetailsEffects,
            ProcessInstanceEffect,
        ]),
        StoreModule.forFeature(fromProcessServicesCloud.featureKey, fromProcessServicesCloud.reducer),
    ],
})
export class ProcessServicesCloudExtensionStoreModule {}
