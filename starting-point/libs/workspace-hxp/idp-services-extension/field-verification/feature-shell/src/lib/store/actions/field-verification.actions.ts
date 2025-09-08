/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { IdpTaskActions, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DocumentEntity } from '../states/document.state';
import { DocumentFieldEntity } from '../states/document-field.state';
import { DocumentTableEntity } from '../states/document-table.state';
import { IdpBoundingBox, IdpField, IdpTable, IdpTaskData } from '../../models/screen-models';

export interface IdpPagesMetadata {
    pageId: string;
    documentId: string;
    rotation?: number;
    viewerRotation?: number;
}

export const userActions = createActionGroup({
    source: 'Idp Field Verification - User',
    events: {
        // field actions
        fieldSelect: props<{ fieldId: string; needsKeyboardFocus?: boolean }>(),
        fieldValueUpdate: props<{ fieldId: string; value: string; boundingBox?: IdpBoundingBox; confidence: number }>(),
        verifyField: props<{ fieldId: string }>(),

        // table actions
        addTableRow: props<{ tableId: string; rowIndex: number }>(),
        addTableRowFields: props<{ tableId: string; rowIndex: number; fields: DocumentFieldEntity[] }>(),
        insertTableRow: props<{ tableId: string; rowIndex: number; rowCells: IdpField[] }>(),
        insertTableRowFields: props<{ tableId: string; rowIndex: number; fields: DocumentFieldEntity[] }>(),
        clearTableRow: props<{ tableId: string; rowIndex: number }>(),
        clearTableRowFields: props<{ tableId: string; rowIndex: number; fields: DocumentFieldEntity[] }>(),
        updateTableRow: props<{ tableId: string; rowIndex: number; rowCells: IdpField[] }>(),
        updateTableRowFields: props<{ tableId: string; rowIndex: number; fields: DocumentFieldEntity[] }>(),
        clearTableColumn: props<{ tableId: string; columnIndex: number }>(),
        clearTableColumnFields: props<{ tableId: string; columnIndex: number; fields: DocumentFieldEntity[] }>(),
        updateTableColumn: props<{ tableId: string; columnIndex: number; columnCells: IdpField[] }>(),
        updateTableColumnFields: props<{ tableId: string; columnIndex: number; fields: DocumentFieldEntity[] }>(),
        deleteTableRow: props<{ tableId: string; rowIndex: number }>(),
        deleteTableRowFields: props<{ tableId: string; rowIndex: number; fieldIds: string[] }>(),
        deleteTable: props<{ tableId: string }>(),
        deleteTableFields: props<{ tableId: string; fieldIds: string[] }>(),
        restoreTable: props<{ tableId: string; tableData: IdpTable; tableFields: IdpField[] }>(), // New action
        restoreTableFields: props<{ tableId: string; tableData: DocumentTableEntity; fields: DocumentFieldEntity[] }>(), // New action

        // document actions
        pageSelect: props<{ pageId: string }>(),
        rejectReasonUpdate: props<{ rejectReasonId: string; rejectNote?: string }>(),
        updatePagesRotation: props<{ pages: IdpPagesMetadata[]; taskDataSynced?: boolean }>(),
        selectNextField: emptyProps(),

        // task actions
        taskSave: emptyProps(),
        taskComplete: props<{ openNextTask?: boolean }>(),
        taskCancel: emptyProps(),
    },
});

export const systemActions = createActionGroup({
    source: 'Idp Field Verification - System',
    events: {
        // screen actions
        screenInitialize: props<{ taskContext: TaskContext }>(),
        screenInitializeError: props<{ error: Error | string }>(),
        screenLoad: props<{ taskContext: TaskContext }>(),
        screenLoadSuccess: props<{ taskContext: TaskContext; taskData: IdpTaskData }>(),
        screenLoadError: props<{ error: Error | string }>(),
        screenUnload: emptyProps(),

        // document actions
        documentLoad: props<{ documentState: DocumentEntity; fields: DocumentFieldEntity[]; tables: DocumentTableEntity[] }>(),
        documentLoadError: props<{ error: Error | string }>(),
        movedToNextField: props<{ id: string | undefined }>(),

        // table actions
        switchedTable: props<{ tableId: string | undefined }>(),

        // task actions
        taskActionSuccess: props<{ action: IdpTaskActions; openNextTask?: boolean }>(),
        taskActionError: props<{ error: Error | string; action?: IdpTaskActions }>(),
        taskPrepareUpdate: props<{ taskAction: IdpTaskActions; openNextTask?: boolean }>(),
        taskPrepareUpdateSuccess: props<{ taskAction: IdpTaskActions; taskData: IdpTaskData; openNextTask?: boolean }>(),
        taskPrepareUpdateError: props<{ taskAction: IdpTaskActions; error: Error | string }>(),

        updateDocumentRotation: props<{ taskAction: IdpTaskActions; taskData: IdpTaskData; openNextTask?: boolean }>(),

        // notification actions
        notificationShow: props<{ severity: 'info' | 'success' | 'error' | 'warn'; message: string; messageArgs?: Record<string, any> }>(),

        // task claim
        taskClaim: props<{ taskContext: TaskContext }>(),
        taskClaimSuccess: props<{ taskContext: TaskContext }>(),
        taskUnclaim: emptyProps(),
    },
});
