/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { fakeAsync, flush } from '@angular/core/testing';
import { DocOpUndoRedoState, initialDocOpUndoRedoState } from '../states/doc-op-undo-redo.state';
import { DocumentEntity } from '../states/document.state';
import { createMockStore } from '@ngrx/store/testing';
import { classVerificationStateName, initialClassVerificationRootState } from '../states/root.state';
import { undoRedoFeatureSelector } from './class-verification-root.selectors';
import { selectCanRedo, selectCanUndo } from './undo-redo.selectors';

describe('Undo Redo Selectors', () => {
    it('should select true if undo stack has items', fakeAsync(() => {
        const mockUndoRedoState: DocOpUndoRedoState = {
            ...initialDocOpUndoRedoState,
            undoStack: [
                {
                    operations: [
                        { operation: 'update', documentId: 'd_cf1', update: {} as DocumentEntity },
                        { operation: 'delete', documentId: 'd_cf2' },
                    ],
                },
            ],
        };

        const store = createMockStore({
            initialState: { [classVerificationStateName]: initialClassVerificationRootState },
            selectors: [{ selector: undoRedoFeatureSelector, value: mockUndoRedoState }],
        });

        let result: boolean | undefined;
        store.select(selectCanUndo).subscribe((can) => (result = can));

        flush();

        expect(result).toBeDefined();
        expect(result).toBeTrue();
    }));

    it('should select false if undo stack has no items', fakeAsync(() => {
        const store = createMockStore({
            initialState: { [classVerificationStateName]: initialClassVerificationRootState },
            selectors: [{ selector: undoRedoFeatureSelector, value: initialDocOpUndoRedoState }],
        });

        let result: boolean | undefined;
        store.select(selectCanUndo).subscribe((can) => (result = can));

        flush();

        expect(result).toBeDefined();
        expect(result).toBeFalse();
    }));

    it('should select true if redo stack has items', fakeAsync(() => {
        const mockUndoRedoState: DocOpUndoRedoState = {
            ...initialDocOpUndoRedoState,
            redoStack: [{ operations: [{ operation: 'update', documentId: 'd_cf1', update: {} as DocumentEntity }] }],
        };

        const store = createMockStore({
            initialState: { [classVerificationStateName]: initialClassVerificationRootState },
            selectors: [{ selector: undoRedoFeatureSelector, value: mockUndoRedoState }],
        });

        let result: boolean | undefined;
        store.select(selectCanRedo).subscribe((can) => (result = can));

        flush();

        expect(result).toBeDefined();
        expect(result).toBeTrue();
    }));

    it('should select false if redo stack has no items', fakeAsync(() => {
        const store = createMockStore({
            initialState: { [classVerificationStateName]: initialClassVerificationRootState },
            selectors: [{ selector: undoRedoFeatureSelector, value: initialDocOpUndoRedoState }],
        });

        let result: boolean | undefined;
        store.select(selectCanRedo).subscribe((can) => (result = can));

        flush();

        expect(result).toBeDefined();
        expect(result).toBeFalse();
    }));
});
