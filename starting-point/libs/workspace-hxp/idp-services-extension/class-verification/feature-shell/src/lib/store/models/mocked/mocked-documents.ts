/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { mockIdpDocuments } from '../../../models/mocked/mocked-documents';
import { IdpDocument, IdpDocumentPage } from '../../../models/screen-models';
import { DocumentEntity } from '../../states/document.state';

export function mockDocumentEntities(): DocumentEntity[] {
    const documents = mockIdpDocuments();
    return mockDocumentEntitiesByIdpDocuments(documents);
}

function mapPage(page: IdpDocumentPage) {
    const { documentId, hasIssue, isSelected, ...rest } = page;
    return {
        ...rest,
        contentFileReferenceIndex: 0,
    };
}

export function mockDocumentEntitiesByIdpDocuments(documents: IdpDocument[]): DocumentEntity[] {
    return documents.map((document) => {
        const { isSelected, isExpanded, isPreviewed, isDragging, pages, hasIssue, ...rest } = document;
        return {
            ...rest,
            isGenerated: false,
            markAsDeleted: false,
            markAsResolved: false,
            pages: pages.map((page) => mapPage(page)),
        };
    });
}

export function deepCopyDocumentEntity(document: DocumentEntity): DocumentEntity {
    return {
        ...document,
        pages: document.pages.map((page) => ({ ...page })),
    };
}
