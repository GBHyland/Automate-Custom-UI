/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { IdpVerificationService, findOcrMatches } from './verification.service';
import { IdpDocument, IdpField, IdpBoundingBox, IdpTable } from '../../models/screen-models';
import { DestroyRef } from '@angular/core';
import { of } from 'rxjs';
import { fieldVerificationRootState } from '../../store/shared-mock-states';
import { selectDocument } from '../../store/selectors/document.selectors';
import { IdpPagesMetadata, userActions } from '../../store/actions/field-verification.actions';
import { IdpFieldDataType, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectTableById } from '../../store/selectors/document-table.selectors';
import { documentFieldFeatureSelector, documentTableFeatureSelector } from '../../store/selectors/field-verification-root.selectors';
import { selectFieldById } from '../../store/selectors/document-field.selectors';

describe('IdpVerificationService', () => {
    let service: IdpVerificationService;
    let store: MockStore;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                IdpVerificationService,
                provideMockStore({
                    initialState: fieldVerificationRootState,
                    selectors: [
                        { selector: documentFieldFeatureSelector, value: fieldVerificationRootState.fields },
                        { selector: documentTableFeatureSelector, value: fieldVerificationRootState.tables },
                    ],
                }),
                { provide: DestroyRef, useValue: { onDestroy: () => of() } },
            ],
        });

        service = TestBed.inject(IdpVerificationService);
        store = TestBed.inject(MockStore);
    });

    it('should select document from store', () => {
        const document: IdpDocument = {
            id: '1',
            name: 'Test Document',
            class: { id: '1', name: 'Test Class' },
            pages: [],
            hasIssue: false,
        };
        store.overrideSelector(selectDocument, document);

        service.document$.subscribe((doc) => {
            expect(doc).toEqual(document);
        });
    });

    it('should dispatch rejectReasonUpdate action', () => {
        const reason: RejectReason = { id: '1', value: 'Test Reason' };
        const note = 'Rejected!';
        const dispatchSpy = spyOn(store, 'dispatch');

        service.updateRejectReason(reason.id, note);

        expect(dispatchSpy).toHaveBeenCalledWith(userActions.rejectReasonUpdate({ rejectReasonId: reason.id, rejectNote: note }));
    });

    it('should dispatch fieldValueUpdate action', () => {
        const field: IdpField = {
            id: '1',
            value: 'Test Value',
            dataType: IdpFieldDataType.Text,
            format: '',
            confidence: 0.95,
            verificationStatus: 'AutoValid',
            isSelected: false,
            hasIssue: false,
            name: '',
        };
        const boundingBox: IdpBoundingBox = { left: 0, top: 0, width: 100, height: 100, pageId: 'page1' };
        const dispatchSpy = spyOn(store, 'dispatch');

        service.updateField(field, boundingBox);

        expect(dispatchSpy).toHaveBeenCalledWith(
            userActions.fieldValueUpdate({
                fieldId: field.id,
                value: field.value ?? '',
                boundingBox,
                confidence: field.confidence,
            })
        );
    });

    it('should dispatch selectNextField action', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        service.selectNextField();
        expect(dispatchSpy).toHaveBeenCalledWith(userActions.selectNextField());
    });

    it('should dispatch updatePagesRotation action', () => {
        const pagesMetadata: IdpPagesMetadata[] = [
            { pageId: '1', documentId: 'doc1', rotation: 90 },
            { pageId: '2', documentId: 'doc2', rotation: 180 },
        ];
        const dispatchSpy = spyOn(store, 'dispatch');

        service.updatePagesRotation(pagesMetadata, false);

        expect(dispatchSpy).toHaveBeenCalledWith(userActions.updatePagesRotation({ pages: pagesMetadata, taskDataSynced: false }));
    });

    it('should select table by ID from store', () => {
        const tableId = '1';
        const table: IdpTable = {
            id: tableId,
            name: 'Table 1',
            columnHeaderNames: ['column 1', 'column 2'],
            rows: [],
        };

        store.overrideSelector(selectTableById(tableId), table);

        service.getTableById$(tableId).subscribe((result) => {
            expect(result).toEqual(table);
        });
    });

    for (const needsKeyboardFocus of [true, false]) {
        it(`should dispatch fieldSelect action with string ID when needsKeyboardFocus=${needsKeyboardFocus}`, () => {
            const fieldId = '123';
            const dispatchSpy = spyOn(store, 'dispatch');

            service.selectField(fieldId, needsKeyboardFocus);

            expect(dispatchSpy).toHaveBeenCalledWith(userActions.fieldSelect({ fieldId, needsKeyboardFocus }));
        });

        it(`should dispatch fieldSelect action with field object when needsKeyboardFocus=${needsKeyboardFocus}`, () => {
            const field: IdpField = {
                id: '123',
                value: 'Test Value',
                dataType: IdpFieldDataType.Text,
                format: '',
                confidence: 0,
                verificationStatus: 'AutoValid',
                isSelected: false,
                hasIssue: false,
                name: '',
            };
            const dispatchSpy = spyOn(store, 'dispatch');

            service.selectField(field, needsKeyboardFocus);

            expect(dispatchSpy).toHaveBeenCalledWith(userActions.fieldSelect({ fieldId: field.id, needsKeyboardFocus }));
        });
    }

    describe('findOcrMatches', () => {
        interface TestOcrWord {
            text: string;
            pageId: string;
        }

        describe('Full match functionality', () => {
            it('should match exact phrases when matchFullPhrase is true', () => {
                const testWords: TestOcrWord[] = [
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                ];

                const matches = [...findOcrMatches(testWords, 'hello wonderful', false, true)];
                expect(matches.length).toBe(1);
                expect(matches[0]).toEqual([
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                ]);
            });

            it('should not match partial phrases with matchFullPhrase is true', () => {
                const ocrWords = [
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                    { text: 'world', pageId: '1' },
                ];

                const noPartialMatch = [...findOcrMatches(ocrWords, 'hello won', false, true)];
                expect(noPartialMatch.length).toBe(0);
            });

            it('should respect case sensitivity with matchFullPhrase is true', () => {
                const ocrWords = [
                    { text: 'Hello', pageId: '1' },
                    { text: 'World', pageId: '1' },
                ];

                const exactMatches = [...findOcrMatches(ocrWords, 'Hello World', true, true)];
                expect(exactMatches.length).toBe(1);

                const noExactMatch = [...findOcrMatches(ocrWords, 'hello world', true, true)];
                expect(noExactMatch.length).toBe(0);
            });

            it('should only match words from same page in full match mode', () => {
                const ocrWords = [
                    { text: 'hello', pageId: '1' },
                    { text: 'world', pageId: '2' },
                ];

                const matches = [...findOcrMatches(ocrWords, 'hello world', false, true)];
                expect(matches.length).toBe(0);
            });
        });

        describe('Partial match functionality', () => {
            it('should match complete words when matchFullPhrase is false', () => {
                const ocrWords = [
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                    { text: 'world', pageId: '1' },
                ];

                const matches = [...findOcrMatches(ocrWords, 'hello wonderful', false, false)];
                expect(matches.length).toBe(1);
                expect(matches[0]).toEqual([
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                ]);
            });

            it('should match word prefixes when matchFullPhrase is false', () => {
                const ocrWords = [
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                    { text: 'world', pageId: '1' },
                ];

                const prefixMatches = [...findOcrMatches(ocrWords, 'hello won', false, false)];
                expect(prefixMatches.length).toBe(1);
                expect(prefixMatches[0]).toEqual([
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '1' },
                ]);
            });

            it('should respect case sensitivity with matchFullPhrase is false', () => {
                const ocrWords = [
                    { text: 'Hello', pageId: '1' },
                    { text: 'World', pageId: '1' },
                ];

                const matches = [...findOcrMatches(ocrWords, 'Hello Wo', true, false)];
                expect(matches.length).toBe(1);

                const noMatches = [...findOcrMatches(ocrWords, 'hello wo', true, false)];
                expect(noMatches.length).toBe(0);
            });

            it('should only match words from same page in partial match mode', () => {
                const ocrWords = [
                    { text: 'hello', pageId: '1' },
                    { text: 'wonderful', pageId: '2' },
                ];

                const matches = [...findOcrMatches(ocrWords, 'hello won', false, false)];
                expect(matches.length).toBe(0);
            });
        });

        describe('Common functionality', () => {
            it('should return empty array for empty input', () => {
                const matches = [...findOcrMatches([], 'test', false, true)];
                expect(matches.length).toBe(0);
            });

            it('should return empty array for empty search string', () => {
                const ocrWords = [{ text: 'test', pageId: '1' }];
                const matches = [...findOcrMatches(ocrWords, '', false, true)];
                expect(matches.length).toBe(0);
            });
        });

        describe('Edge cases and special behaviors', () => {
            it('should match multiple occurrences in the same page', () => {
                const ocrWords = [
                    { text: 'hello', pageId: '1' },
                    { text: 'world', pageId: '1' },
                    { text: 'hello', pageId: '1' },
                    { text: 'world', pageId: '1' },
                ];

                const result = [...findOcrMatches(ocrWords, 'hello world', false, true)];
                expect(result.length).toBe(2);
                expect(result[0]).toEqual([
                    { text: 'hello', pageId: '1' },
                    { text: 'world', pageId: '1' },
                ]);
                expect(result[1]).toEqual([
                    { text: 'hello', pageId: '1' },
                    { text: 'world', pageId: '1' },
                ]);
            });

            it('should handle mixed case matching properly', () => {
                const ocrWords = [
                    { text: 'Hello', pageId: '1' },
                    { text: 'WORLD', pageId: '1' },
                    { text: 'hello', pageId: '1' },
                    { text: 'World', pageId: '1' },
                ];

                const caseSensitiveResult = [...findOcrMatches(ocrWords, 'Hello WORLD', true, true)];
                expect(caseSensitiveResult.length).toBe(1);
                expect(caseSensitiveResult[0]).toEqual([
                    { text: 'Hello', pageId: '1' },
                    { text: 'WORLD', pageId: '1' },
                ]);

                const caseInsensitiveResult = [...findOcrMatches(ocrWords, 'hello world', false, true)];
                expect(caseInsensitiveResult.length).toBe(2);
            });

            it('should handle diacritics and special characters with case sensitivity', () => {
                const ocrWords = [
                    { text: 'résumé', pageId: '1' },
                    { text: 'RÉSUMÉ', pageId: '1' },
                ];

                const caseSensitiveResult = [...findOcrMatches(ocrWords, 'résumé', true, true)];
                expect(caseSensitiveResult.length).toBe(1);
                expect(caseSensitiveResult[0]).toEqual([{ text: 'résumé', pageId: '1' }]);

                const caseInsensitiveResult = [...findOcrMatches(ocrWords, 'résumé', false, true)];
                expect(caseInsensitiveResult.length).toBe(2);
            });

            it('should select field by ID from store', () => {
                const fieldId = '1';
                const field: IdpField = {
                    id: fieldId,
                    value: 'Value 1',
                    confidence: 0.8,
                    verificationStatus: 'AutoInvalid',
                    dataType: IdpFieldDataType.Text,
                    format: '',
                    isSelected: true,
                    hasIssue: true,
                    name: 'Field 1',
                    boundingBox: undefined,
                    needsKeyboardFocus: undefined,
                    tableId: undefined,
                };

                store.overrideSelector(selectFieldById(fieldId), field);

                service.getFieldById$(fieldId).subscribe((result) => {
                    expect(result).toEqual(field);
                });
            });

            it('should dispatch verifyField action with the correct fieldId', () => {
                const fieldId = 'test-field-id';
                const dispatchSpy = spyOn(store, 'dispatch');

                service.verifyField(fieldId);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.verifyField({ fieldId }));
            });

            it('should dispatch addTableRow action with default rowIndex', () => {
                const tableId = 'table-123';
                const dispatchSpy = spyOn(store, 'dispatch');

                service.addTableRow(tableId);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.addTableRow({ tableId, rowIndex: 0 }));
            });

            it('should dispatch addTableRow action with specified rowIndex', () => {
                const tableId = 'table-456';
                const rowIndex = 2;
                const dispatchSpy = spyOn(store, 'dispatch');

                service.addTableRow(tableId, rowIndex);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.addTableRow({ tableId, rowIndex }));
            });

            it('should dispatch insertTableRow action with correct parameters', () => {
                const tableId = 'table-789';
                const rowIndex = 1;
                const rowCells: IdpField[] = [
                    {
                        id: 'cell1',
                        value: 'A',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 1,
                        verificationStatus: 'AutoValid',
                        isSelected: false,
                        hasIssue: false,
                        name: '',
                    },
                    {
                        id: 'cell2',
                        value: 'B',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 1,
                        verificationStatus: 'AutoValid',
                        isSelected: false,
                        hasIssue: false,
                        name: '',
                    },
                ];
                const dispatchSpy = spyOn(store, 'dispatch');

                service.insertTableRow(tableId, rowIndex, rowCells);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.insertTableRow({ tableId, rowIndex, rowCells }));
            });

            it('should dispatch clearTableRow action with correct parameters', () => {
                const tableId = 'table-101';
                const rowIndex = 2;
                const dispatchSpy = spyOn(store, 'dispatch');

                service.clearTableRow(tableId, rowIndex);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.clearTableRow({ tableId, rowIndex }));
            });

            it('should dispatch clearTableColumn action with correct parameters', () => {
                const tableId = 'table-202';
                const columnIndex = 3;
                const dispatchSpy = spyOn(store, 'dispatch');

                service.clearTableColumn(tableId, columnIndex);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.clearTableColumn({ tableId, columnIndex }));
            });

            it('should dispatch deleteTableRow action with correct parameters', () => {
                const tableId = 'table-303';
                const rowIndex = 4;
                const dispatchSpy = spyOn(store, 'dispatch');

                service.deleteTableRow(tableId, rowIndex);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.deleteTableRow({ tableId, rowIndex }));
            });

            it('should dispatch deleteTable action with correct parameters', () => {
                const tableId = 'table-404';
                const dispatchSpy = spyOn(store, 'dispatch');

                service.deleteTable(tableId);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.deleteTable({ tableId }));
            });

            it('should dispatch updateTableRow action with correct parameters', () => {
                const tableId = 'table-505';
                const rowIndex = 5;
                const rowCells: IdpField[] = [
                    {
                        id: 'cell3',
                        value: 'C',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 1,
                        verificationStatus: 'AutoValid',
                        isSelected: false,
                        hasIssue: false,
                        name: '',
                    },
                ];
                const dispatchSpy = spyOn(store, 'dispatch');

                service.updateTableRow(tableId, rowIndex, rowCells);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.updateTableRow({ tableId, rowIndex, rowCells }));
            });

            it('should dispatch updateTableColumn action with correct parameters', () => {
                const tableId = 'table-606';
                const columnIndex = 6;
                const columnCells: IdpField[] = [
                    {
                        id: 'cell4',
                        value: 'D',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 1,
                        verificationStatus: 'AutoValid',
                        isSelected: false,
                        hasIssue: false,
                        name: '',
                    },
                ];
                const dispatchSpy = spyOn(store, 'dispatch');

                service.updateTableColumn(tableId, columnIndex, columnCells);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.updateTableColumn({ tableId, columnIndex, columnCells }));
            });

            it('should dispatch restoreTable action with correct parameters', () => {
                const tableId = 'table-707';
                const tableData: IdpTable = {
                    id: tableId,
                    name: 'Restored Table',
                    columnHeaderNames: ['col1'],
                    rows: [],
                };
                const tableFields: IdpField[] = [
                    {
                        id: 'field1',
                        value: 'E',
                        dataType: IdpFieldDataType.Text,
                        format: '',
                        confidence: 1,
                        verificationStatus: 'AutoValid',
                        isSelected: false,
                        hasIssue: false,
                        name: '',
                    },
                ];
                const dispatchSpy = spyOn(store, 'dispatch');

                service.restoreTable(tableId, tableData, tableFields);

                expect(dispatchSpy).toHaveBeenCalledWith(userActions.restoreTable({ tableId, tableData, tableFields }));
            });
        });
    });
});
