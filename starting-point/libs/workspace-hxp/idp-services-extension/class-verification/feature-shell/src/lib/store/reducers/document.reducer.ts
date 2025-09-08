/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { documentAdapter, DocumentEntity, DocumentState, initialDocumentState } from '../states/document.state';
import { systemActions, userActions } from '../actions/class-verification.actions';
import {
    DocumentCreateStateUpdate,
    DocumentDeleteStateUpdate,
    DocumentStateUpdate,
    DocumentUpdateStateUpdate,
} from '../models/document-state-updates';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { Update } from '@ngrx/entity';

export const documentReducer = createReducer(
    initialDocumentState,

    on(systemActions.createDocuments, (state, { documents }) => {
        return documentAdapter.addMany(documents, {
            ...state,
            loadState: IdpLoadState.Loaded,
            lastAction: undefined,
        });
    }),

    on(userActions.pageSelect, (state, { pageIds }) => {
        return { ...state, selectedPageIds: pageIds, lastAction: undefined };
    }),

    on(userActions.documentExpandToggle, (state, { documentId }) => {
        const expandedDocumentIds = state.expandedDocumentIds.includes(documentId)
            ? state.expandedDocumentIds.filter((id) => id !== documentId)
            : [...state.expandedDocumentIds, documentId];
        return { ...state, expandedDocumentIds, lastAction: undefined };
    }),

    on(userActions.documentPreviewToggle, (state, { documentId }) => {
        const previewedDocumentId = state.previewedDocumentId === documentId ? undefined : documentId;
        return { ...state, previewedDocumentId, lastAction: undefined };
    }),

    on(userActions.documentDragToggle, (state, { documentId }) => {
        const draggedDocumentIds = state.draggedDocumentIds.includes(documentId)
            ? state.draggedDocumentIds.filter((id) => id !== documentId)
            : [...state.draggedDocumentIds, documentId];

        return { ...state, draggedDocumentIds, lastAction: undefined };
    }),

    on(
        userActions.pageMerge,
        userActions.pageSplit,
        userActions.pageMove,
        userActions.pageDelete,
        userActions.documentClassChange,
        userActions.documentResolve,
        userActions.documentReject,
        (state) => {
            return {
                ...state,
                loadState: IdpLoadState.Loading,
            };
        }
    ),

    on(systemActions.documentOperationError, (state, { docAction }) => {
        return {
            ...state,
            loadState: IdpLoadState.Error,
            lastAction: {
                action: docAction,
                isSuccess: false,
                documents: [],
                pages: [],
            },
        };
    }),

    on(systemActions.documentOperationSuccess, (state, { docAction, updates, contextPageIds }) => {
        const updatedState = applyDocumentUpdates(updates, state);

        const documentUpdates = updates.filter((u) => u.operation !== 'delete').map((update) => update.documentId);
        const pageUpdates = documentUpdates.flatMap(
            (documentId) =>
                updatedState.entities[documentId]?.pages
                    ?.filter((p) => contextPageIds.includes(p.id))
                    ?.map((page) => ({
                        id: page.id,
                        name: page.name,
                        documentId,
                    })) || []
        );

        return {
            ...updatedState,
            loadState: IdpLoadState.Loaded,
            lastAction: {
                action: docAction,
                isSuccess: true,
                documents: documentUpdates,
                pages: pageUpdates,
            },
        };
    }),

    on(systemActions.applyDocumentUpdates, (state, { updates }) => {
        return applyDocumentUpdates(updates, state);
    }),

    on(userActions.updatePagesRotation, (state, { pages }) => {
        const documents = documentAdapter.getSelectors().selectAll(state);

        const updates: Update<DocumentEntity>[] = documents.map((document) => {
            const documentPages = pages.filter((page) => page.documentId === document.id);
            if (documentPages.length === 0) {
                return {
                    id: document.id,
                    changes: {},
                };
            }

            const updatedPages = document.pages.map((page) => {
                const pageUpdate = pages.find((p) => p.pageId === page.id && p.documentId === document.id);
                if (!pageUpdate) {
                    return page;
                }

                return {
                    ...page,
                    rotation: pageUpdate?.rotation ?? page.rotation,
                    viewerRotation: pageUpdate?.viewerRotation,
                };
            });

            return {
                id: document.id,
                changes: {
                    pages: updatedPages,
                },
            };
        });
        return documentAdapter.updateMany(updates, state);
    })
);

function applyDocumentUpdates(updates: DocumentStateUpdate[], state: DocumentState): DocumentState {
    const createOps = updates.filter((update) => update.operation === 'create').map((update) => update as DocumentCreateStateUpdate);
    const updateOps = updates.filter((update) => update.operation === 'update').map((update) => update as DocumentUpdateStateUpdate);
    const deleteOps = updates.filter((update) => update.operation === 'delete').map((update) => update as DocumentDeleteStateUpdate);

    let updatedState = state;
    if (createOps.length > 0) {
        const newOrderedDocuments: DocumentEntity[] = createOps.filter((o) => !o.createAfterDocId).map((o) => o.update);
        for (const entity of documentAdapter.getSelectors().selectAll(state)) {
            newOrderedDocuments.push(entity);
            const createOp = createOps.find((o) => o.createAfterDocId === entity.id);
            if (createOp) {
                newOrderedDocuments.push(createOp.update);
            }
        }
        updatedState = documentAdapter.setAll(newOrderedDocuments, state);
    }
    if (updateOps.length > 0) {
        updatedState = documentAdapter.updateMany(
            updateOps.map((o) => ({ id: o.documentId, changes: o.update })),
            updatedState
        );
    }
    if (deleteOps.length > 0) {
        updatedState = documentAdapter.removeMany(
            deleteOps.map((o) => o.documentId),
            updatedState
        );
    }

    return updatedState;
}
