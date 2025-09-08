/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpDocument } from '../screen-models';
import { mockIdpConfigClasses } from './mocked-classes';

export function mockIdpDocuments(): IdpDocument[] {
    const classes = mockIdpConfigClasses();

    return [
        {
            id: 'd_cf1',
            name: 'Document 1',
            class: undefined,
            verificationStatus: IdpVerificationStatus.AutoInvalid,
            classificationConfidence: 0,
            pages: [
                {
                    id: 'cf1_0',
                    name: 'Page 1 of Document 1',
                    documentId: 'd_cf1',
                    fileReference: 'cf1',
                    sourcePageIndex: 0,
                    hasIssue: true,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
                {
                    id: 'cf1_1',
                    name: 'Page 2 of Document 1',
                    documentId: 'd_cf1',
                    fileReference: 'cf1',
                    sourcePageIndex: 1,
                    hasIssue: true,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
                {
                    id: 'cf1_2',
                    name: 'Page 3 of Document 1',
                    documentId: 'd_cf1',
                    fileReference: 'cf1',
                    sourcePageIndex: 2,
                    hasIssue: true,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
            ],
            hasIssue: true,
            isSelected: false,
            isExpanded: false,
            isPreviewed: false,
            isDragging: false,
            rejectedReasonId: undefined,
        },
        {
            id: 'd_cf2',
            name: 'Document 2',
            class: classes[2],
            verificationStatus: IdpVerificationStatus.AutoInvalid,
            classificationConfidence: 0.4,
            pages: [
                {
                    id: 'cf2_0',
                    name: 'Page 1 of Document 2',
                    documentId: 'd_cf2',
                    fileReference: 'cf2',
                    sourcePageIndex: 0,
                    hasIssue: true,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
                {
                    id: 'cf2_1',
                    name: 'Page 2 of Document 2',
                    documentId: 'd_cf2',
                    fileReference: 'cf2',
                    sourcePageIndex: 1,
                    hasIssue: true,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
            ],
            hasIssue: true,
            isSelected: false,
            isExpanded: false,
            isPreviewed: false,
            isDragging: false,
            rejectedReasonId: undefined,
        },
        {
            id: 'd_cf3',
            name: 'Document 3',
            class: classes[2],
            verificationStatus: IdpVerificationStatus.AutoValid,
            classificationConfidence: 0.9,
            pages: [
                {
                    id: 'cf3_0',
                    name: 'Page 1 of Document 3',
                    documentId: 'd_cf3',
                    fileReference: 'cf3',
                    sourcePageIndex: 0,
                    hasIssue: false,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
                {
                    id: 'cf3_1',
                    name: 'Page 2 of Document 3',
                    documentId: 'd_cf3',
                    fileReference: 'cf3',
                    sourcePageIndex: 1,
                    hasIssue: false,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
                {
                    id: 'cf3_2',
                    name: 'Page 3 of Document 3',
                    documentId: 'd_cf3',
                    fileReference: 'cf3',
                    sourcePageIndex: 2,
                    hasIssue: false,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
            ],
            hasIssue: false,
            isSelected: false,
            isExpanded: false,
            isPreviewed: false,
            isDragging: false,
            rejectedReasonId: undefined,
        },
        {
            id: 'd_cf4',
            name: 'Document 4',
            class: classes[3],
            verificationStatus: IdpVerificationStatus.AutoValid,
            classificationConfidence: 0.9,
            pages: [
                {
                    id: 'cf4_0',
                    name: 'Page 1 of Document 4',
                    documentId: 'd_cf4',
                    fileReference: 'cf4',
                    sourcePageIndex: 0,
                    hasIssue: false,
                    isSelected: false,
                    rotation: 0,
                    viewerRotation: 0,
                },
            ],
            hasIssue: false,
            isSelected: false,
            isExpanded: false,
            isPreviewed: false,
            isDragging: false,
            rejectedReasonId: undefined,
        },
    ];
}
