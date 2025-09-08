/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { cloneDeep } from 'es-toolkit/compat';
import { DocOpUndoRedoActionInstance, DocOpUndoRedoState, initialDocOpUndoRedoState } from '../states/doc-op-undo-redo.state';
import { documentAdapter, initialDocumentState } from '../states/document.state';
import { docOpUndoRedoReducer } from './doc-op-undo-redo.reducer';
import { mockDocumentEntities } from '../models/mocked/mocked-documents';
import { systemActions } from '../actions/class-verification.actions';

describe('Undo Redo Reducer', () => {
    it('should return the initial state for unknown action', () => {
        const action = { type: 'Unknown' };
        const state = docOpUndoRedoReducer(initialDocOpUndoRedoState, action);

        expect(state).toBe(initialDocOpUndoRedoState);
    });

    it('should register document Undo Redo operations', () => {
        const documents = mockDocumentEntities();

        const updated1 = cloneDeep(documents[0]);
        updated1.markAsDeleted = true;

        const initialUndoStackItem: DocOpUndoRedoActionInstance = {
            operations: [{ operation: 'update', documentId: updated1.id, update: updated1 }],
        };
        const mockUndoRedoState: DocOpUndoRedoState = {
            ...initialDocOpUndoRedoState,
            undoStack: [initialUndoStackItem],
        };
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const updated2 = cloneDeep(documents[1]);
        const split = updated2.pages.pop();
        const created1 = cloneDeep(documents[1]);
        created1.id = 'new_id';
        created1.name = `${created1.name}_split`;
        created1.isGenerated = true;
        created1.pages.push(split as any);
        const action = systemActions.registerUndoDocumentOperation({
            docState: mockDocumentState,
            updates: [
                { operation: 'update', documentId: updated2.id, update: updated2, deletedPages: undefined },
                { operation: 'create', documentId: created1.id, update: created1, createAfterDocId: documents[1].id },
                { operation: 'delete', documentId: updated2.id },
            ],
        });
        const state = docOpUndoRedoReducer(mockUndoRedoState, action);

        expect(state.undoStack.length).toEqual(2);
        expect(state.redoStack.length).toEqual(0);
        expect(state.undoStack[0]).toEqual(initialUndoStackItem);
        expect(state.undoStack[1].operations).toEqual([
            { operation: 'update', documentId: updated2.id, update: documents[1], deletedPages: undefined },
            { operation: 'delete', documentId: created1.id },
            { operation: 'create', documentId: updated2.id, update: documents[1], createAfterDocId: documents[0].id },
        ]);
    });

    it('should update undo and redo stacks on undo action', () => {
        const documents = mockDocumentEntities();

        const updated1 = cloneDeep(documents[0]);
        updated1.markAsDeleted = true;
        const created1 = cloneDeep(documents[1]);
        created1.id = 'document_id_split';

        const initialUndoStackItems: DocOpUndoRedoActionInstance[] = [
            { operations: [{ operation: 'update', documentId: updated1.id, update: updated1 }] },
            { operations: [{ operation: 'create', documentId: created1.id, update: created1, createAfterDocId: documents[1].id }] },
        ];

        const mockUndoRedoState: DocOpUndoRedoState = {
            ...initialDocOpUndoRedoState,
            undoStack: initialUndoStackItems,
        };
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const action = systemActions.undoAction({ docState: mockDocumentState });
        const state = docOpUndoRedoReducer(mockUndoRedoState, action);

        expect(state.undoStack.length).toEqual(1);
        expect(state.redoStack.length).toEqual(1);
        expect(state.redoStack[0].operations).toEqual([{ operation: 'delete', documentId: created1.id }]);
        expect(state.undoStack[0]).toEqual(initialUndoStackItems[0]);
    });

    it('should do nothing on undo action if the undo stack is empty', () => {
        const documents = mockDocumentEntities();

        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const action = systemActions.undoAction({ docState: mockDocumentState });
        const state = docOpUndoRedoReducer(initialDocOpUndoRedoState, action);

        expect(state.undoStack.length).toEqual(0);
        expect(state.redoStack.length).toEqual(0);
    });

    it('should update undo and redo stacks on redo action', () => {
        const documents = mockDocumentEntities();

        const updated1 = cloneDeep(documents[0]);
        updated1.markAsDeleted = true;

        const initialRedoStackItems: DocOpUndoRedoActionInstance[] = [
            { operations: [{ operation: 'create', documentId: 'document_id_split', update: {} as any, createAfterDocId: documents[1].id }] },
            { operations: [{ operation: 'update', documentId: updated1.id, update: updated1 }] },
        ];
        const mockUndoRedoState: DocOpUndoRedoState = {
            ...initialDocOpUndoRedoState,
            redoStack: initialRedoStackItems,
        };
        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const action = systemActions.redoAction({ docState: mockDocumentState });
        const state = docOpUndoRedoReducer(mockUndoRedoState, action);

        expect(state.undoStack.length).toEqual(1);
        expect(state.redoStack.length).toEqual(1);
        expect(state.undoStack[0].operations).toEqual([
            { operation: 'update', documentId: updated1.id, update: documents[0], deletedPages: undefined },
        ]);
        expect(state.redoStack[0]).toEqual(initialRedoStackItems[0]);
    });

    it('should do nothing on redo action if the redo stack is empty', () => {
        const documents = mockDocumentEntities();

        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const action = systemActions.redoAction({ docState: mockDocumentState });
        const state = docOpUndoRedoReducer(initialDocOpUndoRedoState, action);

        expect(state.undoStack.length).toEqual(0);
        expect(state.redoStack.length).toEqual(0);
    });
});
