/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createSelector } from '@ngrx/store';
import { documentFieldAdapter } from '../states/document-field.state';
import { documentFieldFeatureSelector } from './field-verification-root.selectors';
import { IdpField } from '../../models/screen-models';
import { IdpLoadState, IdpVerificationStatus, IdpFieldDataType } from '@hxp/workspace-hxp/idp-services-extension/shared';

export const selectAllFields = createSelector(
    documentFieldFeatureSelector,
    documentFieldAdapter.getSelectors(documentFieldFeatureSelector).selectAll,
    (state, fields) => {
        if (state.loadState === IdpLoadState.NotInitialized) {
            return [];
        }
        return fields.map<IdpField>((field) => {
            const hasIssue =
                field.verificationStatus === IdpVerificationStatus.AutoInvalid || field.verificationStatus === IdpVerificationStatus.ManualInvalid;

            return {
                id: field.id,
                name: field.name,
                dataType: field.dataType,
                format: field.format,
                hasIssue,
                verificationStatus: field.verificationStatus,
                confidence: field.confidence,
                value: field.value,
                boundingBox: field.boundingBox,
                isSelected: field.id === state.selectedFieldId,
                tableId: field.tableId,
                needsKeyboardFocus: state.needsKeyboardFocus,
            };
        });
    }
);

export const selectDocumentFields = createSelector(selectAllFields, (fields) => fields.filter((field) => field.tableId === undefined));

export const selectFieldsWithIssue = createSelector(selectDocumentFields, (fields) => fields.filter((field) => field.hasIssue));

function findTableField(allFields: IdpField[], field: IdpField) {
    if (field.dataType === IdpFieldDataType.Table) {
        return field;
    }
    return field.tableId ? allFields.find((fd) => fd.id === field.tableId) : undefined;
}

export const selectFieldById = (fieldId: string) =>
    createSelector(selectAllFields, (fields) => {
        return fields.find((field) => field?.id === fieldId);
    });

export const selectActiveField = createSelector(selectAllFields, (fields) => {
    return fields.find((field) => field?.isSelected);
});

export const selectTableFieldsByTableId = (tableId: string) =>
    createSelector(selectAllFields, (fields) => {
        return fields.filter((field) => field.tableId === tableId);
    });

export const activeTableWithFields = createSelector(selectActiveField, selectAllFields, (activeField, allFields) => {
    const tableField = activeField && findTableField(allFields, activeField);
    return tableField && [tableField, ...allFields.filter((field) => field.tableId === tableField.id)];
});

export const selectAllTableFieldsMap = createSelector(selectAllFields, (fields) => {
    const tables = fields.filter((field) => field.dataType === IdpFieldDataType.Table);
    const tableFieldMap: Record<string, IdpField[]> = {};
    for (const table of tables) {
        const tableFields = fields.filter((field) => field.tableId === table.id);
        tableFieldMap[table.id] = tableFields;
    }
    return tableFieldMap;
});
