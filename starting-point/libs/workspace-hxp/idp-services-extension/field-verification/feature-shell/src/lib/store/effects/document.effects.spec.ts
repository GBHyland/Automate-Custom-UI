/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { EMPTY, Observable, of } from 'rxjs';
import { DocumentEffects } from './document.effects';
import { systemActions, userActions } from '../actions/field-verification.actions';
import { fieldVerificationRootState, taskContext, taskData, taskInputData } from '../shared-mock-states';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cold, hot } from 'jasmine-marbles';
import { IdpBackendService, IdpFieldDataType, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectDocument } from '../selectors/document.selectors';
import { selectCorrelationId, selectTaskInputData } from '../selectors/screen.selectors';
import { IdpDocument, IdpField, IdpTaskData } from '../../models/screen-models';
import { selectActiveField, selectDocumentFields, selectFieldsWithIssue } from '../selectors/document-field.selectors';
import { DocumentFieldEntity } from '../states/document-field.state';
import { DocumentEntity } from '../states/document.state';
import { DocumentTableEntity } from '../states/document-table.state';
import { documentFieldFeatureSelector, documentTableFeatureSelector } from '../selectors/field-verification-root.selectors';
import { selectDocumentTables } from '../selectors/document-table.selectors';
import { ApiTable } from '../../models/contracts/field-verification-models';
import { IdpImageLoadingService } from '../../services/image/idp-image-loading.service';

describe('DocumentEffects', () => {
    let actions$: Observable<any>;
    let effects: DocumentEffects;
    let store: MockStore;

    const documentState: DocumentEntity = {
        id: 'doc1',
        name: 'Document 1',
        class: {
            id: 'class1',
            name: 'Class 1',
        },
        pages: [
            {
                id: 'page1',
                name: 'Page 1',
                fileReference: 'fileRef1',
                contentFileReferenceIndex: 0,
                sourcePageIndex: 1,
            },
        ],
    };

    const taskDataFields: DocumentFieldEntity[] = [
        {
            order: 1,
            id: '1',
            name: 'Field 1',
            dataType: IdpFieldDataType.Text,
            format: '',
            value: 'test',
            confidence: 1,
            verificationStatus: 'AutoValid',
        },
    ];

    const fields: DocumentFieldEntity[] = [
        {
            order: 1,
            id: 'field1',
            name: 'Field 1',
            value: 'Value 1',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
        },
        {
            order: 2,
            id: 'field2',
            name: 'Field 2',
            value: 'Value 2',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
        },
        {
            order: 3,
            id: 'field3',
            name: 'Field 3',
            value: 'Value 3',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0,
            verificationStatus: 'AutoValid',
        },
    ];

    const tables: DocumentTableEntity[] = [
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

    const idpBackendSpy = jasmine.createSpyObj(
        'IdpBackendService',
        {
            updateRotationData$: {},
        },
        {}
    );

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                DocumentEffects,
                {
                    provide: IdpImageLoadingService,
                    useValue: {
                        getImageDataForPage$() {
                            return EMPTY;
                        },
                        getPageOcrData$() {
                            return EMPTY;
                        },
                        cleanup: () => {},
                    },
                },
                { provide: IdpBackendService, useValue: idpBackendSpy },
                provideMockActions(() => actions$),
                provideMockStore({
                    initialState: fieldVerificationRootState,
                    selectors: [
                        { selector: documentFieldFeatureSelector, value: fieldVerificationRootState.fields },
                        { selector: documentTableFeatureSelector, value: fieldVerificationRootState.tables },
                    ],
                }),
            ],
        });

        effects = TestBed.inject(DocumentEffects);
        store = TestBed.inject(MockStore);
    });

    afterEach(() => {
        store.resetSelectors();
        store.setState(fieldVerificationRootState);
    });

    it('should return documentLoad action with documentState and fields on screenLoadSuccess', () => {
        const action = systemActions.screenLoadSuccess({ taskContext: taskContext, taskData: taskData });
        actions$ = of(action);

        effects.loadDocumentEffect$.subscribe((result) => {
            const resultCorrect = 'documentState' in result && 'fields' in result;
            expect(resultCorrect).toBeTrue();
            const taskDocument = taskInputData.batchState.documents[taskInputData.documentIndex];
            if ('documentState' in result) {
                expect(result.documentState.id).toEqual(taskDocument.id);
                expect(result.documentState.class.id).toEqual(taskDocument.classId);
                expect(result.documentState.pages.length).toEqual(taskDocument.pages.length);
            }
            if ('fields' in result) {
                expect(result.fields.length).toEqual(taskDocument.fields?.length || 0);
            }
        });
    });

    it('should return documentLoadError action if document class is not found', () => {
        const testTaskData = {
            ...taskData,
            batchState: { ...taskData.batchState, documents: [{ ...taskData.batchState.documents[0], classId: 'class2' }] },
        };
        const action = systemActions.screenLoadSuccess({ taskContext, taskData: testTaskData });
        const outcome = systemActions.documentLoadError({ error: 'Document class not found - class2' });

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.loadDocumentEffect$).toBeObservable(expected);
    });

    it('should return taskPrepareUpdateSuccess action with updated taskData having review not required status on taskPrepareUpdate when no field has issue', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [
                {
                    id: '0_0',
                    name: 'Page 1',
                    fileReference: 'ref1',
                    sourcePageIndex: 0,
                    documentId: 'doc1',
                    hasIssue: false,
                    isSelected: false,
                    rotation: 90,
                    viewerRotation: 90,
                },
            ],
            hasIssue: false,
        };
        const expectedTaskData = {
            ...taskData,
            batchState: {
                ...taskData.batchState,
                documents: taskData.batchState.documents.map((d) =>
                    d.id === taskDocument.id
                        ? {
                              ...d,
                              extractionReviewStatus: 'ReviewNotRequired' as const,
                              pages: d.pages?.map((p) => ({
                                  ...p,
                                  rotation: 180,
                              })),
                              fields: d.fields?.map((f) => ({
                                  ...f,
                                  value: 'test',
                                  extractionConfidence: 1,
                                  boundingBox: undefined,
                                  extractionReviewStatus: 'ReviewNotRequired' as const,
                              })),
                              tables: [],
                          }
                        : d
                ),
                extractionStatus: 'Extracted' as const,
                hasRejectedDocuments: false,
            },
        };

        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete', openNextTask: false });
        const outcome = systemActions.updateDocumentRotation({ taskAction: 'Complete', taskData: expectedTaskData, openNextTask: false });

        // overwrite selectors that taskPrepareUpdate depends upon.
        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(selectDocumentFields, taskDataFields);
        store.overrideSelector(selectDocumentTables, []);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = of(action);
        effects.taskDataEffect$.subscribe((result) => {
            expect(result).toEqual(outcome);
        });
    });

    it('should return taskPrepareUpdateSuccess action with updated taskData having hasRejectedDocuments as true on taskPrepareUpdate when document is rejected', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [],
            hasIssue: false,
            markAsRejected: true,
            rejectReasonId: '1',
            rejectNote: 'test note',
        };
        const expectedTaskData = {
            ...taskData,
            batchState: {
                ...taskData.batchState,
                documents: taskData.batchState.documents.map((d) =>
                    d.id === taskDocument.id
                        ? {
                              ...d,
                              extractionReviewStatus: 'ReviewNotRequired' as const,
                              pages: d.pages?.map((p) => ({
                                  ...p,
                                  rotation: 0,
                              })),
                              fields: d.fields?.map((f) => ({
                                  ...f,
                                  value: 'test',
                                  extractionConfidence: 1,
                                  boundingBox: undefined,
                                  extractionReviewStatus: 'ReviewNotRequired' as const,
                              })),
                              tables: [],
                              markAsRejected: true,
                              rejectReasonId: '1',
                              rejectNote: 'test note',
                          }
                        : d
                ),
                extractionStatus: 'Extracted' as const,
                hasRejectedDocuments: true,
            },
        };

        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete', openNextTask: false });
        const outcome = systemActions.updateDocumentRotation({ taskAction: 'Complete', taskData: expectedTaskData, openNextTask: false });

        // overwrite selectors that taskPrepareUpdate depends upon.
        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(selectDocumentFields, taskDataFields);
        store.overrideSelector(selectDocumentTables, []);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = of(action);
        effects.taskDataEffect$.subscribe((result) => {
            expect(result).toEqual(outcome);
        });
    });

    it('should return taskPrepareUpdateSuccess action with updated taskData having review required status on taskPrepareUpdate when at least one field has issue', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [],
            hasIssue: false,
            rejectReasonId: taskDocument.rejectReasonId,
            rejectNote: taskDocument.rejectNote,
            markAsRejected: taskDocument.markAsRejected,
        };
        const expectedTaskData = {
            ...taskData,
            batchState: {
                ...taskData.batchState,
                documents: taskData.batchState.documents.map((d) =>
                    d.id === taskDocument.id
                        ? {
                              ...d,
                              extractionReviewStatus: 'ReviewRequired' as const,
                              pages: d.pages?.map((p) => ({
                                  ...p,
                                  rotation: 0,
                              })),
                              fields: d.fields?.map((f) => ({
                                  ...f,
                                  value: 'test',
                                  extractionConfidence: 1,
                                  boundingBox: undefined,
                                  extractionReviewStatus: 'ReviewRequired' as const,
                              })),
                              tables: [],
                          }
                        : d
                ),
                extractionStatus: 'ReviewRequired' as const,
                hasRejectedDocuments: false,
            },
        };

        // overwrite selectors that taskPrepareUpdate depends upon.
        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });
        const outcome = systemActions.updateDocumentRotation({ taskAction: 'Complete', taskData: expectedTaskData, openNextTask: undefined });

        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(
            selectDocumentFields,
            taskDataFields.map((field, index) => ({
                ...field,
                hasIssue: index === 0, // Mark the first field as having an issue
            }))
        );
        store.overrideSelector(selectDocumentTables, []);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = of(action);

        effects.taskDataEffect$.subscribe((result) => {
            expect(result).toEqual(outcome);
        });
    });

    it('should return taskPrepareUpdateError action with error message on taskPrepareUpdate when task data is not found', () => {
        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });
        const outcome = systemActions.taskPrepareUpdateError({ taskAction: 'Complete', error: 'Task data not found' });

        store.overrideSelector(selectDocument, {} as IdpDocument);
        // eslint-disable-next-line unicorn/no-useless-undefined
        store.overrideSelector(selectTaskInputData, undefined);

        actions$ = of(action);

        effects.taskDataEffect$.subscribe((result) => {
            expect(result).toEqual(outcome);
        });
    });

    it('should return movedToNextField action with the first field with an issue on documentLoad', (done) => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: true,
                isSelected: false,
            },
        ];

        store.overrideSelector(selectDocumentFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, [idpFields[0]]);
        const action = systemActions.documentLoad({ documentState, fields, tables });
        store.overrideSelector(selectDocumentFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, [idpFields[0]]);

        actions$ = new Observable((observer) => {
            observer.next(action);
            observer.complete();
        });

        effects.selectInitialFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field2' }));
            done();
        });
    });

    it('should return movedToNextField action with the first field with no fields with issues on documentLoad', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: false,
            },
        ];

        store.overrideSelector(selectDocumentFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, []);

        const action = systemActions.documentLoad({ documentState, fields, tables });
        store.overrideSelector(selectDocumentFields, idpFields);
        store.overrideSelector(selectFieldsWithIssue, []);

        actions$ = new Observable((observer) => {
            observer.next(action);
            observer.complete();
        });

        effects.selectInitialFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field1' }));
        });
    });

    it('should return movedToNextField action with the next field that has an issue on selectNextField', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: true,
                isSelected: true,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[2],
                hasIssue: true,
                isSelected: false,
            },
        ];

        store.overrideSelector(selectActiveField, idpFields[0]);
        store.overrideSelector(selectDocumentFields, idpFields);
        const action = userActions.selectNextField();

        actions$ = of(action);
        effects.moveNextFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field3' }));
        });
    });

    it('should return movedToNextField action with the first field in that has an issue after wraparound on selectNextField', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: true,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: false,
            },
            {
                ...fields[2],
                hasIssue: true,
                isSelected: true,
            },
        ];

        store.overrideSelector(selectActiveField, idpFields[2]);
        store.overrideSelector(selectDocumentFields, idpFields);
        const action = userActions.selectNextField();

        actions$ = of(action);
        effects.moveNextFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: 'field1' }));
        });
    });

    it('should move to next document field with issue on selectNextField even when a table field has issue', () => {
        const idpFields: IdpField[] = [
            {
                ...fields[0],
                hasIssue: true,
                isSelected: false,
            },
            {
                ...fields[1],
                hasIssue: false,
                isSelected: true,
            },
            {
                ...fields[2],
                hasIssue: true,
                isSelected: false,
            },
            {
                id: 'tableField1',
                tableId: 'table1',
                name: '',
                dataType: IdpFieldDataType.Table,
                format: '',
                confidence: 0,
                verificationStatus: 'AutoInvalid',
                hasIssue: true,
            },
        ];

        store.overrideSelector(selectActiveField, idpFields[1]);
        store.overrideSelector(selectDocumentFields, idpFields);
        const action = userActions.selectNextField();

        actions$ = of(action);
        effects.moveNextFieldEffect$.subscribe((result) => {
            expect(result).toEqual(systemActions.movedToNextField({ id: fields[2].id }));
        });
    });

    it('should complete the task when a reject reason is updated', () => {
        const reason: RejectReason = { id: '1', value: 'Image Blurry' };
        const rejectReasonAction = userActions.rejectReasonUpdate({ rejectReasonId: reason.id, rejectNote: 'too blurry' });
        const taskCompleteAction = userActions.taskComplete({});

        actions$ = new Observable((observer) => {
            observer.next(rejectReasonAction);
            observer.complete();
        });

        effects.rejectBatchEffect$.subscribe((result) => {
            expect(result).toEqual(taskCompleteAction);
        });
    });

    it('should maintain existing pageIndex in boundingBox when available', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [
                { id: 'page1', name: 'Page 1', fileReference: 'ref1', sourcePageIndex: 0, documentId: 'doc1', hasIssue: false, isSelected: false },
                { id: 'page2', name: 'Page 2', fileReference: 'ref2', sourcePageIndex: 1, documentId: 'doc1', hasIssue: false, isSelected: false },
            ],
            hasIssue: false,
        };

        const fieldsWithBoundingBox: DocumentFieldEntity[] = [
            {
                ...taskDataFields[0],
                boundingBox: {
                    top: 100,
                    left: 100,
                    height: 50,
                    width: 100,
                    pageIndex: 1,
                },
            },
        ];

        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(selectDocumentFields, fieldsWithBoundingBox);
        store.overrideSelector(selectDocumentTables, []);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = of(action);
        effects.taskDataEffect$.subscribe((result) => {
            if ('taskData' in result) {
                const updatedField = result.taskData.batchState.documents[0].fields?.[0];
                expect(updatedField?.boundingBox?.pageIndex).toBe(1);
            }
        });
    });

    it('should resolve pageIndex from pageId when pageIndex is not available', () => {
        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: IdpDocument = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [
                { id: 'page1', name: 'Page 1', fileReference: 'ref1', sourcePageIndex: 0, documentId: 'doc1', hasIssue: false, isSelected: false },
                { id: 'page2', name: 'Page 2', fileReference: 'ref2', sourcePageIndex: 1, documentId: 'doc1', hasIssue: false, isSelected: false },
            ],
            hasIssue: false,
        };

        const fieldsWithBoundingBox: DocumentFieldEntity[] = [
            {
                ...taskDataFields[0],
                boundingBox: {
                    top: 100,
                    left: 100,
                    height: 50,
                    width: 100,
                    pageId: 'page2',
                },
            },
        ];

        const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

        store.overrideSelector(selectDocument, testDocument);
        store.overrideSelector(selectDocumentFields, fieldsWithBoundingBox);
        store.overrideSelector(selectDocumentTables, []);
        store.overrideSelector(selectTaskInputData, taskData);

        actions$ = of(action);
        effects.taskDataEffect$.subscribe((result) => {
            if ('taskData' in result) {
                const updatedField = result.taskData.batchState.documents[0].fields?.[0];
                expect(updatedField?.boundingBox?.pageIndex).toBe(1);
            }
        });
    });

    it('should ensure fields values are never undefined for textual table cells', (done) => {
        const apiTable: ApiTable = {
            id: '1',
            name: 'Table 1',
            columnHeaderNames: ['Column 1'],
            pageIndexes: [0],
            extractionConfidence: 1,
            reviewStatus: 'ReviewNotRequired',
            columnHeaderBoundingBoxes: [],
            tableBoundingBoxes: [],
            records: [
                {
                    records: [
                        {
                            recordName: 'Column 1',
                            type: IdpFieldDataType.Text,
                            value: undefined, // This should be converted to an empty string
                        },
                    ],
                },
            ],
        };

        const testTaskData: IdpTaskData = {
            ...taskData,
            batchState: {
                ...taskData.batchState,
                documents: [{ ...taskData.batchState.documents[0], classId: '2', tables: [apiTable] }],
            },
        };

        actions$ = of(systemActions.screenLoadSuccess({ taskContext, taskData: testTaskData }));

        effects.loadDocumentEffect$.subscribe((result) => {
            if (!('fields' in result)) {
                done.fail(result.error);
                return;
            }
            const table = result.tables[0];
            const cellMatrix = table.rows.map((row) => row.map((columnCellId) => result.fields.find((field) => field.id === columnCellId)));
            expect(cellMatrix[0][0]?.value).withContext('Field value for table cell at row 1, column 1').toBe('');
            done();
        });
    });

    it('should preload page data in order', () => {
        const imageLoadingService = TestBed.inject(IdpImageLoadingService);
        const getImageDataSpy = spyOn(imageLoadingService, 'getImageDataForPage$').and.callThrough();
        const getOcrDataSpy = spyOn(imageLoadingService, 'getPageOcrData$').and.callThrough();

        const plainPages = [
            { id: 'page1', name: 'Page 1', fileReference: 'ref1', contentFileReferenceIndex: 0, sourcePageIndex: 0 },
            { id: 'page2', name: 'Page 2', fileReference: 'ref2', contentFileReferenceIndex: 0, sourcePageIndex: 0 },
        ];
        const pageWithField = { id: 'page3', name: 'Page 3', fileReference: 'ref3', contentFileReferenceIndex: 0, sourcePageIndex: 0 };
        const pageWithIssueField = { id: 'page4', name: 'Page 4', fileReference: 'ref4', contentFileReferenceIndex: 0, sourcePageIndex: 0 };

        const taskDocument = taskData.batchState.documents[taskData.documentIndex];
        const testDocument: DocumentEntity = {
            id: taskDocument.id,
            name: taskDocument.name,
            class: { id: taskDocument.classId, name: '' },
            pages: [...plainPages, pageWithField, pageWithIssueField],
        };

        const documentFields = [
            {
                ...fields[0],
                boundingBox: {
                    top: 100,
                    left: 100,
                    height: 50,
                    width: 100,
                    pageId: pageWithField.id,
                },
            },
            {
                ...fields[1],
                hasIssue: true,
                boundingBox: {
                    top: 100,
                    left: 100,
                    height: 50,
                    width: 100,
                    pageId: pageWithIssueField.id,
                },
            },
        ];

        store.overrideSelector(selectDocumentFields, documentFields);

        const action = systemActions.documentLoad({ documentState: testDocument, fields: documentFields, tables: [] });

        actions$ = of(action);
        effects.preloadPagesEffect$.subscribe({
            complete: () => {
                const expectedPageOrder = [pageWithIssueField, pageWithField, ...plainPages];
                expect(getImageDataSpy.calls.allArgs()).toEqual(expectedPageOrder.map((page) => [page.id]));
                expect(getOcrDataSpy.calls.allArgs()).toEqual(expectedPageOrder.map((page) => [page.id]));
            },
        });
    });

    it('should return addTableRowFields action with new cell fields on addTableRow', (done) => {
        const uuidService = TestBed.inject(DocumentEffects)['uuidService'];
        spyOn(uuidService, 'generate').and.returnValue('generated-uuid');

        const documentFields = [
            {
                ...fields[0],
                boundingBox: {
                    top: 100,
                    left: 100,
                    height: 50,
                    width: 100,
                    pageId: '1',
                },
            },
            {
                ...fields[1],
                hasIssue: true,
                boundingBox: {
                    top: 100,
                    left: 100,
                    height: 50,
                    width: 100,
                    pageId: '1',
                },
            },
        ];

        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);
        store.overrideSelector(selectDocumentFields, documentFields);

        const action = userActions.addTableRow({ tableId: 'table1', rowIndex: 0 });
        actions$ = of(action);

        effects.addTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.addTableRowFields.type);
            if ('tableId' in result && 'rowIndex' in result && 'fields' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.rowIndex).toBe(0);
                expect(result.fields.length).toBe(2);
                expect(result.fields[0].id).toBe('generated-uuid');
                expect(result.fields[0].name).toBe('Col1');
                expect(result.fields[1].name).toBe('Col2');
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table is not found on addTableRow', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        store.overrideSelector(selectDocumentFields, []);
        const action = userActions.addTableRow({ tableId: 'notfound', rowIndex: 0 });
        actions$ = of(action);

        effects.addTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return clearTableRowFields action with cleared row cells on clearTableRow', (done) => {
        const rowCells = [
            { id: 'cell1', name: 'Col1', value: 'A', order: 0 },
            { id: 'cell2', name: 'Col2', value: 'B', order: 0 },
        ];
        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [{ rowCells } as any],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);

        const action = userActions.clearTableRow({ tableId: 'table1', rowIndex: 0 } as any);
        actions$ = of(action);

        effects.clearTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.clearTableRowFields.type);
            if ('tableId' in result && 'rowIndex' in result && 'fields' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.rowIndex).toBe(0);
                expect(result.fields.length).toBe(2);
                expect(result.fields[0].value).toBe('');
                expect(result.fields[1].value).toBe('');
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table or row is not found on clearTableRow', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        const action = userActions.clearTableRow({ tableId: 'notfound', rowIndex: 0 });
        actions$ = of(action);

        effects.clearTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return updateTableRowFields action with updated row cells on updateTableRow', (done) => {
        const rowCells = [
            { id: 'cell1', name: 'Col1', value: 'A' },
            { id: 'cell2', name: 'Col2', value: 'B' },
        ];
        // Only include the properties needed for the test, and cast as any to avoid type errors
        const action = userActions.updateTableRow({ tableId: 'table1', rowIndex: 1, rowCells: rowCells } as any);
        actions$ = of(action);

        effects.updateTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.updateTableRowFields.type);
            expect(result.tableId).toBe('table1');
            expect(result.rowIndex).toBe(1);
            expect(result.fields[0].order).toBe(1);
            expect(result.fields[1].order).toBe(1);
            done();
        });
    });

    it('should return clearTableColumnFields action with cleared column cells on clearTableColumn', (done) => {
        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [
                    {
                        rowCells: [{ id: 'cell1', name: 'Col1', value: 'A' } as any, { id: 'cell2', name: 'Col2', value: 'B' } as any],
                    },
                    {
                        rowCells: [{ id: 'cell3', name: 'Col1', value: 'C' } as any, { id: 'cell4', name: 'Col2', value: 'D' } as any],
                    },
                ],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);

        const action = userActions.clearTableColumn({ tableId: 'table1', columnIndex: 0 });
        actions$ = of(action);

        effects.clearTableColumnEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.clearTableColumnFields.type);
            if ('tableId' in result && 'columnIndex' in result && 'fields' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.columnIndex).toBe(0);
                expect(result.fields.length).toBe(2);
                expect(result.fields[0].value).toBe('');
                expect(result.fields[1].value).toBe('');
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table is not found on clearTableColumn', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        const action = userActions.clearTableColumn({ tableId: 'notfound', columnIndex: 0 });
        actions$ = of(action);

        effects.clearTableColumnEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return updateTableColumnFields action with updated column cells on updateTableColumn', (done) => {
        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);

        const columnCells = [
            { id: 'cell1', name: 'Col1', value: 'A' },
            { id: 'cell3', name: 'Col1', value: 'C' },
        ];
        const action = userActions.updateTableColumn({ tableId: 'table1', columnIndex: 0, columnCells } as any);
        actions$ = of(action);

        effects.updateTableColumnEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.updateTableColumnFields.type);
            if ('tableId' in result && 'columnIndex' in result && 'fields' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.columnIndex).toBe(0);
                expect(result.fields[0].order).toBe(0);
                expect(result.fields[1].order).toBe(1);
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table is not found on updateTableColumn', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        const action = userActions.updateTableColumn({ tableId: 'notfound', columnIndex: 0, columnCells: [] });
        actions$ = of(action);

        effects.updateTableColumnEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return insertTableRowFields action with inserted row cells on insertTableRow', (done) => {
        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);

        const rowCells = [
            { id: 'cell1', name: 'Col1', value: 'A' },
            { id: 'cell2', name: 'Col2', value: 'B' },
        ];
        const action = userActions.insertTableRow({ tableId: 'table1', rowIndex: 1, rowCells } as any);
        actions$ = of(action);

        effects.insertTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.insertTableRowFields.type);
            if ('tableId' in result && 'rowIndex' in result && 'fields' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.rowIndex).toBe(1);
                expect(result.fields[0].order).toBe(1);
                expect(result.fields[1].order).toBe(1);
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table is not found on insertTableRow', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        const action = userActions.insertTableRow({ tableId: 'notfound', rowIndex: 0, rowCells: [] });
        actions$ = of(action);

        effects.insertTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return deleteTableRowFields action with fieldIds on deleteTableRow', (done) => {
        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [{ rowCells: [{ id: 'cell1' }, { id: 'cell2' }] } as any, { rowCells: [{ id: 'cell3' }, { id: 'cell4' }] } as any],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);

        const action = userActions.deleteTableRow({ tableId: 'table1', rowIndex: 1 });
        actions$ = of(action);

        effects.deleteTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.deleteTableRowFields.type);
            if ('tableId' in result && 'rowIndex' in result && 'fieldIds' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.rowIndex).toBe(1);
                expect(result.fieldIds).toEqual(['cell3', 'cell4']);
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table is not found or rowIndex is invalid on deleteTableRow', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        const action = userActions.deleteTableRow({ tableId: 'notfound', rowIndex: 0 });
        actions$ = of(action);

        effects.deleteTableRowEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return deleteTableFields action with all fieldIds on deleteTable', (done) => {
        const documentTables = [
            {
                id: 'table1',
                name: 'Table 1',
                columnHeaderNames: ['Col1', 'Col2'],
                rows: [{ rowCells: [{ id: 'cell1' }, { id: 'cell2' }] } as any, { rowCells: [{ id: 'cell3' }, { id: 'cell4' }] } as any],
            },
        ];
        store.overrideSelector(selectDocumentTables, documentTables);

        const action = userActions.deleteTable({ tableId: 'table1' });
        actions$ = of(action);

        effects.deleteTableEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.deleteTableFields.type);
            if ('tableId' in result && 'fieldIds' in result) {
                expect(result.tableId).toBe('table1');
                expect(result.fieldIds).toEqual(['cell1', 'cell2', 'cell3', 'cell4']);
            } else {
                fail('Result does not have expected properties: ' + JSON.stringify(result));
            }
            done();
        });
    });

    it('should return [Noop] action if table is not found on deleteTable', (done) => {
        store.overrideSelector(selectDocumentTables, []);
        const action = userActions.deleteTable({ tableId: 'notfound' });
        actions$ = of(action);

        effects.deleteTableEffect$.subscribe((result) => {
            expect(result.type).toBe('[Noop]');
            done();
        });
    });

    it('should return restoreTableFields action with converted table and fields on restoreTable', (done) => {
        const tableData = {
            id: 'table1',
            name: 'Table 1',
            columnHeaderNames: ['Col1', 'Col2'],
            rows: [{ rowCells: [{ id: 'cell1' }, { id: 'cell2' }] }, { rowCells: [{ id: 'cell3' }, { id: 'cell4' }] }],
        };
        const tableFields = [
            { id: 'cell1', name: 'Col1', value: 'A' },
            { id: 'cell2', name: 'Col2', value: 'B' },
            { id: 'cell3', name: 'Col1', value: 'C' },
            { id: 'cell4', name: 'Col2', value: 'D' },
        ];
        const action = userActions.restoreTable({ tableId: 'table1', tableData, tableFields } as any);
        actions$ = of(action);

        effects.restoreTableEffect$.subscribe((result) => {
            expect(result.type).toBe(userActions.restoreTableFields.type);
            expect(result.tableId).toBe('table1');
            expect(result.tableData.id).toBe('table1');
            expect(result.fields.length).toBe(4);
            expect(result.fields[0].order).toBe(0);
            expect(result.fields[1].order).toBe(1);
            done();
        });
    });

    describe('updateRotationEffect$', () => {
        it('should call updateRotationData$ and dispatch taskPrepareUpdateSuccess on Save/Complete', () => {
            const testTaskData: any = {
                batchState: {
                    contentFileReferences: [{ sys_id: 'cf1' }, { sys_id: 'cf2' }],
                    documents: [
                        {
                            id: 'd_cf1',
                            name: 'Document 1',
                            pages: [
                                { id: 'p1', contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 90 },
                                { id: 'p2', contentFileReferenceIndex: 0, sourcePageIndex: 1, rotation: 180 },
                            ],
                        },
                    ],
                },
            };

            const document: IdpDocument = {
                id: 'd_cf1',
                name: 'Document 1',
                pages: [
                    {
                        id: 'p1',
                        name: 'Page 1 of Document 1',
                        documentId: 'd_cf1',
                        sourcePageIndex: 0,
                        rotation: 90,
                        viewerRotation: 0,
                        fileReference: 'cf1',
                        hasIssue: false,
                        isSelected: false,
                    },
                    {
                        id: 'p2',
                        name: 'Page 2 of Document 1',
                        documentId: 'd_cf1',
                        sourcePageIndex: 1,
                        rotation: 180,
                        viewerRotation: 0,
                        fileReference: 'cf1',
                        hasIssue: false,
                        isSelected: false,
                    },
                ],
                class: {
                    id: 'class1',
                    name: 'Class 1',
                },
                hasIssue: false,
            };

            const idpImageService = TestBed.inject(IdpImageLoadingService);
            spyOn(idpImageService, 'cleanup').and.callThrough();

            const action = systemActions.updateDocumentRotation({
                taskAction: 'Save',
                taskData: testTaskData,
                openNextTask: false,
            });
            const correlationId = 'corr-id-1';
            const pagesWithIndex = [
                { contentFileReferenceIndex: 0, pageIndex: 0, rotation: 270 },
                { contentFileReferenceIndex: 0, pageIndex: 1, rotation: 180 },
            ];
            idpBackendSpy.updateRotationData$.and.returnValue(cold('(a|)', { a: undefined }));

            store.overrideSelector(selectCorrelationId, correlationId);
            store.overrideSelector(selectDocument, document);

            actions$ = hot('-a-', { a: action });
            const outcome = systemActions.taskPrepareUpdateSuccess({
                taskAction: 'Save',
                taskData: testTaskData,
                openNextTask: false,
            });

            const expected = cold('-b-', { b: outcome });

            expect(effects.updateRotationEffect$).toBeObservable(expected);
            expect(idpBackendSpy.updateRotationData$).toHaveBeenCalledWith(correlationId, ['cf1', 'cf2'], pagesWithIndex);
            expect(idpImageService.cleanup).toHaveBeenCalled();
        });

        it('should not call updateRotationData$ if fileReferences is empty', () => {
            const testTaskData: any = {
                batchState: {
                    contentFileReferences: [],
                    documents: [],
                },
            };
            const action = systemActions.updateDocumentRotation({
                taskAction: 'Save',
                taskData: testTaskData,
                openNextTask: false,
            });

            const document: IdpDocument = {
                id: 'd_cf1',
                name: 'Document 1',
                class: {
                    id: 'class1',
                    name: 'Class 1',
                },
                hasIssue: false,
                pages: [
                    {
                        id: 'p1',
                        name: 'Page 1 of Document 1',
                        documentId: 'd_cf1',
                        sourcePageIndex: 0,
                        rotation: 90,
                        viewerRotation: 0,
                        fileReference: 'cf1',
                        hasIssue: false,
                        isSelected: false,
                    },
                ],
            };

            store.overrideSelector(selectCorrelationId, 'corr-id-2');
            store.overrideSelector(selectDocument, document);

            actions$ = hot('-a-', { a: action });
            const outcome = systemActions.taskPrepareUpdateSuccess({
                taskAction: 'Save',
                taskData: testTaskData,
                openNextTask: false,
            });

            const expected = cold('-b-', { b: outcome });

            expect(effects.updateRotationEffect$).toBeObservable(expected);
        });

        it('should not call updateRotationData$ if taskAction is not Save/Complete', () => {
            const testTaskData: any = {
                batchState: {
                    contentFileReferences: [{ sys_id: 'cf1' }],
                    documents: [],
                },
            };
            const action = systemActions.updateDocumentRotation({
                taskAction: 'Claim',
                taskData: testTaskData,
                openNextTask: false,
            });

            const document: IdpDocument = {
                id: 'd_cf1',
                name: 'Document 1',
                class: {
                    id: 'class1',
                    name: 'Class 1',
                },
                hasIssue: false,
                pages: [
                    {
                        id: 'p1',
                        name: 'Page 1 of Document 1',
                        documentId: 'd_cf1',
                        sourcePageIndex: 0,
                        rotation: 90,
                        viewerRotation: 0,
                        fileReference: 'cf1',
                        hasIssue: false,
                        isSelected: false,
                    },
                ],
            };

            store.overrideSelector(selectCorrelationId, 'corr-id-3');
            store.overrideSelector(selectDocument, document);

            actions$ = hot('-a-', { a: action });
            const outcome = systemActions.taskPrepareUpdateSuccess({
                taskAction: 'Claim',
                taskData: testTaskData,
                openNextTask: false,
            });
            const expected = cold('-b-', { b: outcome });

            expect(effects.updateRotationEffect$).toBeObservable(expected);
        });

        it('should dispatch taskPrepareUpdateError on updateRotationData$ error', () => {
            const testTaskData: any = {
                batchState: {
                    contentFileReferences: [{ sys_id: 'cf1' }],
                    documents: [
                        {
                            id: 'd_cf1',
                            name: 'Document 1',
                            pages: [{ id: 'p1', contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 90 }],
                        },
                    ],
                },
            };
            const document: IdpDocument = {
                id: 'd_cf1',
                name: 'Document 1',
                class: {
                    id: 'class1',
                    name: 'Class 1',
                },
                hasIssue: false,
                pages: [
                    {
                        id: 'p1',
                        name: 'Page 1 of Document 1',
                        documentId: 'd_cf1',
                        sourcePageIndex: 0,
                        rotation: 90,
                        viewerRotation: 0,
                        fileReference: 'cf1',
                        hasIssue: false,
                        isSelected: false,
                    },
                ],
            };

            const idpImageService = TestBed.inject(IdpImageLoadingService);
            spyOn(idpImageService, 'cleanup').and.callThrough();

            const action = systemActions.updateDocumentRotation({
                taskAction: 'Save',
                taskData: testTaskData,
                openNextTask: false,
            });
            const correlationId = 'corr-id-4';
            idpBackendSpy.updateRotationData$.and.returnValue(cold('#', {}, new Error('fail')));

            store.overrideSelector(selectCorrelationId, correlationId);
            store.overrideSelector(selectDocument, document);

            actions$ = hot('-a-', { a: action });
            const expected = cold('-b-', {
                b: systemActions.taskPrepareUpdateError({
                    taskAction: 'Save',
                    error: 'Failed to update rotation data',
                }),
            });

            expect(effects.updateRotationEffect$).toBeObservable(expected);
            expect(idpImageService.cleanup).toHaveBeenCalled();
        });
    });
});
