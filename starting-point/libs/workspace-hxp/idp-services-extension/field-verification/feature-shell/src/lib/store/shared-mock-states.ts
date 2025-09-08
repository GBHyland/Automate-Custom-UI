/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    IdpConfiguration,
    IdpFieldDataType,
    IdpLoadState,
    IdpVerificationStatus,
    TaskContext,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { ScreenState } from './states/screen.state';
import { DocumentState } from './states/document.state';
import { DocumentFieldState } from './states/document-field.state';
import { FieldVerificationRootState } from './states/root.state';
import { IdpTaskData } from '../models/screen-models';
import { FieldVerificationInput } from '../models/contracts/field-verification-models';
import { cloneDeep } from 'es-toolkit';
import { DocumentTableState } from './states/document-table.state';

export const taskContext: TaskContext = {
    appName: 'test-app',
    taskId: '12345',
    taskName: 'fieldVerificationTask',
    rootProcessInstanceId: 'root-pid',
    canClaimTask: false,
    canUnclaimTask: true,
};

export const idpConfiguration: IdpConfiguration = {
    classification: {
        classificationConfidenceThreshold: 0.8,
        documentClassDefinitions: [
            {
                id: '1',
                name: 'documentClass1',
                description: 'documentClassDescription',
            },
            {
                id: '2',
                name: 'documentClass2',
                description: 'has a table field',
            },
        ],
    },
    extraction: {
        fieldDefinitionsByClass: [
            {
                documentClassId: '1',
                fieldDefinitions: [
                    {
                        id: '1',
                        name: 'Field 1',
                        dataType: IdpFieldDataType.Text,
                        format: 'format',
                        description: 'description',
                    },
                ],
                fieldConfidenceThreshold: 0.8,
            },
            {
                documentClassId: '2',
                fieldDefinitions: [
                    {
                        id: '1',
                        name: 'Field 1',
                        dataType: IdpFieldDataType.Table,
                        format: 'format',
                        description: 'description',
                    },
                ],
                fieldConfidenceThreshold: 0.8,
            },
        ],
    },
};

const contentFileReferences = [{ sys_id: 'file1' }];
export const taskInputData: FieldVerificationInput = {
    contents: [{ sys_id: 'file1' }],
    batchState: {
        documents: [
            {
                id: '1',
                name: 'document',
                pages: [
                    {
                        contentFileReferenceIndex: 0,
                        sourcePageIndex: 0,
                    },
                ],
                classId: '1',
                extractionReviewStatus: 'ReviewRequired' as const,
                fields: [
                    {
                        id: '1',
                        name: 'Field 1',
                    },
                ],
                rejectReasonId: undefined,
                rejectNote: undefined,
                markAsRejected: false,
            },
        ],
        extractionStatus: 'Awaiting',
        contentFileReferences,
    },
    documentIndex: 0,
    rejectReasons: [
        {
            id: '1',
            value: 'Too blurry',
        },
        {
            id: '2',
            value: 'Blank Page',
        },
        {
            id: '3',
            value: 'I do not like this document.',
        },
    ],
};

export const taskData: IdpTaskData = {
    ...cloneDeep(taskInputData),
    batchState: {
        ...taskInputData.batchState,
        contentFileReferences,
    },
    classificationConfiguration: {
        ...idpConfiguration.classification,
    },
    extractionConfiguration: {
        ...idpConfiguration.extraction,
    },
    sys_task_assignee: 'testUser',
};

export const screenState: ScreenState = {
    status: IdpLoadState.Loaded,
    taskContext: taskContext,
    taskInputData: taskData,
    taskDataSynced: true,
};

export const documentState: DocumentState = {
    id: 'doc1',
    name: 'Document 1',
    class: { id: 'class1', name: 'Class 1' },
    selectedPageIds: ['1'],
    loadState: IdpLoadState.Loaded,
    pages: [
        {
            id: '1',
            name: 'Page 1',
            fileReference: 'file1',
            contentFileReferenceIndex: 0,
            sourcePageIndex: 0,
        },
        {
            id: '2',
            name: 'Page 2',
            fileReference: 'file1',
            contentFileReferenceIndex: 0,
            sourcePageIndex: 0,
        },
    ],
};

const documentFieldState: DocumentFieldState = {
    loadState: IdpLoadState.Loaded,
    selectedFieldId: '1',
    ids: ['1', '2'],
    entities: {
        '1': {
            order: 1,
            id: '1',
            name: 'Field 1',
            dataType: IdpFieldDataType.Text,
            format: '',
            verificationStatus: IdpVerificationStatus.AutoInvalid,
            confidence: 0.8,
            value: 'Value 1',
        },
        '2': {
            order: 2,
            id: '2',
            name: 'Field 2',
            dataType: IdpFieldDataType.Text,
            format: '',
            verificationStatus: IdpVerificationStatus.AutoValid,
            confidence: 0.8,
            value: 'Value 2',
        },
    },
};

const documentTableState: DocumentTableState = {
    loadState: IdpLoadState.Loaded,
    ids: ['1', '2'],
    entities: {
        '1': {
            id: '1',
            name: 'Table 1',
            columnHeaderNames: ['column 1', 'column 2'],
            rows: [],
        },
        '2': {
            id: '2',
            name: 'Table 2',
            columnHeaderNames: ['column A', 'column B'],
            rows: [],
        },
    },
};

export const fieldVerificationRootState: FieldVerificationRootState = {
    document: documentState,
    fields: documentFieldState,
    tables: documentTableState,
    screen: screenState,
};
