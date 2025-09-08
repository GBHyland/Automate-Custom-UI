/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { NgModule } from '@angular/core';
import { ExtensionService } from '@alfresco/adf-extensions';
import { TaskDetailsCloudExtComponent } from './components/task-details-cloud-ext/task-details-cloud-ext.component';
import { TaskDetailsCloudMetadataComponent } from './components/task-details-cloud-metadata/task-details-cloud-metadata.component';
import { TaskAssignmentDialogComponent } from './components/task-assignment-dialog/task-assignment-dialog.component';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { EffectsModule } from '@ngrx/effects';
import { ProcessListCloudEffects } from '../../store/effects/process-list-cloud.effects';
import { SharedIdentityModule } from '@alfresco-dbp/shared/identity';

@NgModule({
    imports: [
        EffectsModule.forFeature([ProcessListCloudEffects]),
        SharedIdentityModule,
        TaskAssignmentDialogComponent,
        TaskDetailsCloudExtComponent,
        TaskDetailsCloudMetadataComponent,
    ],
    providers: [{ provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { floatLabel: 'never' } }],
})
export class TaskDetailsCloudModule {
    constructor(extensions: ExtensionService) {
        extensions.setComponents({
            'process-services-cloud.task-details': TaskDetailsCloudExtComponent,
        });
    }
}
