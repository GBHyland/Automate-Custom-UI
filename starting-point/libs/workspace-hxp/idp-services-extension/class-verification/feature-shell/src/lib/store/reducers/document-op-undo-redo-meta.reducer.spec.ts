/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ClassVerificationRootState, initialClassVerificationRootState } from '../states/root.state';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { documentOpUndoRedoMetaReducer } from './document-op-undo-redo-meta.reducer';
import { ActionReducer } from '@ngrx/store';
import { DocOpUndoRedoActionInstance, initialDocOpUndoRedoState } from '../states/doc-op-undo-redo.state';
import { mockDocumentEntities } from '../models/mocked/mocked-documents';
import { documentAdapter, initialDocumentState } from '../states/document.state';

describe('Undo Redo Meta Reducer', () => {
    let metaReducer: ActionReducer<ClassVerificationRootState>;
    let mockReducer: jasmine.Spy;

    beforeEach(() => {
        mockReducer = jasmine.createSpy('getClassVerificationRootReducer');
        metaReducer = documentOpUndoRedoMetaReducer(mockReducer);
    });

    it('should return initial state when input state is not set', () => {
        const state = metaReducer(undefined, userActions.undoAction);
        expect(state).toEqual(initialClassVerificationRootState);
    });

    it('should register undo document operation on document operation success', () => {
        const documents = mockDocumentEntities();
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);
        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: mockDocumentState,
            undoRedo: {
                ...initialDocOpUndoRedoState,
            },
        };

        const action = systemActions.documentOperationSuccess({
            canUndoAction: true,
            updates: [{ operation: 'update', documentId: 'document_id', update: { id: 'document_id' } as any }],
        } as any);
        metaReducer(mockState, action);
        const expected = systemActions.registerUndoDocumentOperation({
            docState: mockState.documents,
            updates: action.updates,
        });
        expect(mockReducer).toHaveBeenCalledWith(mockState, expected);
    });

    it('should not register undo document operation on document operation success with canUndoAction set to false', () => {
        const documents = mockDocumentEntities();
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);
        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: mockDocumentState,
            undoRedo: {
                ...initialDocOpUndoRedoState,
            },
        };

        const action = systemActions.documentOperationSuccess({
            canUndoAction: false,
            updates: [{ operation: 'update', documentId: 'document_id', update: { id: 'document_id' } as any }],
        } as any);
        metaReducer(mockState, action);
        const expected = systemActions.registerUndoDocumentOperation({
            docState: mockState.documents,
            updates: action.updates,
        });
        expect(mockReducer).not.toHaveBeenCalledWith(mockState, expected);
        expect(mockReducer).toHaveBeenCalledWith(mockState, action);
    });

    it('should apply undo operations on user undo action', () => {
        const documents = mockDocumentEntities();
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const undo1: DocOpUndoRedoActionInstance = {
            operations: [{ operation: 'update', documentId: 'document_id', update: { id: 'document_id' } as any }],
        };
        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: mockDocumentState,
            undoRedo: {
                ...initialDocOpUndoRedoState,
                undoStack: [undo1],
            },
        };

        mockReducer.and.returnValue(mockState);
        const result = metaReducer(mockState, userActions.undoAction());
        const expectedUndoAction = systemActions.undoAction({ docState: mockState.documents });
        const expectedApplyAction = systemActions.applyDocumentUpdates({ updates: undo1.operations, isUndo: true });
        expect(mockReducer).toHaveBeenCalledTimes(2);
        expect(mockReducer).toHaveBeenCalledWith(mockState, expectedUndoAction);
        expect(mockReducer).toHaveBeenCalledWith(mockState, expectedApplyAction);
        expect(result).toEqual(mockState);
    });

    it('should not apply undo operations on user undo action', () => {
        const documents = mockDocumentEntities();
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: mockDocumentState,
            undoRedo: { ...initialDocOpUndoRedoState },
        };

        mockReducer.and.returnValue(mockState);
        const result = metaReducer(mockState, userActions.undoAction());
        const expectedUndoAction = systemActions.undoAction({ docState: mockState.documents });
        expect(mockReducer).toHaveBeenCalledTimes(1);
        expect(mockReducer).toHaveBeenCalledWith(mockState, expectedUndoAction);
        expect(result).toEqual(mockState);
    });

    it('should apply redo operations on user redo action', () => {
        const documents = mockDocumentEntities();
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const redo1: DocOpUndoRedoActionInstance = {
            operations: [{ operation: 'update', documentId: 'document_id', update: { id: 'document_id' } as any }],
        };
        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: mockDocumentState,
            undoRedo: {
                ...initialDocOpUndoRedoState,
                redoStack: [redo1],
            },
        };

        mockReducer.and.returnValue(mockState);
        const result = metaReducer(mockState, userActions.redoAction());
        const expectedRedoAction = systemActions.redoAction({ docState: mockState.documents });
        const expectedApplyAction = systemActions.applyDocumentUpdates({ updates: redo1.operations, isRedo: true });
        expect(mockReducer).toHaveBeenCalledTimes(2);
        expect(mockReducer).toHaveBeenCalledWith(mockState, expectedRedoAction);
        expect(mockReducer).toHaveBeenCalledWith(mockState, expectedApplyAction);
        expect(result).toEqual(mockState);
    });

    it('should not apply undo operations on user undo action', () => {
        const documents = mockDocumentEntities();
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const mockState: ClassVerificationRootState = {
            ...initialClassVerificationRootState,
            documents: mockDocumentState,
            undoRedo: { ...initialDocOpUndoRedoState },
        };

        mockReducer.and.returnValue(mockState);
        const result = metaReducer(mockState, userActions.redoAction());
        const expectedRedoAction = systemActions.redoAction({ docState: mockState.documents });
        expect(mockReducer).toHaveBeenCalledTimes(1);
        expect(mockReducer).toHaveBeenCalledWith(mockState, expectedRedoAction);
        expect(result).toEqual(mockState);
    });
});
