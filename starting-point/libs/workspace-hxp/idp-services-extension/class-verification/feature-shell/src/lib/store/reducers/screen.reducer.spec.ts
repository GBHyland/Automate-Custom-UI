/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { screenReducer } from './screen.reducer';
import { initialScreenState } from '../states/screen.state';
import { IdpLoadState, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { mockIdpRejectReasons } from '../../models/mocked/mocked-reject-reasons';
import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../models/common-models';
import { IdpTaskData } from '../../models/screen-models';

describe('Screen State Reducer', () => {
    const mockTaskData: IdpTaskData = {
        rejectReasons: mockIdpRejectReasons(),
        batchState: {
            documents: [],
            contentFileReferences: [],
        },
        configuration: {
            classificationConfidenceThreshold: 0.5,
            documentClassDefinitions: [],
        },
    };

    const taskContext: TaskContext = {
        appName: 'test-app',
        taskId: '123',
        taskName: 'ClassifyDocs',
        rootProcessInstanceId: '12',
        canClaimTask: false,
        canUnclaimTask: true,
    };

    it('should return input state on unknown action', () => {
        const action = { type: 'Unknown' };
        const state = screenReducer(initialScreenState, action);
        expect(state).toEqual(initialScreenState);
    });

    it('should set state to loading on screenInitialize action', () => {
        const action = systemActions.screenInitialize({ taskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loading);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set state to loading on screenLoad action', () => {
        const action = systemActions.screenLoad({ taskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loading);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set state to loaded on screenLoadSuccess action', () => {
        const action = systemActions.screenLoadSuccess({ taskData: mockTaskData, taskContext: taskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loaded);
        expect(state.taskDataSynced).toBeTrue();
    });

    it('should set state to error on screenLoadError action', () => {
        const action = systemActions.screenLoadError({ error: new Error('Screen Load Error') });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Error);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set state to error on screenInitializeError action', () => {
        const action = systemActions.screenInitializeError({ error: new Error('Screen Load Error') });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Error);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should update viewFilter on viewFilterChange action', () => {
        const action = userActions.viewFilterChange({ filter: IdpScreenViewFilter.OnlyIssues });
        const state = screenReducer(initialScreenState, action);
        expect(state.viewFilter).toEqual(IdpScreenViewFilter.OnlyIssues);
    });

    it('should update sortOption on sortOptionChange action', () => {
        const action = userActions.sortOptionChange({ option: IdpScreenViewSortOption.Classes });
        const state = screenReducer(initialScreenState, action);
        expect(state.sortOption).toEqual(IdpScreenViewSortOption.Classes);
    });

    it('should toggle view filter on viewFilterToggle action', () => {
        let state = screenReducer(initialScreenState, userActions.viewFilterToggle());
        expect(state.viewFilter).toEqual(IdpScreenViewFilter.OnlyIssues);
        state = screenReducer(state, userActions.viewFilterToggle());
        expect(state.viewFilter).toEqual(IdpScreenViewFilter.All);
    });

    it('should change full screen on changeFullScreen action', () => {
        let state = screenReducer(initialScreenState, userActions.changeFullScreen({ fullScreen: true }));
        expect(state.fullScreen).toEqual(true);
        state = screenReducer(state, userActions.changeFullScreen({ fullScreen: false }));
        expect(state.fullScreen).toEqual(false);
    });

    it('should taskDataSynced to false on documentOperationSuccess action', () => {
        const action = systemActions.documentOperationSuccess({} as any);
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should not touch state when taskDataSynced is not defined on updatePagesRotation action', () => {
        const action = userActions.updatePagesRotation({ pages: [], taskDataSynced: undefined });
        const state = screenReducer(initialScreenState, action);
        expect(state).toBe(initialScreenState);
    });

    it('should set taskDataSynced to false on updatePagesRotation action', () => {
        const action = userActions.updatePagesRotation({ pages: [], taskDataSynced: false });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should taskDataSynced to false on applyDocumentUpdates action', () => {
        const action = systemActions.applyDocumentUpdates({ updates: [] });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set taskDataSynced to true on taskPrepareUpdateSuccess action', () => {
        const action = systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: mockTaskData });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeTrue();
    });

    it('should set status to Saving on taskSave action', () => {
        const action = userActions.taskSave();
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Saving);
    });

    it('should set status to Saving on taskComplete action', () => {
        const action = userActions.taskComplete({});
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Saving);
    });

    it('should set status to Loaded on taskActionSuccess action other than Claim', () => {
        const action = systemActions.taskActionSuccess({ action: 'Complete' });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loaded);
    });

    it('should return input state on taskActionSuccess action Claim', () => {
        const action = systemActions.taskActionSuccess({ action: 'Claim' });
        const state = screenReducer(initialScreenState, action);
        expect(state).toEqual(initialScreenState);
    });

    it('should set status to Error on taskActionError action', () => {
        const action = systemActions.taskActionError({ error: new Error('Task Action Error') });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Error);
    });

    it('should set status to Loading on taskClaim action', () => {
        const action = systemActions.taskClaim({} as any);
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loading);
    });

    it('should set status to Loading on taskUnclaim action', () => {
        const action = systemActions.taskUnclaim();
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loading);
    });

    it('should set status to Loaded and update task context on taskClaimSuccess action', () => {
        const updatedTaskContext: TaskContext = {
            appName: 'updated-test-app',
            taskId: '12345',
            taskName: 'ClassReview',
            rootProcessInstanceId: '23',
            canClaimTask: true,
            canUnclaimTask: false,
        };
        const action = systemActions.taskClaimSuccess({ taskContext: updatedTaskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskContext).toEqual(updatedTaskContext);
    });

    it('should set status to Loading on screenLoadDocumentUpload action', () => {
        const action = systemActions.screenLoadDocumentUpload({} as any);
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loading);
    });

    it('should set status to Loaded on screenLoadDocumentUploadError action', () => {
        const action = systemActions.screenLoadDocumentUploadError({});
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loaded);
    });

    it('should set status to Loaded on screenLoadDocumentUploadSuccess action', () => {
        const action = systemActions.screenLoadDocumentUploadSuccess({} as any);
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toEqual(IdpLoadState.Loaded);
    });
});
