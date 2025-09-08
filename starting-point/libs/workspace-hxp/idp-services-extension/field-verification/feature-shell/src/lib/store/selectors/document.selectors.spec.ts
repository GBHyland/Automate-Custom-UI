/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { selectDocument, selectDocumentValid, selectPageById } from './document.selectors';
import { IdpField } from '../../models/screen-models';
import { IdpFieldDataType, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('Document Selectors', () => {
    const defaultRejectReason: RejectReason = { id: '1', value: 'blurry image' };

    const initialDocState = {
        id: 'doc1',
        name: 'Document 1',
        class: { id: 'classA', name: 'Class A' },
        rejectReason: defaultRejectReason,
        selectedPageIds: ['page1'],
        loadState: 'Loaded' as const,
        pages: [
            { id: 'page1', name: 'Page 1', fileReference: 'file1', contentFileReferenceIndex: 0, sourcePageIndex: 0 },
            { id: 'page2', name: 'Page 2', fileReference: 'file2', contentFileReferenceIndex: 1, sourcePageIndex: 1 },
        ],
    };

    const allFields: IdpField[] = [
        {
            id: 'field1',
            name: 'First Name',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0.9,
            verificationStatus: 'AutoValid',
            value: '',
            hasIssue: false,
            isSelected: false,
        },
        {
            id: 'field2',
            name: 'Last Name',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0.5,
            verificationStatus: 'AutoInvalid',
            value: '',
            hasIssue: true,
            isSelected: false,
        },
    ];

    it('should select the document', () => {
        const result = selectDocument.projector(initialDocState, allFields);
        expect(result).toEqual({
            id: 'doc1',
            name: 'Document 1',
            class: { id: 'classA', name: 'Class A' },
            hasIssue: true,
            pages: [
                {
                    id: 'page1',
                    name: 'Page 1',
                    documentId: 'doc1',
                    fileReference: 'file1',
                    sourcePageIndex: 0,
                    rotation: undefined,
                    viewerRotation: undefined,
                    hasIssue: true,
                    isSelected: true,
                },
                {
                    id: 'page2',
                    name: 'Page 2',
                    documentId: 'doc1',
                    fileReference: 'file2',
                    sourcePageIndex: 1,
                    rotation: undefined,
                    viewerRotation: undefined,
                    hasIssue: true,
                    isSelected: false,
                },
            ],
            rejectReasonId: undefined,
            markAsRejected: undefined,
            rejectNote: undefined,
        });
    });

    it('should select document validity', () => {
        const document = selectDocument.projector(initialDocState, allFields);
        const result = selectDocumentValid.projector(document);
        expect(result).toBe(false);
    });

    it('should select page by id', () => {
        const document = selectDocument.projector(initialDocState, allFields);
        const result = selectPageById('page1').projector(document);
        expect(result).toEqual({
            id: 'page1',
            name: 'Page 1',
            documentId: 'doc1',
            fileReference: 'file1',
            sourcePageIndex: 0,
            rotation: undefined,
            viewerRotation: undefined,
            hasIssue: true,
            isSelected: true,
        });
    });
});
