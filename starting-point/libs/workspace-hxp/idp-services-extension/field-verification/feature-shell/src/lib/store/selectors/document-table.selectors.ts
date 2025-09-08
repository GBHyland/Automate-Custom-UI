/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpFieldDataType, IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { createSelector } from '@ngrx/store';
import { documentTableAdapter, DocumentTableEntity } from '../states/document-table.state';
import { documentTableFeatureSelector } from './field-verification-root.selectors';
import { activeTableWithFields, selectAllTableFieldsMap, selectTableFieldsByTableId } from './document-field.selectors';
import { IdpField, IdpTable } from '../../models/screen-models';

const selectAllTables = createSelector(
    documentTableFeatureSelector,
    documentTableAdapter.getSelectors(documentTableFeatureSelector).selectAll,
    (state, tables) => {
        if (state.loadState === IdpLoadState.NotInitialized) {
            return [];
        }
        return tables;
    }
);

export const selectTableById = (tableId: string) =>
    createSelector(selectAllTables, selectTableFieldsByTableId(tableId), (tables, tableFields) => {
        return getTableById(tableId, tables, tableFields);
    });

export const selectActiveTable = createSelector(selectAllTables, activeTableWithFields, (allTables, tableWithFields) => {
    if (!tableWithFields?.length) {
        return undefined;
    }
    const tableId = tableWithFields[0].id || '';
    return getTableById(tableId, allTables, tableWithFields.slice(1));
});

export const selectDocumentTables = createSelector(selectAllTables, selectAllTableFieldsMap, (tableEntities, tableFields) => {
    const tables: IdpTable[] = [];
    for (const tableEntity of tableEntities) {
        const tableModel = getTableById(tableEntity.id, tableEntities, tableFields[tableEntity.id] || []);
        if (tableModel) {
            tables.push(tableModel);
        }
    }

    return tables;
});

function getTableById(tableId: string, tables: DocumentTableEntity[], tableFields: IdpField[]): IdpTable | undefined {
    const tableEntity = tables.find((table) => table.id === tableId);
    if (!tableEntity) {
        return undefined;
    }

    const tableModel: IdpTable = {
        id: tableEntity.id,
        name: tableEntity.name,
        columnHeaderNames: tableEntity.columnHeaderNames,
        rows: tableEntity.rows.map((row) => {
            const rowCells: IdpField[] = row.map((cellId) => {
                return (
                    tableFields.find((field) => field.id === cellId) || {
                        id: cellId,
                        name: '',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        hasIssue: true,
                        verificationStatus: IdpVerificationStatus.AutoInvalid,
                        confidence: 0,
                        isSelected: false,
                        tableId: tableId,
                    }
                );
            });
            return { rowCells };
        }),
    };

    return tableModel;
}
