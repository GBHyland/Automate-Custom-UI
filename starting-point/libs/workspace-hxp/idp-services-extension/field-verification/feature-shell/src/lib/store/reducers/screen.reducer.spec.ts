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
import { systemActions, userActions } from '../actions/field-verification.actions';
import { taskContext, taskData } from '../shared-mock-states';

describe('screenReducer', () => {
    it('should set status to Loading on screenInitialize action', () => {
        const action = systemActions.screenInitialize({ taskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toBe(IdpLoadState.Loading);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set status to Loading on screenLoad action', () => {
        const action = systemActions.screenLoad({ taskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toBe(IdpLoadState.Loading);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set taskContext, taskInputData, and status to Loaded on screenLoadSuccess action', () => {
        const action = systemActions.screenLoadSuccess({ taskContext: taskContext, taskData: taskData });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskContext).toEqual(taskContext);
        expect(state.taskInputData).toEqual(taskData);
        expect(state.status).toBe(IdpLoadState.Loaded);
        expect(state.error).toBeUndefined();
        expect(state.taskDataSynced).toBeTrue();
    });

    it('should set status to Error and set error message on screenLoadError action', () => {
        const error = 'Some error';
        const action = systemActions.screenLoadError({ error });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toBe(IdpLoadState.Error);
        expect(state.error).toBe(error);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set status to Error and set error message on screenInitializeError action', () => {
        const error = 'Task Initialization Error';
        const action = systemActions.screenInitializeError({ error });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toBe(IdpLoadState.Error);
        expect(state.error).toBe(error);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set status to Error and set error message from Error object on screenLoadError action', () => {
        const error = new Error('Some error');
        const action = systemActions.screenLoadError({ error });
        const state = screenReducer(initialScreenState, action);
        expect(state.status).toBe(IdpLoadState.Error);
        expect(state.error).toBe(error.message);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should taskDataSynced to false on fieldValueUpdate action', () => {
        const action = userActions.fieldValueUpdate({} as any);
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should taskDataSynced to false on rejectReasonUpdate action', () => {
        const action = userActions.rejectReasonUpdate({} as any);
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeFalse();
    });

    it('should set taskDataSynced to true on taskPrepareUpdateSuccess action', () => {
        const action = systemActions.taskPrepareUpdateSuccess({ taskAction: 'Complete', taskData: taskData });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskDataSynced).toBeTrue();
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
            ...taskContext,
            canClaimTask: true,
            canUnclaimTask: false,
        };
        const action = systemActions.taskClaimSuccess({ taskContext: updatedTaskContext });
        const state = screenReducer(initialScreenState, action);
        expect(state.taskContext).toEqual(updatedTaskContext);
    });
});
