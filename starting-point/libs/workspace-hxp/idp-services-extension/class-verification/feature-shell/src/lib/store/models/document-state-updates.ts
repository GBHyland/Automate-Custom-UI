/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DocumentPageEntity } from '../states/document-page.state';
import { DocumentEntity, DocumentState } from '../states/document.state';

export interface DocumentCreateStateUpdate {
    operation: 'create';
    documentId: string;
    update: DocumentEntity;
    createAfterDocId: string;
}

export interface DocumentUpdateStateUpdate {
    operation: 'update';
    documentId: string;
    update: DocumentEntity;
    deletedPages?: DocumentPageEntity[];
}

export interface DocumentDeleteStateUpdate {
    operation: 'delete';
    documentId: string;
}

export interface IdpPagesMetadata {
    pageId: string;
    documentId: string;
    rotation?: number;
    viewerRotation?: number;
}

export type DocumentStateUpdate = DocumentCreateStateUpdate | DocumentUpdateStateUpdate | DocumentDeleteStateUpdate;

export function generateReverseActions(state: DocumentState, updates: DocumentStateUpdate[]): DocumentStateUpdate[] {
    const documentEntities = state.entities;
    const reverseUpdates: DocumentStateUpdate[] = [];
    for (const update of updates) {
        const entity = documentEntities[update.documentId];

        if (update.operation === 'update') {
            if (!entity) {
                continue;
            }
            reverseUpdates.push({
                operation: 'update',
                documentId: update.documentId,
                update: entity,
                deletedPages: update.deletedPages,
            });
        }

        if (update.operation === 'delete') {
            if (!entity) {
                continue;
            }
            let prevDocId = '';
            for (const docId of Object.keys(documentEntities)) {
                if (docId === update.documentId) {
                    break;
                }
                prevDocId = docId;
            }
            reverseUpdates.push({
                operation: 'create',
                documentId: update.documentId,
                update: entity,
                createAfterDocId: prevDocId,
            });
        }

        if (update.operation === 'create') {
            reverseUpdates.push({
                operation: 'delete',
                documentId: update.documentId,
            });
        }
    }

    return reverseUpdates;
}
