/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { selectDocumentFields, selectFieldsWithIssue, selectActiveField, selectFieldById } from './document-field.selectors';

import { IdpFieldDataType, IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { documentFieldAdapter } from '../states/document-field.state';

describe('DocumentField Selectors', () => {
    const initialDocFieldState = {
        loadState: IdpLoadState.NotInitialized,
        selectedFieldId: '2',
        entities: {},
        ids: [],
    };

    const finalDocFieldState = {
        loadState: IdpLoadState.Loaded,
        selectedFieldId: '1',
        ids: ['1', '2', '3', '4'],
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
                value: undefined,
            },
            '3': {
                order: 3,
                id: '3',
                name: 'Field 3',
                dataType: IdpFieldDataType.Text,
                format: '',
                verificationStatus: IdpVerificationStatus.ManualInvalid,
                confidence: 0.8,
                value: 'Value 3',
            },
            '4': {
                order: 4,
                id: '4',
                name: 'Field 4',
                dataType: IdpFieldDataType.Text,
                format: '',
                verificationStatus: IdpVerificationStatus.AutoValid,
                confidence: 0.8,
                value: 'Value 4',
            },
        },
    };

    // Need for testing due to the fact that documentFieldAdapter.getSelectors().selectAll(finalDocFieldState) retrieves all fields
    // without applying the logic in selectAllFields. However, the selector does not export selectAllFields.
    const mockSelectAllFields = documentFieldAdapter
        .getSelectors()
        .selectAll(finalDocFieldState)
        .map((field) => ({
            ...field,
            hasIssue:
                field.verificationStatus === IdpVerificationStatus.AutoInvalid || field.verificationStatus === IdpVerificationStatus.ManualInvalid,
            isSelected: field.id === finalDocFieldState.selectedFieldId,
        }));

    it('should select all fields', () => {
        const result = selectDocumentFields.projector(documentFieldAdapter.getSelectors().selectAll(finalDocFieldState));
        expect(result.length).toBe(4);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('2');
        expect(result[2].id).toBe('3');
        expect(result[3].id).toBe('4');
    });

    it('should select fields with issues', () => {
        const result = selectFieldsWithIssue.projector(mockSelectAllFields);
        expect(result.length).toBe(2);
        expect(result[0].id).toBe('1');
        expect(result[1].id).toBe('3');
    });

    it('should select the active field', () => {
        const result = selectActiveField.projector(mockSelectAllFields);
        expect(result).toBeDefined();
        expect(result?.id).toBe('1');
    });

    it('should return empty array when state is not initialized', () => {
        const result = selectDocumentFields.projector(documentFieldAdapter.getSelectors().selectAll(initialDocFieldState));
        expect(result.length).toBe(0);
    });

    it('should select a field by ID', () => {
        const fieldId = '3';
        const result = selectFieldById(fieldId).projector(mockSelectAllFields);
        expect(result).toBeDefined();
        expect(result?.id).toBe(fieldId);
        expect(result?.name).toBe('Field 3');
    });

    it('should return undefined if field ID does not exist', () => {
        const fieldId = 'non-existent-id';
        const result = selectFieldById(fieldId).projector(mockSelectAllFields);
        expect(result).toBeUndefined();
    });
});
