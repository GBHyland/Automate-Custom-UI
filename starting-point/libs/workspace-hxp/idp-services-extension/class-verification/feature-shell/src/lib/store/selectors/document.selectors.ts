/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { documentAdapter, isDocumentValid } from '../states/document.state';
import {
    DocumentClassMetadata,
    IdpConfigClass,
    IdpDocument,
    IdpDocumentPage,
    REJECTED_CLASS_ID,
    UNCLASSIFIED_CLASS_ID,
} from '../../models/screen-models';
import { documentClassAdapter } from '../states/document-class.state';
import { documentClassFeatureSelector, documentFeatureSelector } from './class-verification-root.selectors';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

const documentFeature = documentFeatureSelector;
const documentClassFeature = documentClassFeatureSelector;

export const selectDocumentsRawState = createSelector(documentAdapter.getSelectors(documentFeature).selectAll, (documents) => documents);

export const selectAllDocumentClasses = createSelector(
    documentClassFeature,
    documentClassAdapter.getSelectors(documentClassFeature).selectAll,
    (state, classes) => {
        if (state.loadState === IdpLoadState.NotInitialized) {
            return [];
        }
        return classes.map<IdpConfigClass>((docClass) => {
            return {
                ...docClass,
                isSelected: state.selectedClassId === docClass.id,
                isExpanded: state.expandedClassId === docClass.id,
                isPreviewed: state.previewedClassId === docClass.id,
            };
        });
    }
);

/**
 * All selectors that return either document or page should derive from this selection.
 * This selector converts the store state to type expected by consumers.
 */
export const selectAllDocuments = createSelector(
    documentFeature,
    documentAdapter.getSelectors(documentFeature).selectAll,
    selectAllDocumentClasses,
    (state, documents, allDocumentClasses) => {
        if (state.loadState === IdpLoadState.NotInitialized) {
            return [];
        }
        return documents
            .filter((doc) => !doc.markAsDeleted)
            .map<IdpDocument>((doc) => {
                const documentValid = isDocumentValid(doc, allDocumentClasses);
                let isDocumentSelected = false;
                const pages: IdpDocumentPage[] = [];
                for (const page of doc.pages) {
                    const updatedPage = {
                        id: page.id,
                        name: page.name,
                        documentId: doc.id,
                        fileReference: page.fileReference,
                        sourcePageIndex: page.sourcePageIndex,
                        rotation: page.rotation,
                        viewerRotation: page.viewerRotation,
                        hasIssue: !documentValid,
                        isSelected: state.selectedPageIds.includes(page.id),
                    };
                    pages.push(updatedPage);
                    isDocumentSelected ||= updatedPage.isSelected;
                }

                return {
                    id: doc.id,
                    name: doc.name,
                    class: doc.class,
                    classificationConfidence: doc.classificationConfidence,
                    verificationStatus: doc.verificationStatus,
                    hasIssue: !documentValid,
                    pages,
                    rejectedReasonId: doc.rejectedReasonId,
                    isSelected: isDocumentSelected,
                    isExpanded: state.expandedDocumentIds.includes(doc.id),
                    isPreviewed: state.previewedDocumentId === doc.id,
                    isDragging: state.draggedDocumentIds.includes(doc.id),
                };
            });
    }
);

export const selectAllSelectedDocuments = createSelector(selectAllDocuments, (documents) => {
    return documents.filter((doc) => doc.isSelected);
});

export const selectAllSelectedPages = createSelector(selectAllSelectedDocuments, (documents) => {
    return documents.flatMap((doc) => doc.pages).filter((page) => page.isSelected);
});

export const selectDocumentsReady = createSelector(documentFeature, (state) => {
    return state.loadState === IdpLoadState.Loaded;
});

export const selectDocumentsWithIssue = createSelector(selectAllDocuments, (documents) => {
    return documents.filter((doc) => doc.hasIssue);
});

export const selectAllDocumentsValid = createSelector(selectDocumentsWithIssue, (documents) => {
    return documents.length === 0;
});

export const selectDocumentCountInfo = createSelector(selectAllDocuments, selectDocumentsWithIssue, (documents, documentsWithIssues) => {
    return {
        totalDocuments: documents.length,
        totalPages: documents.flatMap((doc) => doc.pages).length,
        documentsWithIssues: documentsWithIssues.length,
    };
});

export const selectDocumentActionCompleteEvent = createSelector(documentFeature, (state) => {
    return state.lastAction;
});

export const selectDocumentEntityStateForIds = (ids: string[]) =>
    createSelector(documentAdapter.getSelectors(documentFeature).selectAll, (documents) => {
        return documents.filter((doc) => ids.includes(doc.id));
    });

export const selectPageById = (id: string) =>
    createSelector(selectAllDocuments, (documents) => {
        return documents.flatMap((doc) => doc.pages).find((page) => page.id === id);
    });

export const selectSelectedDocumentClass = createSelector(selectAllDocumentClasses, (allClasses) =>
    allClasses.find((docClass) => docClass.isSelected)
);

export const selectClassById = (id: string) =>
    createSelector(selectAllDocumentClasses, (classes) => {
        return classes.find((docClass) => docClass.id === id);
    });

export const selectDocumentsGroupedByClass = createSelector(selectAllDocuments, selectAllDocumentClasses, (documents, classes) => {
    const group: Record<string, IdpDocument[]> = {};
    for (const doc of documents) {
        const isRejected = Boolean(doc.rejectedReasonId);
        const isUnclassified = !doc.class || !classes.some((docClass) => docClass.id === doc.class?.id);
        const classId = isRejected ? REJECTED_CLASS_ID : isUnclassified || !doc.class ? UNCLASSIFIED_CLASS_ID : doc.class.id;

        if (!group[classId]) {
            group[classId] = [];
        }
        group[classId].push(doc);
    }

    return group;
});

export const selectAllDocumentsForClass = (classId: string) =>
    createSelector(selectDocumentsGroupedByClass, (groupedDocs) => {
        return groupedDocs[classId] || [];
    });

export const selectClassMetadata = createSelector(selectDocumentsGroupedByClass, selectAllDocumentClasses, (docGroup, classes) => {
    return classes.map<DocumentClassMetadata>((docClass) => {
        const documents = docGroup[docClass.id] || [];
        const issuesCount = documents.filter((doc) => doc.hasIssue).length;
        return {
            ...docClass,
            documentsCount: documents.length,
            issuesCount,
            canExpand: documents.length > 0,
            disabled: documents.length === 0,
        };
    });
});

export const selectClassIdsWithDocuments = createSelector(selectAllDocuments, (documents) => {
    const classes = documents
        .filter((doc) => doc.class != null && doc.rejectedReasonId == null && doc.class?.id !== 'unclassified')
        .flatMap((doc) => doc.class?.id);
    return new Set(classes);
});
