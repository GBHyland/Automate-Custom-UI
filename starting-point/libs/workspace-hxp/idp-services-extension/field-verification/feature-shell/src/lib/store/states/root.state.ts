/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// import { DocOpUndoRedoState, initialDocOpUndoRedoState } from './doc-op-undo-redo.state';
import { DocumentFieldState, initialDocumentFieldState } from './document-field.state';
import { DocumentTableState, initialDocumentTableState } from './document-table.state';
import { DocumentState, initialDocumentState } from './document.state';
import { initialScreenState, ScreenState } from './screen.state';

export const fieldVerificationStateName = 'idp-field-verification';

export interface FieldVerificationRootState {
    document: DocumentState;
    fields: DocumentFieldState;
    tables: DocumentTableState;
    screen: ScreenState;
    // undoRedo: DocOpUndoRedoState;
}

export const initialFieldVerificationRootState: FieldVerificationRootState = {
    document: initialDocumentState,
    fields: initialDocumentFieldState,
    tables: initialDocumentTableState,
    screen: initialScreenState,
    // undoRedo: initialDocOpUndoRedoState,
};
