/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpFieldDataType, IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectTableById, selectDocumentTables, selectActiveTable } from './document-table.selectors';

describe('Document Table Selectors', () => {
    const mockState = {
        documentTable: {
            ids: ['table1', 'table2'],
            entities: {
                table1: { id: 'table1', name: 'Table 1', columnHeaderNames: [], rows: [] },
                table2: { id: 'table2', name: 'Table 2', columnHeaderNames: [], rows: [] },
            },
            loadState: IdpLoadState.Loaded,
        },
        documentField: {
            activeTableWithFields: [
                {
                    id: 'table1',
                    name: 'Field 1',
                    fields: [],
                    dataType: IdpFieldDataType.Table,
                    format: '',
                    verificationStatus: IdpVerificationStatus.AutoValid,
                    confidence: 1,
                },
            ],
            tableFieldsMap: {
                table1: [
                    {
                        id: 'field1',
                        name: 'Field 1',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        hasIssue: false,
                        verificationStatus: IdpVerificationStatus.AutoValid,
                        confidence: 1,
                        isSelected: false,
                        tableId: 'table1',
                    },
                ],
            },
        },
    };

    it('should select table by ID', () => {
        const tableId = 'table1';
        const result = selectTableById(tableId).projector(
            [
                { id: 'table1', name: 'Table 1', columnHeaderNames: [], rows: [] },
                { id: 'table2', name: 'Table 2', columnHeaderNames: [], rows: [] },
            ],
            mockState.documentField.tableFieldsMap[tableId]
        );
        expect(result).toEqual({
            id: 'table1',
            name: 'Table 1',
            columnHeaderNames: [],
            rows: [],
        });
    });

    it('should select the active table', () => {
        const result = selectActiveTable.projector(
            [
                { id: 'table1', name: 'Table 1', columnHeaderNames: [], rows: [] },
                { id: 'table2', name: 'Table 2', columnHeaderNames: [], rows: [] },
            ],
            mockState.documentField.activeTableWithFields
        );
        expect(result).toEqual({
            id: 'table1',
            name: 'Table 1',
            columnHeaderNames: [],
            rows: [],
        });
    });

    it('should select document tables', () => {
        const result = selectDocumentTables.projector(
            [
                { id: 'table1', name: 'Table 1', columnHeaderNames: [], rows: [] },
                { id: 'table2', name: 'Table 2', columnHeaderNames: [], rows: [] },
            ],
            mockState.documentField.tableFieldsMap
        );
        expect(result).toEqual([
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: [],
                rows: [],
            },
            {
                id: 'table2',
                name: 'Table 2',
                columnHeaderNames: [],
                rows: [],
            },
        ]);
    });
});
