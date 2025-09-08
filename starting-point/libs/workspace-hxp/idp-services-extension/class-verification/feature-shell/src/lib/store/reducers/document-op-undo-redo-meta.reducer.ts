/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Action, ActionReducer } from '@ngrx/store';
import { ClassVerificationRootState, initialClassVerificationRootState } from '../states/root.state';
import { systemActions, userActions } from '../actions/class-verification.actions';

export function documentOpUndoRedoMetaReducer(reducer: ActionReducer<ClassVerificationRootState>): ActionReducer<ClassVerificationRootState> {
    return (state, action: Action) => {
        if (!state) {
            return initialClassVerificationRootState;
        }

        if (action.type === systemActions.documentOperationSuccess.type) {
            const typedAction = action as ReturnType<typeof systemActions.documentOperationSuccess>;
            if (typedAction.canUndoAction && typedAction.updates.length > 0) {
                state = reducer(state, systemActions.registerUndoDocumentOperation({ docState: state.documents, updates: typedAction.updates }));
            }
        }

        if (action.type === userActions.undoAction.type) {
            const undoAction = state.undoRedo.undoStack.at(-1);
            state = reducer(state, systemActions.undoAction({ docState: state.documents }));
            if (undoAction) {
                state = reducer(state, systemActions.applyDocumentUpdates({ updates: undoAction.operations, isUndo: true }));
            }
            return state;
        }

        if (action.type === userActions.redoAction.type) {
            const redoAction = state.undoRedo.redoStack.at(-1);
            state = reducer(state, systemActions.redoAction({ docState: state.documents }));
            if (redoAction) {
                state = reducer(state, systemActions.applyDocumentUpdates({ updates: redoAction.operations, isRedo: true }));
            }
            return state;
        }

        return reducer(state, action);
    };
}
