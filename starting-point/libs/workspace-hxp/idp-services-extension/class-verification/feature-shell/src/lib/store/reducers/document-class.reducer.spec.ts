/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpLoadState, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { initialDocumentClassState } from '../states/document-class.state';
import { documentClassReducer } from './document-class.reducer';
import { IdpTaskData, REJECTED_CLASS_ID, UNCLASSIFIED_CLASS_ID } from '../../models/screen-models';

describe('Document Class Reducer', () => {
    const mockTaskData: IdpTaskData = {
        batchState: {
            documents: [],
            contentFileReferences: [],
        },
        rejectReasons: [],
        configuration: {
            classificationConfidenceThreshold: 0.5,
            documentClassDefinitions: [
                {
                    id: 'payslips',
                    name: 'Payslips',
                    description: 'You guessed it! Payslips!',
                },
            ],
        },
    };

    it('should return the initial state for unknown action', () => {
        const action = { type: 'Unknown' };
        const state = documentClassReducer(initialDocumentClassState, action);

        expect(state).toBe(initialDocumentClassState);
    });

    it('should load classes on screen loaded successfully', () => {
        const taskClassData = { ...mockTaskData };

        const action = systemActions.screenLoadSuccess({
            taskData: taskClassData,
            taskContext: {} as TaskContext,
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            loadState: IdpLoadState.Loading,
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(Object.values(state.entities).length).toEqual(3);
        expect(state.ids).toEqual([REJECTED_CLASS_ID, UNCLASSIFIED_CLASS_ID, 'payslips']);
        expect(state.loadState).toEqual(IdpLoadState.Loaded);
    });

    it('should load empty classes when screen loaded successfully with empty task data', () => {
        const taskClassData = { ...mockTaskData, configuration: { ...mockTaskData.configuration, documentClassDefinitions: [] } };

        const action = systemActions.screenLoadSuccess({
            taskData: taskClassData,
            taskContext: {} as TaskContext,
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            loadState: IdpLoadState.Loading,
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(Object.values(state.entities).length).toEqual(2);
        expect(state.ids).toEqual([REJECTED_CLASS_ID, UNCLASSIFIED_CLASS_ID]);
        expect(state.loadState).toEqual(IdpLoadState.Loaded);
    });

    it('should update selected class on class select', () => {
        const action = userActions.classSelect({
            classId: 'payslips',
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            expandedClassId: undefined,
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(state.selectedClassId).toEqual('payslips');
        expect(state.expandedClassId).toEqual(undefined);
    });

    it('should clear expanded class on class select with a non expanded class', () => {
        const action = userActions.classSelect({
            classId: 'payslips',
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            expandedClassId: 'contracts',
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(state.expandedClassId).toEqual(undefined);
    });

    it('should retain expanded class on class select with the expanded class', () => {
        const action = userActions.classSelect({
            classId: 'payslips',
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            expandedClassId: 'payslips',
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(state.expandedClassId).toEqual('payslips');
    });

    it('should set class expanded on class expand toggle', () => {
        const action = userActions.classExpandToggle({
            classId: 'payslips',
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            expandedClassId: undefined,
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(state.expandedClassId).toEqual('payslips');
    });

    it('should clear class expanded on class expand toggle with the expanded class', () => {
        const action = userActions.classExpandToggle({
            classId: 'payslips',
        });

        const mockDocumentClassState = {
            ...initialDocumentClassState,
            expandedClassId: 'payslips',
        };

        const state = documentClassReducer(mockDocumentClassState, action);

        expect(state.expandedClassId).toEqual(undefined);
    });
});
