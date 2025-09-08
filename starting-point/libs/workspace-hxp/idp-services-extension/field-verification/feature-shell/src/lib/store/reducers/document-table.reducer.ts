/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createReducer, on } from '@ngrx/store';
import { documentTableAdapter, initialDocumentTableState } from '../states/document-table.state';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { IdpLoadState } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const documentTableReducer = createReducer(
    initialDocumentTableState,

    on(systemActions.documentLoad, (state, { tables }) => {
        return {
            ...documentTableAdapter.setAll(tables, state),
            loadState: IdpLoadState.Loaded,
        };
    }),

    on(userActions.addTableRowFields, (state, { tableId, rowIndex, fields }) => {
        const table = state.entities[tableId];
        if (!table) {
            return state;
        }

        // Insert the new row of field IDs into the rows property
        const newRows = table.rows ? [...table.rows] : [];
        newRows.splice(
            rowIndex,
            0,
            fields.map((f) => f.id)
        );

        return documentTableAdapter.updateOne(
            {
                id: tableId,
                changes: {
                    rows: newRows,
                },
            },
            state
        );
    }),

    on(userActions.insertTableRowFields, (state, { tableId, rowIndex, fields }) => {
        const table = state.entities[tableId];
        if (!table) {
            return state;
        }

        // Insert the row of field IDs into the rows property at the specified index
        const newRows = table.rows ? [...table.rows] : [];
        newRows.splice(
            rowIndex,
            0,
            fields.map((f) => f.id)
        );

        return documentTableAdapter.updateOne(
            {
                id: tableId,
                changes: {
                    rows: newRows,
                },
            },
            state
        );
    }),

    on(userActions.deleteTableRowFields, (state, { tableId, rowIndex }) => {
        const table = state.entities[tableId];
        if (!table?.rows || rowIndex < 0 || rowIndex >= table.rows.length) {
            return state;
        }

        // Remove the row at the specified index
        const newRows = [...table.rows];
        newRows.splice(rowIndex, 1);

        return documentTableAdapter.updateOne(
            {
                id: tableId,
                changes: {
                    rows: newRows,
                },
            },
            state
        );
    }),

    on(userActions.deleteTableFields, (state, { tableId }) => {
        const table = state.entities[tableId];
        if (!table) {
            return state;
        }
        // Remove all rows when deleting entire table
        const newRows: string[][] = [];

        return documentTableAdapter.updateOne(
            {
                id: tableId,
                changes: {
                    rows: newRows,
                },
            },
            state
        );
    }),

    on(userActions.restoreTableFields, (state, { tableData }) => {
        return documentTableAdapter.upsertOne(tableData, state);
    })
);
