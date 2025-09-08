/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { cloneDeep } from 'es-toolkit/compat';
import { documentAdapter, initialDocumentState } from '../states/document.state';
import { mockDocumentEntities } from '../models/mocked/mocked-documents';
import { DocumentStateUpdate, generateReverseActions } from './document-state-updates';

describe('Document State Updates', () => {
    it('should generate reverse actions', () => {
        const documents = mockDocumentEntities();

        const updated1 = cloneDeep(documents[0]);
        const updated1DeletedPages = [updated1.pages[1]];
        updated1.pages.splice(1, 1);

        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const updated2 = cloneDeep(documents[1]);
        const split = updated2.pages.pop();
        const created1 = cloneDeep(documents[1]);
        created1.id = 'new_id';
        created1.name = `${created1.name}_split`;
        created1.isGenerated = true;
        created1.pages.push(split as any);
        const updates: DocumentStateUpdate[] = [
            { operation: 'update', documentId: updated1.id, update: updated1, deletedPages: updated1DeletedPages },
            { operation: 'create', documentId: created1.id, update: created1, createAfterDocId: documents[1].id },
            { operation: 'delete', documentId: updated2.id },
        ];

        const result = generateReverseActions(mockDocumentState, updates);

        expect(result).toEqual([
            { operation: 'update', documentId: updated1.id, update: documents[0], deletedPages: updated1DeletedPages },
            { operation: 'delete', documentId: created1.id },
            { operation: 'create', documentId: updated2.id, update: documents[1], createAfterDocId: documents[0].id },
        ]);
    });

    it('should ignore documents which cannot be found when generating reverse actions', () => {
        const documents = mockDocumentEntities();

        const updated1 = cloneDeep(documents[0]);
        updated1.markAsDeleted = true;

        const mockDocumentState = documentAdapter.setAll(documents, initialDocumentState);

        const updates: DocumentStateUpdate[] = [
            { operation: 'update', documentId: 'bad_document_id_1', update: {} as any },
            { operation: 'delete', documentId: 'bad_document_id_2' },
        ];

        const result = generateReverseActions(mockDocumentState, updates);
        expect(result).toEqual([]);
    });
});
