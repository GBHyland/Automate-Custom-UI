/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { documentPageAdapter, DocumentPageEntity, initialDocumentPageState } from '../states/document-page.state';
import { DocumentStateUpdate } from '../models/document-state-updates';

export const documentPageReducer = createReducer(
    initialDocumentPageState,

    on(systemActions.createDocuments, (state, { documents }) => {
        return documentPageAdapter.addMany(
            documents
                .flatMap((document) => document.pages.map((page) => ({ page, markAsDeleted: document.markAsDeleted })))
                .map(({ page, markAsDeleted }) => ({
                    id: page.id,
                    name: page.name,
                    contentFileReferenceIndex: page.contentFileReferenceIndex,
                    sourcePageIndex: page.sourcePageIndex,
                    rotation: page.rotation,
                    markAsDeleted: markAsDeleted,
                })),
            state
        );
    }),

    on(userActions.pageDelete, (state, { pages }) => {
        return documentPageAdapter.updateMany(
            pages.map((page) => ({
                id: page.id,
                changes: { markAsDeleted: true },
            })),
            state
        );
    }),

    on(systemActions.applyDocumentUpdates, (state, { updates, isUndo, isRedo }) => {
        return isUndo || isRedo
            ? documentPageAdapter.updateMany(
                  getDeletedPages(updates).map((page) => ({
                      id: page.id,
                      changes: { markAsDeleted: !isUndo },
                  })),
                  state
              )
            : { ...state };
    })
);

function getDeletedPages(updates: DocumentStateUpdate[]): DocumentPageEntity[] {
    return updates.filter((update) => update.operation === 'update').flatMap((update) => update.deletedPages ?? []);
}
