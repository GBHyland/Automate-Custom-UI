/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../models/common-models';
import { IdpTaskData } from '../../models/screen-models';
import { ScreenState } from '../states/screen.state';
import {
    selectViewFilter,
    selectRejectReasons,
    selectScreenStatus,
    selectCorrelationId,
    selectTaskInfo,
    selectTaskInputData,
    selectScreenReady,
    selectCanSave,
    selectCanComplete,
    selectFullScreen,
    selectCanUnclaim,
    selectSortOption,
} from './screen.selectors';
import { IdpLoadState, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('Screen Selectors', () => {
    const taskContext: TaskContext = {
        appName: 'appName',
        taskId: 'taskId',
        taskName: 'taskName',
        rootProcessInstanceId: 'root-pid',
        canClaimTask: false,
        canUnclaimTask: true,
    };

    const taskInputData: IdpTaskData = {
        batchState: { documents: [], contentFileReferences: [] },
        rejectReasons: [
            { id: '1', value: 'reason1' },
            { id: '2', value: 'reason2' },
        ],
        configuration: { documentClassDefinitions: [], classificationConfidenceThreshold: 0.5 },
    };

    let initialState: ScreenState;

    beforeEach(() => {
        initialState = {
            viewFilter: IdpScreenViewFilter.All,
            taskInputData,
            status: IdpLoadState.Loaded,
            taskContext,
            taskDataSynced: false,
            fullScreen: false,
            sortOption: IdpScreenViewSortOption.Original,
        };
    });

    it('should select the view filter', () => {
        const result = selectViewFilter.projector(initialState);
        expect(result).toBe(IdpScreenViewFilter.All);
    });

    it('should select the full screen filter', () => {
        const result = selectFullScreen.projector(initialState);
        expect(result).toBe(false);
    });

    it('should select the reject reasons', () => {
        const result = selectRejectReasons.projector(initialState);
        expect(result.length).toEqual(2);
        expect(result[0].value).toBe('reason1');
        expect(result[1].value).toBe('reason2');
    });

    it('should select the screen status', () => {
        const result = selectScreenStatus.projector(initialState);
        expect(result).toBe(IdpLoadState.Loaded);
    });

    it('should select the correlation id', () => {
        const result = selectCorrelationId.projector(initialState);
        expect(result).toBe(taskContext.rootProcessInstanceId);
    });

    it('should select the task info', () => {
        const result = selectTaskInfo.projector(initialState);
        expect(result.appName).toEqual(taskContext.appName);
        expect(result.taskId).toEqual(taskContext.taskId);
        expect(result.taskName).toEqual(taskContext.taskName);
        expect(result.rootProcessInstanceId).toEqual(taskContext.rootProcessInstanceId);
    });

    it('should select the task input data', () => {
        const result = selectTaskInputData.projector(initialState);
        expect(result).toEqual(taskInputData);
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

    it('should select if the task can be completed to true when all documents are valid and screen state is loaded', () => {
        const allDocumentsValid = true;
        initialState.status = IdpLoadState.Loaded;
        const result = selectCanComplete.projector(initialState, allDocumentsValid);
        expect(result).toBe(true);
    });

    it('should select if the task can be completed to true when all documents are valid and screen state is not loaded', () => {
        const allDocumentsValid = true;
        initialState.status = IdpLoadState.Saving;
        const result = selectCanComplete.projector(initialState, allDocumentsValid);
        expect(result).toBe(false);
    });

    it('should select if the task cannot be completed when documents are invalid', () => {
        const allDocumentsValid = false;
        const result = selectCanComplete.projector(initialState, allDocumentsValid);
        expect(result).toBe(false);
    });

    it('should select canUnclaimTask', () => {
        const result = selectCanUnclaim.projector(initialState);
        expect(result).toBe(true);
    });

    it('should select sortOption', () => {
        const result = selectSortOption.projector(initialState);
        expect(result).toBe(IdpScreenViewSortOption.Original);
    });
});
