/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { screenFeatureSelector } from './class-verification-root.selectors';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectAllDocumentsValid } from './document.selectors';

export const selectViewFilter = createSelector(screenFeatureSelector, (state) => state.viewFilter);

export const selectFullScreen = createSelector(screenFeatureSelector, (state) => state.fullScreen);

export const selectSortOption = createSelector(screenFeatureSelector, (state) => state.sortOption);

export const selectRejectReasons = createSelector(screenFeatureSelector, (state) => state.taskInputData?.rejectReasons || []);

export const selectScreenStatus = createSelector(screenFeatureSelector, (state) => state.status);

export const selectCorrelationId = createSelector(screenFeatureSelector, (state) => state.taskContext.rootProcessInstanceId);

export const selectTaskInfo = createSelector(screenFeatureSelector, (state) => state.taskContext);

export const selectTaskInputData = createSelector(screenFeatureSelector, (state) => state.taskInputData);

const notReadyStates: Set<IdpLoadState> = new Set([IdpLoadState.NotInitialized, IdpLoadState.Loading, IdpLoadState.Error]);
export const selectScreenReady = createSelector(screenFeatureSelector, (state) => !notReadyStates.has(state.status));

export const selectCanSave = createSelector(screenFeatureSelector, (state) => !state.taskDataSynced && state.status === IdpLoadState.Loaded);

export const selectCanComplete = createSelector(
    screenFeatureSelector,
    selectAllDocumentsValid,
    (screenState, allDocumentsValid) => allDocumentsValid && screenState.status === IdpLoadState.Loaded
);

export const selectCanUnclaim = createSelector(screenFeatureSelector, (screenState) => screenState.taskContext.canUnclaimTask);
