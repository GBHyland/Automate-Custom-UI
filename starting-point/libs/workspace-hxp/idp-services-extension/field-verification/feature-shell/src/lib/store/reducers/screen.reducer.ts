/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { initialScreenState } from '../states/screen.state';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { systemActions, userActions } from '../actions/field-verification.actions';

export const screenReducer = createReducer(
    initialScreenState,

    on(systemActions.screenInitialize, systemActions.screenLoad, (state) => ({
        ...state,
        status: IdpLoadState.Loading,
        taskDataSynced: false,
    })),

    on(systemActions.screenLoadSuccess, (state, { taskData, taskContext }) => ({
        ...state,
        taskContext,
        taskInputData: taskData,
        status: IdpLoadState.Loaded,
        error: undefined,
        taskDataSynced: true,
    })),

    on(systemActions.screenInitializeError, systemActions.screenLoadError, (state, { error }) => ({
        ...state,
        status: IdpLoadState.Error,
        error: typeof error === 'string' ? error : error.message,
        taskDataSynced: false,
    })),

    on(userActions.fieldValueUpdate, userActions.rejectReasonUpdate, (state) => {
        return {
            ...state,
            taskDataSynced: false,
        };
    }),

    on(userActions.updatePagesRotation, (state, { taskDataSynced }) => {
        if (taskDataSynced === undefined) {
            return state;
        }

        return {
            ...state,
            taskDataSynced,
        };
    }),

    on(systemActions.taskPrepareUpdateSuccess, (state, { taskData }) => {
        return {
            ...state,
            taskInputData: taskData,
            taskDataSynced: true,
        };
    }),

    on(userActions.taskSave, userActions.taskComplete, (state) => {
        return {
            ...state,
            status: IdpLoadState.Saving,
        };
    }),

    on(systemActions.taskActionSuccess, (state, { action }) =>
        action === 'Claim'
            ? { ...state }
            : {
                  ...state,
                  status: IdpLoadState.Loaded,
              }
    ),

    on(systemActions.taskActionError, (state) => {
        return {
            ...state,
            status: IdpLoadState.Error,
        };
    }),
    on(systemActions.taskClaim, systemActions.taskUnclaim, (state) => {
        return {
            ...state,
            status: IdpLoadState.Loading,
        };
    }),
    on(systemActions.taskClaimSuccess, (state, { taskContext }) => {
        return {
            ...state,
            taskContext,
        };
    })
);
