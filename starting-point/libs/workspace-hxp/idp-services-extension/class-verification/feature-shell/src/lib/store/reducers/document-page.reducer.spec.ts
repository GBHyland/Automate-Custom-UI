/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { systemActions, userActions } from '../actions/class-verification.actions';
import { documentPageReducer } from './document-page.reducer';
import { mockDocumentEntities } from '../models/mocked/mocked-documents';
import { documentPageAdapter, DocumentPageEntity, initialDocumentPageState } from '../states/document-page.state';
import { mockIdpDocuments } from '../../models/mocked/mocked-documents';
import { IdpDocumentAction } from '../../models/screen-models';

describe('Document Page Reducer', () => {
    it('should return the initial state for unknown action', () => {
        const action = { type: 'Unknown' };
        const state = documentPageReducer(initialDocumentPageState, action);

        expect(state).toBe(initialDocumentPageState);
    });

    it('should add document pages on create documents', () => {
        const createdDocuments = mockDocumentEntities();
        const existingDocumentPages = createdDocuments.pop()?.pages.map((page) => asDocumentPageEntity(page)) ?? [];
        const deletedDocument = createdDocuments[1];
        deletedDocument.markAsDeleted = true;

        const initialState = documentPageAdapter.setAll(existingDocumentPages, initialDocumentPageState);

        const action = systemActions.createDocuments({ documents: createdDocuments });

        const newState = documentPageReducer(initialState, action);
        const newPages = Object.values(newState.entities);

        const expectedCreatedDocumentPages = createdDocuments.flatMap((document) =>
            document.pages.map((page) => ({ ...asDocumentPageEntity(page), markAsDeleted: document.markAsDeleted } as DocumentPageEntity))
        );

        expect(newPages.length).toEqual(existingDocumentPages.length + expectedCreatedDocumentPages.length);
        expect(newPages).toEqual([...existingDocumentPages, ...expectedCreatedDocumentPages]);
    });

    it('should mark pages as deleted on page delete', () => {
        const initialPages = mockDocumentEntities().flatMap((document) => document.pages);

        const initialState = documentPageAdapter.setAll(initialPages, initialDocumentPageState);

        const pagesToDelete = mockIdpDocuments()
            .flatMap((document) => document.pages)
            .slice(0, 2);
        const action = userActions.pageDelete({ docAction: IdpDocumentAction.Delete, canUndoAction: true, pages: pagesToDelete });

        const newState = documentPageReducer(initialState, action);
        const newPages = Object.values(newState.entities);
        const expectedDeletedPages = newPages.filter((page) => pagesToDelete.some((p) => p.id === page?.id));
        expect(expectedDeletedPages.length).toEqual(pagesToDelete.length);
        expect(expectedDeletedPages.every((page) => page?.markAsDeleted)).toBeTrue();
    });

    it('should mark pages as not deleted on page delete undo', () => {
        const initialDocuments = mockDocumentEntities();
        initialDocuments[0].pages[0].markAsDeleted = true;
        initialDocuments[1].pages[0].markAsDeleted = true;
        initialDocuments[1].pages[1].markAsDeleted = true;
        const initialPages = initialDocuments.flatMap((document) => document.pages);

        const initialState = documentPageAdapter.setAll(initialPages, initialDocumentPageState);

        const action = systemActions.applyDocumentUpdates({
            updates: [
                {
                    operation: 'update',
                    documentId: initialDocuments[0].id,
                    update: initialDocuments[0],
                    deletedPages: [initialDocuments[0].pages[0]],
                },
                {
                    operation: 'update',
                    documentId: initialDocuments[1].id,
                    update: initialDocuments[1],
                    deletedPages: [initialDocuments[1].pages[0], initialDocuments[1].pages[1]],
                },
            ],
            isUndo: true,
        });

        const newState = documentPageReducer(initialState, action);
        const newPages = Object.values(newState.entities);
        const expectedRestoredPages = newPages.filter(
            (page) =>
                page?.id === initialDocuments[0].pages[0].id ||
                page?.id === initialDocuments[1].pages[0].id ||
                page?.id === initialDocuments[1].pages[1].id
        );
        expect(expectedRestoredPages.every((page) => !page?.markAsDeleted)).toBeTrue();
    });

    it('should mark pages as deleted on page delete redo', () => {
        const initialDocuments = mockDocumentEntities();
        initialDocuments[0].pages[0].markAsDeleted = false;
        initialDocuments[1].pages[0].markAsDeleted = false;
        initialDocuments[1].pages[1].markAsDeleted = false;
        const initialPages = initialDocuments.flatMap((document) => document.pages);

        const initialState = documentPageAdapter.setAll(initialPages, initialDocumentPageState);

        const action = systemActions.applyDocumentUpdates({
            updates: [
                {
                    operation: 'update',
                    documentId: initialDocuments[0].id,
                    update: initialDocuments[0],
                    deletedPages: [initialDocuments[0].pages[0]],
                },
                {
                    operation: 'update',
                    documentId: initialDocuments[1].id,
                    update: initialDocuments[1],
                    deletedPages: [initialDocuments[1].pages[0], initialDocuments[1].pages[1]],
                },
                {
                    operation: 'update',
                    documentId: initialDocuments[2].id,
                    update: initialDocuments[2],
                },
            ],
            isRedo: true,
        });

        const newState = documentPageReducer(initialState, action);
        const newPages = Object.values(newState.entities);
        const expectedDeletedPages = newPages.filter(
            (page) =>
                page?.id === initialDocuments[0].pages[0].id ||
                page?.id === initialDocuments[1].pages[0].id ||
                page?.id === initialDocuments[1].pages[1].id
        );
        expect(expectedDeletedPages.every((page) => page?.markAsDeleted)).toBeTrue();
    });

    it('should do nothing when document updates are not undo or redo', () => {
        const initialDocuments = mockDocumentEntities();
        const initialPages = mockDocumentEntities().flatMap((document) => document.pages);

        const initialState = documentPageAdapter.setAll(initialPages, initialDocumentPageState);

        const action = systemActions.applyDocumentUpdates({
            updates: [
                {
                    operation: 'update',
                    documentId: initialDocuments[0].id,
                    update: initialDocuments[0],
                    deletedPages: [initialDocuments[0].pages[0]],
                },
                {
                    operation: 'update',
                    documentId: initialDocuments[1].id,
                    update: initialDocuments[1],
                    deletedPages: [initialDocuments[1].pages[0], initialDocuments[1].pages[1]],
                },
            ],
        });

        const newState = documentPageReducer(initialState, action);
        expect(initialState).toEqual(newState);
    });

    function asDocumentPageEntity(page: DocumentPageEntity): DocumentPageEntity {
        return {
            id: page.id,
            name: page.name,
            contentFileReferenceIndex: page.contentFileReferenceIndex,
            sourcePageIndex: page.sourcePageIndex,
            rotation: page.rotation,
            markAsDeleted: page.markAsDeleted,
        };
    }
});
