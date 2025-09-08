/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { documentFeatureSelector } from './field-verification-root.selectors';
import { selectFieldsWithIssue } from './document-field.selectors';
import { IdpDocument } from '../../models/screen-models';

export const selectDocument = createSelector(documentFeatureSelector, selectFieldsWithIssue, (state, fieldsWithIssue) => {
    const hasIssue = fieldsWithIssue.length > 0;
    const document: IdpDocument = {
        id: state.id,
        name: state.name,
        class: state.class,
        rejectReasonId: state.rejectReasonId,
        markAsRejected: state.markAsRejected,
        rejectNote: state.rejectNote,
        hasIssue,
        pages: state.pages.map((page) => {
            return {
                id: page.id,
                name: page.name,
                documentId: state.id,
                fileReference: page.fileReference,
                sourcePageIndex: page.sourcePageIndex,
                rotation: page.rotation,
                viewerRotation: page.viewerRotation,
                hasIssue,
                isSelected: state.selectedPageIds.includes(page.id),
            };
        }),
    };
    return document;
});

export const selectDocumentValid = createSelector(selectDocument, (document) => !document.hasIssue);

export const selectPageById = (id: string) =>
    createSelector(selectDocument, (document) => {
        return document.pages.find((page) => page.id === id);
    });
