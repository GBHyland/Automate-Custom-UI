/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { catchError, combineLatest, concat, concatMap, distinct, filter, finalize, map, of } from 'rxjs';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { DocumentEntity } from '../states/document.state';
import { DocumentFieldEntity } from '../states/document-field.state';
import {
    ApiDocPage,
    IdpBackendService,
    IdpFieldDataType,
    IdpVerificationStatus,
    UuidService,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { Store } from '@ngrx/store';
import { selectDocument } from '../selectors/document.selectors';
import { selectCorrelationId, selectTaskInputData } from '../selectors/screen.selectors';
import { ApiDocument, ApiTable, ApiTableRowCell, ApiTableRowRecord } from '../../models/contracts/field-verification-models';
import { cloneDeep } from 'es-toolkit/compat';
import { selectActiveField, selectDocumentFields } from '../selectors/document-field.selectors';
import { DocumentTableEntity } from '../states/document-table.state';
import { IdpDocumentPage } from '../../models/screen-models';
import { selectDocumentTables } from '../selectors/document-table.selectors';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';

@Injectable()
export class DocumentEffects {
    private readonly imageLoadingService = inject(IdpImageLoadingService);
    private readonly idpBackendService = inject(IdpBackendService);

    constructor(private readonly actions$: Actions, private readonly store: Store, private readonly uuidService: UuidService) {}

    loadDocumentEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadSuccess),
            map(({ taskData }) => {
                const taskDocument = taskData.batchState.documents[taskData.documentIndex];
                const documentClass = taskData?.classificationConfiguration?.documentClassDefinitions?.find(
                    (docClass) => docClass.id === taskDocument.classId
                );
                if (!documentClass) {
                    return systemActions.documentLoadError({ error: `Document class not found - ${taskDocument.classId}` });
                }

                const allFieldDefs =
                    taskData?.extractionConfiguration?.fieldDefinitionsByClass?.find((f) => f.documentClassId === documentClass.id)
                        ?.fieldDefinitions || [];

                const documentState: DocumentEntity = {
                    id: taskDocument.id,
                    name: taskDocument.name,
                    class: documentClass,
                    rejectReasonId: taskDocument.rejectReasonId,
                    markAsRejected: taskDocument.markAsRejected,
                    rejectNote: taskDocument.rejectNote,
                    pages: taskDocument.pages.map((taskPage) => {
                        const pageId = `${taskPage.contentFileReferenceIndex}_${taskPage.sourcePageIndex}`;
                        return {
                            id: pageId,
                            name: `Page ${pageId}`,
                            fileReference: taskData.batchState.contentFileReferences[taskPage.contentFileReferenceIndex].sys_id,
                            contentFileReferenceIndex: taskPage.contentFileReferenceIndex,
                            sourcePageIndex: taskPage.sourcePageIndex,
                            rotation: taskPage.rotation,
                        };
                    }),
                };

                const totalFieldDefs = allFieldDefs.length;
                const tables: DocumentTableEntity[] = [];
                const fields: DocumentFieldEntity[] = [];
                for (const [fieldIndex, fieldDef] of allFieldDefs.entries()) {
                    // Map tables - Add one placeholder entry for the table field and all cells as linked entries
                    if (fieldDef.dataType === IdpFieldDataType.Table) {
                        const docTable = taskDocument.tables?.find((t) => t.id === fieldDef.id);

                        const tableVerificationStatus =
                            docTable?.reviewStatus === 'ReviewNotRequired' ? IdpVerificationStatus.AutoValid : IdpVerificationStatus.AutoInvalid;
                        const tableExtractionConfidence = docTable?.extractionConfidence || 0;
                        const tableColumnNames = docTable?.columnHeaderNames || [];

                        const tableFieldMatrix: string[][] = [];
                        const tableFields: DocumentFieldEntity[] = [];
                        for (const [rowIndex, rowRecord] of docTable?.records?.entries() || []) {
                            const columnFields: DocumentFieldEntity[] = tableColumnNames.map((columnName) => {
                                const relatedRecord = rowRecord.records?.find((r) => r.recordName === columnName);
                                const columnCellId = this.uuidService.generate();
                                const tableCellField: DocumentFieldEntity = {
                                    id: columnCellId,
                                    name: columnName,
                                    dataType: relatedRecord?.type || IdpFieldDataType.Text,
                                    format: '',
                                    order: totalFieldDefs + fieldIndex,
                                    confidence: tableExtractionConfidence,
                                    verificationStatus: tableVerificationStatus,
                                    value: relatedRecord?.value ?? '',
                                    tableId: fieldDef.id,
                                    boundingBox: relatedRecord?.boundingBox,
                                };
                                return tableCellField;
                            });

                            tableFieldMatrix[rowIndex] = columnFields.map((columnCell) => columnCell.id);
                            tableFields.push(...columnFields);
                        }

                        const tableField: DocumentFieldEntity = {
                            id: fieldDef.id,
                            name: fieldDef.name,
                            dataType: IdpFieldDataType.Table,
                            format: '',
                            order: fieldIndex,
                            confidence: tableExtractionConfidence,
                            verificationStatus: tableVerificationStatus,
                        };

                        const tableEntity: DocumentTableEntity = {
                            id: fieldDef.id,
                            name: fieldDef.name,
                            columnHeaderNames: tableColumnNames,
                            rows: tableFieldMatrix,
                        };

                        tables.push(tableEntity);
                        fields.push(tableField, ...tableFields);
                        continue;
                    }

                    // Map other fields - non table fields
                    const docField = taskDocument.fields?.find((f) => f.id === fieldDef.id);
                    const relatedPageId =
                        docField?.boundingBox?.pageIndex === undefined ? '' : documentState.pages[docField.boundingBox.pageIndex]?.id;
                    const field: DocumentFieldEntity = {
                        id: fieldDef.id,
                        name: fieldDef.name,
                        dataType: fieldDef.dataType,
                        format: fieldDef.format,
                        order: fieldIndex,
                        value: docField?.value,
                        confidence: docField?.extractionConfidence || 0,
                        boundingBox: docField?.boundingBox
                            ? {
                                  ...docField.boundingBox,
                                  pageId: relatedPageId,
                              }
                            : undefined,
                        verificationStatus:
                            docField?.extractionReviewStatus === 'ReviewNotRequired'
                                ? IdpVerificationStatus.AutoValid
                                : IdpVerificationStatus.AutoInvalid,
                    };
                    fields.push(field);
                }

                return systemActions.documentLoad({
                    documentState,
                    fields: fields,
                    tables,
                });
            })
        )
    );

    selectInitialFieldEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.documentLoad),
            concatLatestFrom(() => this.store.select(selectDocumentFields)),
            map(([, allFields]) => {
                const fieldToSelect = allFields.find((f) => f.hasIssue) || allFields[0];
                return systemActions.movedToNextField({ id: fieldToSelect?.id });
            })
        )
    );

    preloadPagesEffect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(systemActions.documentLoad),
                concatLatestFrom(() => this.store.select(selectDocumentFields)),
                concatMap(([action, fields]) => {
                    // preload all pages, starting with pages associated with fields
                    return concat(
                        fields.filter((field) => field.hasIssue).map((field) => field.boundingBox?.pageId),
                        fields.map((field) => field.boundingBox?.pageId),
                        action.documentState.pages.map((page) => page.id)
                    ).pipe(
                        filter((pageId): pageId is string => pageId !== undefined),
                        distinct(),
                        concatMap((pageId) =>
                            combineLatest([this.imageLoadingService.getImageDataForPage$(pageId), this.imageLoadingService.getPageOcrData$(pageId)])
                        )
                    );
                })
            ),
        { dispatch: false }
    );

    moveNextFieldEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.selectNextField),
            concatLatestFrom(() => [this.store.select(selectActiveField), this.store.select(selectDocumentFields)]),
            map(([, selectedField, documentFields]) => {
                const currentIndex = documentFields.findIndex((field) => field.id === selectedField?.id || field.id === selectedField?.tableId);
                const nextField =
                    documentFields.find((field, index) => field.hasIssue && index > currentIndex) ?? // next field with issue
                    documentFields.find((field, index) => field.hasIssue && index < currentIndex) ?? // next field with issue, wrapped
                    documentFields.at((currentIndex + 1) % documentFields.length); // next field, possibly wrapped
                return systemActions.movedToNextField({ id: nextField?.id });
            })
        )
    );

    addTableRowEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.addTableRow),
            concatLatestFrom(() => [this.store.select(selectDocumentTables), this.store.select(selectDocumentFields)]),
            map(([{ tableId, rowIndex }, tables, fields]) => {
                const table = tables.find((t) => t.id === tableId);
                if (!table) {
                    return { type: '[Noop]' };
                }

                const tableColumnNames = table.columnHeaderNames || [];
                const fieldIndex = fields.findIndex((f) => f.id === tableId);
                // Generate DocumentFieldEntity objects for each cell
                const newCellFields: DocumentFieldEntity[] = tableColumnNames.map((columnName) => ({
                    id: this.uuidService.generate(),
                    name: columnName,
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    order: fieldIndex,
                    confidence: fields[fieldIndex]?.confidence || 1,
                    verificationStatus: fields[fieldIndex]?.verificationStatus || IdpVerificationStatus.ManualValid,
                    value: '',
                    tableId,
                    boundingBox: undefined,
                }));

                return userActions.addTableRowFields({
                    tableId,
                    rowIndex,
                    fields: newCellFields,
                });
            })
        )
    );

    clearTableRowEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.clearTableRow),
            concatLatestFrom(() => [this.store.select(selectDocumentTables)]),
            map(([{ tableId, rowIndex }, tables]) => {
                const table = tables.find((t) => t.id === tableId);
                const row = table?.rows?.[rowIndex];
                if (!row) {
                    return { type: '[Noop]' };
                }
                // Update the rowCells directly, clearing their values
                const clearedRowCells = row.rowCells.map((cell) => ({
                    ...cell,
                    order: rowIndex,
                    value: '',
                }));
                return userActions.clearTableRowFields({
                    tableId,
                    rowIndex,
                    fields: clearedRowCells,
                });
            })
        )
    );

    updateTableRowEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.updateTableRow),
            map(({ tableId, rowIndex, rowCells }) => {
                // Ensure each cell has the required 'order' property
                const documentFieldEntities = rowCells.map((cell) => ({
                    ...cell,
                    order: rowIndex,
                }));
                return userActions.updateTableRowFields({
                    tableId,
                    rowIndex,
                    fields: documentFieldEntities,
                });
            })
        )
    );

    clearTableColumnEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.clearTableColumn),
            concatLatestFrom(() => [this.store.select(selectDocumentTables)]),
            map(([{ tableId, columnIndex }, tables]) => {
                const table = tables.find((t) => t.id === tableId);
                if (!table) {
                    return { type: '[Noop]' };
                }
                // Get the field IDs for the column being cleared
                const clearedColumnCells = table.rows
                    .map((row, rowIndex) => {
                        const cell = row.rowCells[columnIndex];
                        return {
                            ...cell,
                            order: rowIndex,
                            value: '',
                        };
                    })
                    .filter((cell): cell is typeof cell => cell !== undefined);
                return userActions.clearTableColumnFields({
                    tableId,
                    columnIndex,
                    fields: clearedColumnCells,
                });
            })
        )
    );

    updateTableColumnEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.updateTableColumn),
            concatLatestFrom(() => [this.store.select(selectDocumentTables)]),
            map(([{ tableId, columnIndex, columnCells }, tables]) => {
                const table = tables.find((t) => t.id === tableId);
                if (!table) {
                    return { type: '[Noop]' };
                }
                // Map the column cells to DocumentFieldEntity format with proper row order
                const documentFieldEntities = columnCells.map((cell, rowIndex) => ({
                    ...cell,
                    order: rowIndex,
                }));

                return userActions.updateTableColumnFields({
                    tableId,
                    columnIndex,
                    fields: documentFieldEntities,
                });
            })
        )
    );

    insertTableRowEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.insertTableRow),
            concatLatestFrom(() => [this.store.select(selectDocumentTables)]),
            map(([{ tableId, rowIndex, rowCells }, tables]) => {
                const table = tables.find((t) => t.id === tableId);
                if (!table) {
                    return { type: '[Noop]' };
                }
                // Convert IdpField[] to DocumentFieldEntity[] with proper order
                const documentFieldEntities = rowCells.map((cell) => ({
                    ...cell,
                    order: rowIndex,
                }));

                return userActions.insertTableRowFields({
                    tableId,
                    rowIndex,
                    fields: documentFieldEntities,
                });
            })
        )
    );

    deleteTableRowEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.deleteTableRow),
            concatLatestFrom(() => [this.store.select(selectDocumentTables)]),
            map(([{ tableId, rowIndex }, tables]) => {
                const table = tables.find((t) => t.id === tableId);
                if (!table || rowIndex < 0 || rowIndex >= table.rows?.length) {
                    return { type: '[Noop]' };
                }
                // Get the field IDs for the row being deleted
                const fieldIds = table.rows[rowIndex].rowCells.map((cell) => cell.id);

                return userActions.deleteTableRowFields({
                    tableId,
                    rowIndex,
                    fieldIds,
                });
            })
        )
    );

    deleteTableEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.deleteTable),
            concatLatestFrom(() => [this.store.select(selectDocumentTables)]),
            map(([{ tableId }, tables]) => {
                const table = tables.find((t) => t.id === tableId);
                if (!table) {
                    return { type: '[Noop]' };
                }
                // Collect all field IDs from all rows in the table
                const fieldIds = table.rows.flatMap((row) => row.rowCells.map((cell) => cell.id));
                return userActions.deleteTableFields({ tableId, fieldIds });
            })
        )
    );

    taskDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdate),
            concatLatestFrom(() => {
                return [
                    this.store.select(selectDocument),
                    this.store.select(selectDocumentFields),
                    this.store.select(selectDocumentTables),
                    this.store.select(selectTaskInputData),
                ];
            }),
            map(([{ taskAction, openNextTask }, documentState, allFields, allTables, taskInputData]) => {
                if (!taskInputData) {
                    return systemActions.taskPrepareUpdateError({ taskAction, error: 'Task data not found' });
                }

                const taskDocument = taskInputData.batchState.documents[taskInputData.documentIndex];

                let anyFieldWithIssue = false;
                const isRejected = Boolean(documentState.rejectReasonId);

                const updatedDocument: ApiDocument = {
                    ...taskDocument,
                    pages: taskDocument.pages.map((page) => {
                        const id = `${page.contentFileReferenceIndex}_${page.sourcePageIndex}`;
                        const pageState = documentState.pages.find((p) => p.id === id);
                        return {
                            ...page,
                            rotation: ((pageState?.rotation ?? 0) + (pageState?.viewerRotation ?? 0)) % 360,
                        };
                    }),
                    fields: allFields
                        .filter((f) => f.dataType !== IdpFieldDataType.Table)
                        .map((f) => {
                            anyFieldWithIssue ||= f.hasIssue || false;
                            return {
                                id: f.id,
                                name: f.name,
                                value: f.value,
                                extractionConfidence: f.confidence,
                                extractionReviewStatus: f.hasIssue ? 'ReviewRequired' : 'ReviewNotRequired',
                                boundingBox: f.boundingBox
                                    ? {
                                          top: f.boundingBox.top,
                                          left: f.boundingBox.left,
                                          height: f.boundingBox.height,
                                          width: f.boundingBox.width,
                                          pageIndex:
                                              f.boundingBox.pageIndex ?? documentState.pages.findIndex((page) => page.id === f.boundingBox?.pageId),
                                      }
                                    : undefined,
                            };
                        }),
                    rejectReasonId: documentState.rejectReasonId,
                    markAsRejected: !!documentState.rejectReasonId,
                    rejectNote: documentState.rejectNote,
                    tables: allTables.map((table) => {
                        // Rebuild records based on table rows
                        let anyTableFieldManuallyVerified = false;
                        const tableRecords: ApiTableRowRecord[] = [];
                        for (const row of table.rows) {
                            const rowRecords: ApiTableRowCell[] = [];
                            for (const field of row.rowCells) {
                                if (field.verificationStatus === IdpVerificationStatus.ManualValid) {
                                    anyTableFieldManuallyVerified = true;
                                }
                                rowRecords.push({
                                    recordName: field.name,
                                    type: field.dataType,
                                    value: field.value,
                                    boundingBox: field.boundingBox,
                                });
                            }
                            tableRecords.push({ records: rowRecords });
                        }
                        const tableField = allFields.find((f) => f.id === table.id);
                        const tableReviewStatus =
                            tableField?.verificationStatus === IdpVerificationStatus.ManualValid ||
                            tableField?.verificationStatus === IdpVerificationStatus.AutoValid
                                ? 'ReviewNotRequired'
                                : 'ReviewRequired';

                        const tableFromTask: ApiTable = taskDocument.tables?.find((t) => t.id === table.id) || {
                            id: table.id,
                            name: table.name,
                            columnHeaderNames: table.columnHeaderNames,
                            columnHeaderBoundingBoxes: [],
                            tableBoundingBoxes: [],
                            pageIndexes: [],
                            extractionConfidence: 0,
                            reviewStatus: 'ReviewRequired',
                            records: [],
                        };
                        return {
                            ...tableFromTask,
                            reviewStatus: tableReviewStatus,
                            extractionConfidence: anyTableFieldManuallyVerified ? 1 : tableFromTask.extractionConfidence,
                            records: tableRecords,
                        };
                    }),
                };
                updatedDocument.extractionReviewStatus = anyFieldWithIssue ? 'ReviewRequired' : 'ReviewNotRequired';

                const updatedTaskData = cloneDeep(taskInputData);
                updatedTaskData.batchState.documents[taskInputData.documentIndex] = updatedDocument;
                updatedTaskData.batchState.hasRejectedDocuments ||= isRejected;

                // Re-evaluate batch state extraction status
                updatedTaskData.batchState.extractionStatus = updatedTaskData.batchState.documents.some(
                    (doc) => doc.extractionReviewStatus === 'ReviewRequired'
                )
                    ? 'ReviewRequired'
                    : 'Extracted';

                return systemActions.updateDocumentRotation({ taskAction, taskData: updatedTaskData, openNextTask });
            })
        )
    );

    updateRotationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.updateDocumentRotation),
            concatLatestFrom(() => this.store.select(selectCorrelationId)),
            concatLatestFrom(() => this.store.select(selectDocument)),
            concatMap(([[{ taskAction, taskData, openNextTask }, correlationId], document]) => {
                const isSaveOrComplete = taskAction === 'Save' || taskAction === 'Complete';
                const fileReferences = [...new Set(taskData.batchState.contentFileReferences.map((ref) => ref.sys_id))];
                if (fileReferences.length === 0 || !isSaveOrComplete) {
                    return of(systemActions.taskPrepareUpdateSuccess({ taskAction, taskData, openNextTask }));
                }

                const allPages = taskData.batchState.documents.find((doc: ApiDocument) => doc.id === document.id)?.pages ?? [];
                const pagesWithIndex = allPages.map((page: ApiDocPage) => ({
                    contentFileReferenceIndex: page.contentFileReferenceIndex,
                    pageIndex: page.sourcePageIndex,
                    rotation: (360 - (page.rotation ?? 0)) % 360,
                }));

                const pagesState = document.pages.map((page: IdpDocumentPage) => ({
                    pageId: page.id,
                    documentId: page.documentId,
                    viewerRotation: 0,
                }));

                if (pagesWithIndex.length === 0) {
                    this.store.dispatch(userActions.updatePagesRotation({ pages: pagesState, taskDataSynced: undefined }));
                    return of(systemActions.taskPrepareUpdateSuccess({ taskAction, taskData, openNextTask }));
                }

                return this.idpBackendService.updateRotationData$(correlationId, fileReferences, pagesWithIndex).pipe(
                    map(() => {
                        this.store.dispatch(userActions.updatePagesRotation({ pages: pagesState, taskDataSynced: undefined }));
                        return systemActions.taskPrepareUpdateSuccess({ taskAction, taskData, openNextTask });
                    }),
                    catchError(() => of(systemActions.taskPrepareUpdateError({ taskAction, error: 'Failed to update rotation data' }))),
                    finalize(() => this.imageLoadingService.cleanup())
                );
            })
        )
    );

    restoreTableEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.restoreTable),
            map(({ tableId, tableData, tableFields }) => {
                // Convert IdpTable to DocumentTableEntity
                const documentTableEntity: DocumentTableEntity = {
                    id: tableData.id,
                    name: tableData.name,
                    columnHeaderNames: tableData.columnHeaderNames,
                    rows: tableData.rows.map((row) => row.rowCells.map((cell) => cell.id)),
                };

                // Convert IdpField[] to DocumentFieldEntity[]
                const documentFieldEntities: DocumentFieldEntity[] = tableFields.map((field, index) => ({
                    ...field,
                    order: index, // Maintain field order
                }));

                return userActions.restoreTableFields({
                    tableId,
                    tableData: documentTableEntity,
                    fields: documentFieldEntities,
                });
            })
        )
    );

    rejectBatchEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.rejectReasonUpdate),
            map(() => userActions.taskComplete({}))
        )
    );
}
