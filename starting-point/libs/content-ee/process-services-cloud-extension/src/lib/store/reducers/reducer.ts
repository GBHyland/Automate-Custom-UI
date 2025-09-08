/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action, combineReducers } from '@ngrx/store';
import { ProcessServiceCloudMainState, initialProcessServicesCloudState } from '../states/state';
import { processServicesCloudExtensionReducer } from './extension.reducer';
import { processDefinitionsEntityReducer } from './process-definitions.entities.reducer';

export const featureKey = 'processServicesCloud';

export const mainReducer = combineReducers(
    {
        extension: processServicesCloudExtensionReducer,
        processDefinitions: processDefinitionsEntityReducer,
    },
    initialProcessServicesCloudState
);

export function reducer(state: ProcessServiceCloudMainState | undefined, action: Action) {
    return mainReducer(state, action);
}
