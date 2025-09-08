/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { initialScreenState } from '../states/screen.state';
import { IdpScreenViewFilter } from '../../models/common-models';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const screenReducer = createReducer(
    initialScreenState,
    on(systemActions.screenInitialize, systemActions.screenLoad, (state) => {
        return {
            ...state,
            status: IdpLoadState.Loading,
            taskDataSynced: false,
        };
    }),
    on(systemActions.screenLoadSuccess, (state, { taskData, taskContext }) => {
        return {
            ...state,
            status: IdpLoadState.Loaded,
            taskContext,
            taskInputData: taskData,
            taskDataSynced: true,
        };
    }),
    on(systemActions.screenInitializeError, systemActions.screenLoadError, (state) => {
        return {
            ...state,
            status: IdpLoadState.Error,
            taskDataSynced: false,
        };
    }),
    on(userActions.viewFilterChange, (state, { filter }) => {
        return {
            ...state,
            viewFilter: filter,
        };
    }),
    on(userActions.sortOptionChange, (state, { option }) => {
        return {
            ...state,
            sortOption: option,
        };
    }),
    on(userActions.viewFilterToggle, (state) => {
        return {
            ...state,
            viewFilter: state.viewFilter === IdpScreenViewFilter.All ? IdpScreenViewFilter.OnlyIssues : IdpScreenViewFilter.All,
        };
    }),
    on(userActions.changeFullScreen, (state, { fullScreen }) => {
        return {
            ...state,
            fullScreen: fullScreen,
        };
    }),
    on(systemActions.documentOperationSuccess, systemActions.applyDocumentUpdates, (state) => {
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
    on(systemActions.taskClaim, systemActions.taskUnclaim, systemActions.screenLoadDocumentUpload, (state) => {
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
    }),
    on(systemActions.screenLoadDocumentUploadSuccess, systemActions.screenLoadDocumentUploadError, (state) => ({
        ...state,
        status: IdpLoadState.Loaded,
    }))
);
