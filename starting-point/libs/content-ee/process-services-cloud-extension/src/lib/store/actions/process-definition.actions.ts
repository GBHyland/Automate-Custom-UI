/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createAction, props } from '@ngrx/store';
import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';

export const loadProcessDefinitions = createAction('[ProcessDefinition] Load ProcessDefinitions');

export const loadProcessDefinitionsSuccess = createAction(
    '[ProcessDefinition] Load ProcessDefinitions Success',
    props<{ definitions: ProcessDefinitionCloud[] }>()
);

export const loadProcessDefinitionsFailure = createAction('[ProcessDefinition] Load ProcessDefinitions Failure', props<{ error: any }>());

export const loadRecentProcessDefinitions = createAction('[ProcessDefinition] Load Recent Process Definitions');

export const setRecentProcessDefinitions = createAction('[ProcessDefinition] setRecentProcessDefinitions', props<{ definitionKeys: string[] }>());
