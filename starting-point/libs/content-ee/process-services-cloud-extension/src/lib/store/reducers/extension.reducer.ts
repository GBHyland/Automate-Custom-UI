/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { initialiseExtension, taskOrProcessFilterUpdate } from '../actions/extension.actions';
import { setProcessManagementFilter } from '../actions/process-management-filter.actions';
import { initialProcessServicesCloudExtensionState } from '../states/extension.state';

export const processServicesCloudExtensionReducer = createReducer(
    initialProcessServicesCloudExtensionState,
    on(initialiseExtension, (state, { health, application }) => ({
        ...state,
        health,
        application,
    })),
    on(setProcessManagementFilter, (state, action) => ({
        ...state,
        selectedFilter: {
            filter: action.payload.filter,
            type: action.payload.type,
        },
    })),
    on(taskOrProcessFilterUpdate, (state, action) => {
        return {
            ...state,
            filtersThatCanBeRefreshed: {
                ...state.filtersThatCanBeRefreshed,
                [action.filterKey]: action.canBeRefreshed,
            },
        };
    })
);
