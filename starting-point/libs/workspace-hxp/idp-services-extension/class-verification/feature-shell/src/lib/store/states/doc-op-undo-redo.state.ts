/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentStateUpdate } from '../models/document-state-updates';

export interface DocOpUndoRedoActionInstance {
    operations: DocumentStateUpdate[];
}

export interface DocOpUndoRedoState {
    undoStack: DocOpUndoRedoActionInstance[];
    redoStack: DocOpUndoRedoActionInstance[];
}

export const initialDocOpUndoRedoState: DocOpUndoRedoState = {
    undoStack: [],
    redoStack: [],
};
