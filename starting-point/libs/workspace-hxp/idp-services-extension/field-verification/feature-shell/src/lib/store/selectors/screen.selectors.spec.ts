/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    selectCorrelationId,
    selectTaskInputData,
    selectTaskInfo,
    selectScreenReady,
    selectCanSave,
    selectCanComplete,
    selectCanUnclaim,
} from './screen.selectors';
import { screenState, taskContext, taskData } from '../shared-mock-states';
import { ScreenState } from '../states/screen.state';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('Screen Selectors', () => {
    let initialState: ScreenState;

    beforeEach(() => {
        initialState = { ...screenState };
    });

    it('should select correlation id', () => {
        const result = selectCorrelationId.projector(initialState);
        expect(result).toBe('root-pid');
    });

    it('should select task input data', () => {
        const result = selectTaskInputData.projector(initialState);
        expect(result).toEqual(taskData);
    });

    it('should select task info', () => {
        const result = selectTaskInfo.projector(initialState);
        expect(result).toEqual(taskContext);
    });

    it('should select if the screen is ready when screen status is loaded', () => {
        initialState.status = IdpLoadState.Loaded;
        const result = selectScreenReady.projector(initialState);
        expect(result).toBe(true);
    });

    it('should select if the screen is not ready when screen status is not loaded', () => {
        initialState.status = IdpLoadState.Loading;
        const result = selectScreenReady.projector(initialState);
        expect(result).toBe(false);
    });

    it('should select if the screen is not ready when screen status is not initialized', () => {
        initialState.status = IdpLoadState.NotInitialized;
        const result = selectScreenReady.projector(initialState);
        expect(result).toBe(false);
    });

    it('should select if the task can be saved to true when task sync status is false and screen state is loaded', () => {
        initialState.taskDataSynced = false;
        initialState.status = IdpLoadState.Loaded;
        const result = selectCanSave.projector(initialState);
        expect(result).toBe(true);
    });

    it('should select if the task cannot be saved to false when task sync status is false and screen state is not loaded', () => {
        initialState.taskDataSynced = false;
        initialState.status = IdpLoadState.Saving;
        const result = selectCanSave.projector(initialState);
        expect(result).toBe(false);
    });

    it('should select if the task cannot be saved to false when task sync status is true', () => {
        initialState.taskDataSynced = true;
        const result = selectCanSave.projector(initialState);
        expect(result).toBe(false);
    });

    it('should select if the task can be completed to true when all document is valid and screen state is loaded', () => {
        const documentValid = true;
        initialState.status = IdpLoadState.Loaded;
        const result = selectCanComplete.projector(initialState, documentValid);
        expect(result).toBe(true);
    });

    it('should select if the task can be completed to true when all document is valid and screen state is not loaded', () => {
        const documentValid = true;
        initialState.status = IdpLoadState.Saving;
        const result = selectCanComplete.projector(initialState, documentValid);
        expect(result).toBe(false);
    });

    it('should select if the task cannot be completed when document is invalid', () => {
        const documentValid = false;
        const result = selectCanComplete.projector(initialState, documentValid);
        expect(result).toBe(false);
    });

    it('should select canUnclaimTask', () => {
        const result = selectCanUnclaim.projector(initialState);
        expect(result).toBe(true);
    });
});
