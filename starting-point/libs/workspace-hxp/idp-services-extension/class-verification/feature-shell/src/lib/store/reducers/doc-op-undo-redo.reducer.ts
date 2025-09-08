/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { initialDocOpUndoRedoState } from '../states/doc-op-undo-redo.state';
import { systemActions } from '../actions/class-verification.actions';
import { generateReverseActions } from '../models/document-state-updates';

export const docOpUndoRedoReducer = createReducer(
    initialDocOpUndoRedoState,
    on(systemActions.registerUndoDocumentOperation, (state, { docState, updates }) => {
        const operations = generateReverseActions(docState, updates);
        return {
            ...state,
            undoStack: [...state.undoStack, { operations }],
            redoStack: [],
        };
    }),

    on(systemActions.undoAction, (state, { docState }) => {
        const undoAction = state.undoStack.at(-1);
        if (undoAction) {
            const correspondingRedoAction = { operations: generateReverseActions(docState, undoAction.operations) };
            state = {
                ...state,
                undoStack: state.undoStack.slice(0, -1),
                redoStack: [...state.redoStack, correspondingRedoAction],
            };
        }

        return state;
    }),

    on(systemActions.redoAction, (state, { docState }) => {
        const redoAction = state.redoStack.at(-1);
        if (redoAction) {
            const correspondingUndoAction = { operations: generateReverseActions(docState, redoAction.operations) };
            state = {
                ...state,
                undoStack: [...state.undoStack, correspondingUndoAction],
                redoStack: state.redoStack.slice(0, -1),
            };
        }

        return state;
    })
);
