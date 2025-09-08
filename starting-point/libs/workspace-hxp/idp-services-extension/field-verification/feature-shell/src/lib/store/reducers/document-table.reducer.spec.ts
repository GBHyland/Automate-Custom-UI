/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { documentTableReducer } from './document-table.reducer';
import { documentTableAdapter, initialDocumentTableState } from '../states/document-table.state';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpFieldDataType, IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { initialDocumentState } from '../states/document.state';

describe('documentTableReducer', () => {
    it('should set all tables and update loadState to Loaded on documentLoad action', () => {
        const tables = [
            { id: '1', name: 'Table 1', columnHeaderNames: [], rows: [] },
            { id: '2', name: 'Table 2', columnHeaderNames: [], rows: [] },
        ];

        const action = systemActions.documentLoad({
            documentState: initialDocumentState,
            fields: [],
            tables,
        });
        const state = documentTableReducer(initialDocumentTableState, action);

        const expectedState = {
            ...documentTableAdapter.setAll(tables, initialDocumentTableState),
            loadState: IdpLoadState.Loaded,
        };

        expect(state).toEqual(expectedState);
    });

    it('should add a new row of cell IDs when addTableRowFields is dispatched', () => {
        const tableId = 'table-1';
        const initialState = {
            ...initialDocumentTableState,
            entities: {
                [tableId]: {
                    id: tableId,
                    name: 'Test Table',
                    columnHeaderNames: ['A', 'B'],
                    rows: [['id-1', 'id-2']],
                },
            },
            ids: [tableId],
        };

        const newFields = [
            {
                id: 'id-3',
                name: 'Field 3',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 1,
                order: 1,
                verificationStatus: IdpVerificationStatus.AutoValid,
            },
            {
                id: 'id-4',
                name: 'Field 4',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 1,
                order: 2,
                verificationStatus: IdpVerificationStatus.AutoValid,
            },
        ];

        const action = userActions.addTableRowFields({
            tableId,
            rowIndex: 1,
            fields: newFields,
        });

        const newState = documentTableReducer(initialState, action);

        expect(newState.entities[tableId]?.rows).toEqual([
            ['id-1', 'id-2'],
            ['id-3', 'id-4'],
        ]);
    });

    it('should insert a new row of cell IDs at the specified index when insertTableRowFields is dispatched', () => {
        const tableId = 'table-1';
        const initialState = {
            ...initialDocumentTableState,
            entities: {
                [tableId]: {
                    id: tableId,
                    name: 'Test Table',
                    columnHeaderNames: ['A', 'B'],
                    rows: [['id-1', 'id-2']],
                },
            },
            ids: [tableId],
        };

        const newFields = [
            {
                id: 'id-3',
                name: 'Field 3',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 1,
                order: 1,
                verificationStatus: IdpVerificationStatus.AutoValid,
            },
            {
                id: 'id-4',
                name: 'Field 4',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 1,
                order: 2,
                verificationStatus: IdpVerificationStatus.AutoValid,
            },
        ];

        const action = userActions.insertTableRowFields({
            tableId,
            rowIndex: 0,
            fields: newFields,
        });

        const newState = documentTableReducer(initialState, action);

        expect(newState.entities[tableId]?.rows).toEqual([
            ['id-3', 'id-4'],
            ['id-1', 'id-2'],
        ]);
    });

    it('should not insert a row if table does not exist when insertTableRowFields is dispatched', () => {
        const action = userActions.insertTableRowFields({
            tableId: 'non-existent',
            rowIndex: 0,
            fields: [],
        });

        const newState = documentTableReducer(initialDocumentTableState, action);

        expect(newState).toBe(initialDocumentTableState);
    });

    it('should delete the row at the specified index when deleteTableRowFields is dispatched', () => {
        const tableId = 'table-1';
        const initialState = {
            ...initialDocumentTableState,
            entities: {
                [tableId]: {
                    id: tableId,
                    name: 'Test Table',
                    columnHeaderNames: ['A', 'B'],
                    rows: [
                        ['id-1', 'id-2'],
                        ['id-3', 'id-4'],
                    ],
                },
            },
            ids: [tableId],
        };

        const action = userActions.deleteTableRowFields({
            tableId,
            rowIndex: 0,
        } as any);

        const newState = documentTableReducer(initialState, action);

        expect(newState.entities[tableId]?.rows).toEqual([['id-3', 'id-4']]);
    });

    it('should not delete a row if table does not exist when deleteTableRowFields is dispatched', () => {
        const action = userActions.deleteTableRowFields({
            tableId: 'non-existent',
            rowIndex: 0,
        } as any);

        const newState = documentTableReducer(initialDocumentTableState, action);

        expect(newState).toBe(initialDocumentTableState);
    });

    it('should not delete a row if rowIndex is out of bounds when deleteTableRowFields is dispatched', () => {
        const tableId = 'table-1';
        const initialState = {
            ...initialDocumentTableState,
            entities: {
                [tableId]: {
                    id: tableId,
                    name: 'Test Table',
                    columnHeaderNames: ['A', 'B'],
                    rows: [['id-1', 'id-2']],
                },
            },
            ids: [tableId],
        };

        const action = userActions.deleteTableRowFields({
            tableId,
            rowIndex: 5,
        } as any);

        const newState = documentTableReducer(initialState, action);

        expect(newState).toBe(initialState);
    });

    it('should remove all rows when deleteTableFields is dispatched', () => {
        const tableId = 'table-1';
        const initialState = {
            ...initialDocumentTableState,
            entities: {
                [tableId]: {
                    id: tableId,
                    name: 'Test Table',
                    columnHeaderNames: ['A', 'B'],
                    rows: [
                        ['id-1', 'id-2'],
                        ['id-3', 'id-4'],
                    ],
                },
            },
            ids: [tableId],
        };

        const action = userActions.deleteTableFields({
            tableId,
        } as any);

        const newState = documentTableReducer(initialState, action);

        expect(newState.entities[tableId]?.rows).toEqual([]);
    });

    it('should not remove rows if table does not exist when deleteTableFields is dispatched', () => {
        const action = userActions.deleteTableFields({
            tableId: 'non-existent',
        } as any);

        const newState = documentTableReducer(initialDocumentTableState, action);

        expect(newState).toBe(initialDocumentTableState);
    });

    it('should upsert table data when restoreTableFields is dispatched', () => {
        const tableData = {
            id: 'table-1',
            name: 'Restored Table',
            columnHeaderNames: ['A', 'B'],
            rows: [['id-1', 'id-2']],
        };

        const action = userActions.restoreTableFields({
            tableData,
        } as any);

        const newState = documentTableReducer(initialDocumentTableState, action);

        expect(newState.entities['table-1']).toEqual(tableData);
    });
});
