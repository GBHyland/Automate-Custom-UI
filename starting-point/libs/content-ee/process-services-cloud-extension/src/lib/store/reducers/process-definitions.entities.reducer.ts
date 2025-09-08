/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { initialProcessDefinitionEntitiesState, processDefinitionsAdapter } from '../states/process-definitions.entities.state';
import { loadProcessDefinitionsFailure, loadProcessDefinitionsSuccess, setRecentProcessDefinitions } from '../actions/process-definition.actions';

export const processDefinitionsEntityReducer = createReducer(
    initialProcessDefinitionEntitiesState,
    on(loadProcessDefinitionsSuccess, (state, action) => ({
        ...processDefinitionsAdapter.addMany(action.definitions, state),
        loaded: true,
    })),
    on(loadProcessDefinitionsFailure, (state, action) => ({
        ...state,
        loadingError: action.error,
    })),
    on(setRecentProcessDefinitions, (state, action) => {
        return {
            ...state,
            recentProcessDefinitionKeys: action.definitionKeys,
        };
    })
);
