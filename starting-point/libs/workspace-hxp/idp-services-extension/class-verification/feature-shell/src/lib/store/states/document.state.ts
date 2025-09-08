/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createEntityAdapter, EntityState } from '@ngrx/entity';
import { IdpDocument, IdpDocumentActionCompleteEvent, UNCLASSIFIED_CLASS_ID } from '../../models/screen-models';
import { IdentifierData, IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DocumentPageEntity } from './document-page.state';

export type DocumentEntity = Omit<IdpDocument, 'isSelected' | 'isExpanded' | 'pages' | 'hasIssue'> & {
    isGenerated: boolean;
    isImported?: boolean;
    markAsDeleted?: boolean;
    markAsResolved?: boolean;
} & {
    pages: (DocumentPageEntity & {
        fileReference: string;
        viewerRotation?: number;
    })[];
};

export interface DocumentState extends EntityState<DocumentEntity> {
    selectedPageIds: string[];
    expandedDocumentIds: string[];
    previewedDocumentId?: string;
    draggedDocumentIds: string[];
    loadState: IdpLoadState;
    lastAction?: IdpDocumentActionCompleteEvent;
}

export const documentAdapter = createEntityAdapter<DocumentEntity>();

export const initialDocumentState: DocumentState = documentAdapter.getInitialState({
    selectedPageIds: [],
    draggedDocumentIds: [],
    expandedDocumentIds: [],
    loadState: IdpLoadState.NotInitialized,
});

export function isDocumentValid(document: DocumentEntity, documentClasses: IdentifierData[]): boolean {
    const reviewRequired = document.verificationStatus === IdpVerificationStatus.AutoInvalid;
    const hasValidClass = documentClasses.some((c) => c.id === document.class?.id && c.id !== UNCLASSIFIED_CLASS_ID);
    const isRejected = Boolean(document.rejectedReasonId);
    const isResolved = document.markAsResolved === true;
    return isRejected || isResolved || (!reviewRequired && hasValidClass);
}
