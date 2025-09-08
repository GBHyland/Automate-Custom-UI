/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { documentFieldReducer } from './document-field.reducer';
import { documentFieldAdapter, initialDocumentFieldState } from '../states/document-field.state';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpFieldDataType, IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('documentFieldReducer', () => {
    it('should handle documentLoad action', () => {
        const fields = [
            {
                order: 1,
                id: '1',
                name: 'field1',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0.8,
                value: 'val1',
                verificationStatus: IdpVerificationStatus.ManualValid,
            },
            {
                order: 2,
                id: '2',
                name: 'field2',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0.9,
                value: 'val2',
                verificationStatus: IdpVerificationStatus.AutoInvalid,
            },
        ];

        const tables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Column 1', 'Column 2'],
                rows: [
                    ['Row 1 Column 1', 'Row 1 Column 2'],
                    ['Row 2 Column 1', 'Row 2 Column 2'],
                ],
            },
        ];

        const docEntity = {
            id: 'doc1',
            name: 'Document 1',
            class: { id: 'classA', name: 'Class A' },
            selectedPageIds: ['page1'],
            loadState: IdpLoadState.Loaded,
            pages: [
                { id: 'page1', name: 'Page 1', fileReference: 'file1', contentFileReferenceIndex: 0, sourcePageIndex: 0 },
                { id: 'page2', name: 'Page 2', fileReference: 'file2', contentFileReferenceIndex: 1, sourcePageIndex: 1 },
            ],
        };
        const action = systemActions.documentLoad({ documentState: docEntity, fields, tables });
        const state = documentFieldReducer(initialDocumentFieldState, action);

        expect(state.selectedFieldId).toBe('2');
        expect(state.loadState).toBe(IdpLoadState.Loaded);
        expect(state.entities['1']).toEqual(fields[0]);
        expect(state.entities['2']).toEqual(fields[1]);
    });

    it('should handle fieldSelect action', () => {
        const initialState = {
            ...initialDocumentFieldState,
            selectedFieldId: '1',
            needsKeyboardFocus: false,
        };
        const action = userActions.fieldSelect({ fieldId: '2', needsKeyboardFocus: true });
        const state = documentFieldReducer(initialState, action);

        expect(state.selectedFieldId).toBe('2');
        expect(state.needsKeyboardFocus).toBe(true);
    });

    it('should handle fieldValueUpdate action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'oldValue',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const boundingBox = { top: 0, left: 0, width: 100, height: 100, pageId: '2' };
        const action = userActions.fieldValueUpdate({ fieldId: '1', value: 'newValue', boundingBox, confidence: 0.8 });
        const state = documentFieldReducer(initialState, action);

        const updatedField = {
            order: 1,
            id: '1',
            name: 'field1',
            value: 'newValue',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0.8,
            boundingBox,
            verificationStatus: IdpVerificationStatus.ManualValid,
        };

        expect(state.entities['1']).toEqual(updatedField);
    });

    it('should handle movedToNextField action', () => {
        const initialState = {
            ...initialDocumentFieldState,
            selectedFieldId: '1',
            needsKeyboardFocus: false,
        };
        const action = systemActions.movedToNextField({ id: '2' });
        const state = documentFieldReducer(initialState, action);

        expect(state.selectedFieldId).toBe('2');
        expect(state.needsKeyboardFocus).toBe(true);
    });

    it('should handle verifyField action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'someValue',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const action = userActions.verifyField({ fieldId: '1' });
        const state = documentFieldReducer(initialState, action);

        expect(state.entities['1']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
    });

    it('should handle addTableRowFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'value1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            ],
            initialDocumentFieldState
        );

        const newFields = [
            {
                order: 2,
                id: '2',
                name: 'field2',
                value: 'value2',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0.9,
                verificationStatus: IdpVerificationStatus.AutoInvalid,
            },
            {
                order: 3,
                id: '3',
                name: 'field3',
                value: 'value3',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0.95,
                verificationStatus: IdpVerificationStatus.ManualValid,
            },
        ];

        const action = userActions.addTableRowFields({
            fields: newFields,
            tableId: '',
            rowIndex: 0,
        });
        const state = documentFieldReducer(initialState, action);

        expect(state.ids).toEqual(['1', '2', '3']);
        expect(state.entities['2']).toEqual(newFields[0]);
        expect(state.entities['3']).toEqual(newFields[1]);
    });

    it('should handle clearTableRowFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'oldValue1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
                {
                    order: 2,
                    id: '2',
                    name: 'field2',
                    value: 'oldValue2',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.9,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const fieldsToClear = [
            { id: '1', value: '' },
            { id: '2', value: '' },
        ];
        // Type assertion to allow partial field objects, since only id and value are needed for this action
        const action = userActions.clearTableRowFields({ fields: fieldsToClear as any, tableId: '', rowIndex: 0 });
        const state = documentFieldReducer(initialState, action);

        expect(state.entities['1']?.value).toBe('');
        expect(state.entities['2']?.value).toBe('');
        expect(state.entities['1']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
        expect(state.entities['2']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
    });

    it('should handle updateTableRowFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'oldValue1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
                {
                    order: 2,
                    id: '2',
                    name: 'field2',
                    value: 'oldValue2',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.9,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const updatedFields = [
            {
                id: '1',
                value: 'newValue1',
                verificationStatus: IdpVerificationStatus.ManualValid,
                confidence: 0.95,
                boundingBox: { top: 1, left: 2, width: 3, height: 4, pageId: 'p1' },
            },
            {
                id: '2',
                value: 'newValue2',
                verificationStatus: IdpVerificationStatus.ManualValid,
                confidence: 0.99,
                boundingBox: { top: 5, left: 6, width: 7, height: 8, pageId: 'p2' },
            },
        ];
        const action = userActions.updateTableRowFields({ fields: updatedFields as any, tableId: '', rowIndex: 0 });
        const state = documentFieldReducer(initialState, action);

        expect(state.entities['1']?.value).toBe('newValue1');
        expect(state.entities['1']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
        expect(state.entities['1']?.confidence).toBe(0.95);
        expect(state.entities['1']?.boundingBox).toEqual({ top: 1, left: 2, width: 3, height: 4, pageId: 'p1' });

        expect(state.entities['2']?.value).toBe('newValue2');
        expect(state.entities['2']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
        expect(state.entities['2']?.confidence).toBe(0.99);
        expect(state.entities['2']?.boundingBox).toEqual({ top: 5, left: 6, width: 7, height: 8, pageId: 'p2' });
    });

    it('should handle clearTableColumnFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'oldValue1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
                {
                    order: 2,
                    id: '2',
                    name: 'field2',
                    value: 'oldValue2',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.9,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const fieldsToClear = [
            { id: '1', value: '', verificationStatus: IdpVerificationStatus.AutoInvalid },
            { id: '2', value: '', verificationStatus: IdpVerificationStatus.AutoInvalid },
        ];
        const action = userActions.clearTableColumnFields({ fields: fieldsToClear as any, tableId: '', columnIndex: 0 });
        const state = documentFieldReducer(initialState, action);

        expect(state.entities['1']?.value).toBe('');
        expect(state.entities['2']?.value).toBe('');
        expect(state.entities['1']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
        expect(state.entities['2']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
    });

    it('should handle updateTableColumnFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'oldValue1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
                {
                    order: 2,
                    id: '2',
                    name: 'field2',
                    value: 'oldValue2',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.9,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );
        const updatedFields = [
            {
                id: '1',
                value: 'newValue1',
                verificationStatus: IdpVerificationStatus.ManualValid,
                confidence: 0.95,
                boundingBox: { top: 1, left: 2, width: 3, height: 4, pageId: 'p1' },
            },
            {
                id: '2',
                value: 'newValue2',
                verificationStatus: IdpVerificationStatus.ManualValid,
                confidence: 0.99,
                boundingBox: { top: 5, left: 6, width: 7, height: 8, pageId: 'p2' },
            },
        ];
        const action = userActions.updateTableColumnFields({ fields: updatedFields as any, tableId: '', columnIndex: 0 });
        const state = documentFieldReducer(initialState, action);

        expect(state.entities['1']?.value).toBe('newValue1');
        expect(state.entities['1']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
        expect(state.entities['1']?.confidence).toBe(0.95);
        expect(state.entities['1']?.boundingBox).toEqual({ top: 1, left: 2, width: 3, height: 4, pageId: 'p1' });

        expect(state.entities['2']?.value).toBe('newValue2');
        expect(state.entities['2']?.verificationStatus).toBe(IdpVerificationStatus.ManualValid);
        expect(state.entities['2']?.confidence).toBe(0.99);
        expect(state.entities['2']?.boundingBox).toEqual({ top: 5, left: 6, width: 7, height: 8, pageId: 'p2' });
    });

    it('should handle insertTableRowFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'value1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            ],
            initialDocumentFieldState
        );

        const newFields = [
            {
                order: 2,
                id: '2',
                name: 'field2',
                value: 'value2',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0.9,
                verificationStatus: IdpVerificationStatus.AutoInvalid,
            },
        ];

        const action = userActions.insertTableRowFields({
            fields: newFields,
            tableId: '',
            rowIndex: 1,
        });
        const state = documentFieldReducer(initialState, action);

        expect(state.ids).toEqual(['1', '2']);
        expect(state.entities['2']).toEqual(newFields[0]);
    });

    it('should handle deleteTableRowFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'value1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
                {
                    order: 2,
                    id: '2',
                    name: 'field2',
                    value: 'value2',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.9,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );

        const action = userActions.deleteTableRowFields({
            fieldIds: ['2'],
            tableId: '',
            rowIndex: 1,
        });
        const state = documentFieldReducer(initialState, action);

        expect(state.ids).toEqual(['1']);
        expect(state.entities['2']).toBeUndefined();
    });

    it('should handle deleteTableFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'value1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
                {
                    order: 2,
                    id: '2',
                    name: 'field2',
                    value: 'value2',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.9,
                    verificationStatus: IdpVerificationStatus.AutoInvalid,
                },
            ],
            initialDocumentFieldState
        );

        const action = userActions.deleteTableFields({
            fieldIds: ['1'],
            tableId: '',
        });
        const state = documentFieldReducer(initialState, action);

        expect(state.ids).toEqual(['2']);
        expect(state.entities['1']).toBeUndefined();
    });

    it('should handle restoreTableFields action', () => {
        const initialState = documentFieldAdapter.setAll(
            [
                {
                    order: 1,
                    id: '1',
                    name: 'field1',
                    value: 'value1',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    confidence: 0.8,
                    verificationStatus: IdpVerificationStatus.ManualValid,
                },
            ],
            initialDocumentFieldState
        );

        const restoredFields = [
            {
                order: 2,
                id: '2',
                name: 'field2',
                value: 'value2',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0.9,
                verificationStatus: IdpVerificationStatus.AutoInvalid,
            },
        ];

        const action = userActions.restoreTableFields({
            fields: restoredFields,
            tableId: '',
            tableData: { id: 'table1', name: 'Table 1', columnHeaderNames: ['Column 1', 'Column 2'] } as any,
        });
        const state = documentFieldReducer(initialState, action);

        expect(state.ids).toEqual(['1', '2']);
        expect(state.entities['2']).toEqual(restoredFields[0]);
    });
});
