/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';
import { ProcessDefinitionCloud } from '@alfresco/adf-process-services-cloud';

export interface ProcessDefinitionEntitiesState extends EntityState<ProcessDefinitionCloud> {
    loaded: boolean;
    loadingError?: string;
    recentProcessDefinitionKeys: string[];
}
export const processDefinitionsAdapter: EntityAdapter<ProcessDefinitionCloud> = createEntityAdapter<ProcessDefinitionCloud>({});

export const initialProcessDefinitionEntitiesState = processDefinitionsAdapter.getInitialState({
    loaded: false,
    recentProcessDefinitionKeys: [],
});
