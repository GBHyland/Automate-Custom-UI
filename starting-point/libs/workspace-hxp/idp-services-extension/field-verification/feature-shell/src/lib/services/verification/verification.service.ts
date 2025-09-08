/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { IdpBoundingBox, IdpDocument, IdpField, IdpTable } from '../../models/screen-models';
import { selectDocument } from '../../store/selectors/document.selectors';
import { IdpPagesMetadata, userActions } from '../../store/actions/field-verification.actions';
import { selectActiveField, selectDocumentFields, selectFieldById } from '../../store/selectors/document-field.selectors';
import { selectActiveTable, selectTableById } from '../../store/selectors/document-table.selectors';

@Injectable()
export class IdpVerificationService {
    private readonly store = inject(Store);

    readonly document$: Observable<IdpDocument> = this.store.select(selectDocument);
    readonly documentFields$: Observable<IdpField[]> = this.store.select(selectDocumentFields);
    readonly activeField$: Observable<IdpField | undefined> = this.store.select(selectActiveField);
    readonly activeTable$: Observable<IdpTable | undefined> = this.store.select(selectActiveTable);

    getFieldById$(fieldId: string) {
        return this.store.select(selectFieldById(fieldId));
    }

    getTableById$(tableId: string) {
        return this.store.select(selectTableById(tableId));
    }

    updateRejectReason(rejectReasonId: string, rejectNote?: string): void {
        this.store.dispatch(userActions.rejectReasonUpdate({ rejectReasonId, rejectNote }));
    }

    updateField(field: IdpField, boundingBox?: IdpBoundingBox): void {
        this.store.dispatch(
            userActions.fieldValueUpdate({
                fieldId: field.id,
                value: field.value ?? '',
                boundingBox,
                confidence: field.confidence,
            })
        );
    }

    verifyField(fieldId: string): void {
        this.store.dispatch(userActions.verifyField({ fieldId }));
    }

    selectField(field: IdpField | string, needsKeyboardFocus = false) {
        this.store.dispatch(userActions.fieldSelect({ fieldId: typeof field === 'string' ? field : field.id, needsKeyboardFocus }));
    }

    selectNextField(): void {
        this.store.dispatch(userActions.selectNextField());
    }

    updatePagesRotation(pages: IdpPagesMetadata[], taskDataSynced: boolean) {
        this.store.dispatch(userActions.updatePagesRotation({ pages, taskDataSynced }));
    }

    addTableRow(tableId: string, rowIndex: number = 0): void {
        this.store.dispatch(userActions.addTableRow({ tableId, rowIndex }));
    }

    insertTableRow(tableId: string, rowIndex: number, rowCells: IdpField[]): void {
        this.store.dispatch(userActions.insertTableRow({ tableId, rowIndex, rowCells }));
    }

    clearTableRow(tableId: string, rowIndex: number): void {
        this.store.dispatch(userActions.clearTableRow({ tableId, rowIndex }));
    }

    clearTableColumn(tableId: string, columnIndex: number): void {
        this.store.dispatch(userActions.clearTableColumn({ tableId, columnIndex }));
    }

    deleteTableRow(tableId: string, rowIndex: number): void {
        this.store.dispatch(userActions.deleteTableRow({ tableId, rowIndex }));
    }

    deleteTable(tableId: string): void {
        this.store.dispatch(userActions.deleteTable({ tableId }));
    }

    updateTableRow(tableId: string, rowIndex: number, rowCells: IdpField[]): void {
        this.store.dispatch(userActions.updateTableRow({ tableId, rowIndex, rowCells }));
    }

    updateTableColumn(tableId: string, columnIndex: number, columnCells: IdpField[]): void {
        this.store.dispatch(userActions.updateTableColumn({ tableId, columnIndex, columnCells }));
    }

    restoreTable(tableId: string, tableData: IdpTable, tableFields: IdpField[]): void {
        this.store.dispatch(userActions.restoreTable({ tableId, tableData, tableFields }));
    }
}

function equalsIgnoreCase(left: string, right: string) {
    return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0;
}

function startsWithIgnoreCase(value: string, search: string) {
    if (value.length < search.length) {
        return false;
    }
    const start = value.slice(0, search.length);
    return equalsIgnoreCase(start, search);
}

export interface BasicOcrWord {
    text: string;
    pageId?: string;
}

function getComparer(caseSensitive: boolean, isLastWord = false) {
    if (isLastWord) {
        return caseSensitive ? (left: string, right: string) => left.startsWith(right) : startsWithIgnoreCase;
    }
    return caseSensitive ? (left: string, right: string) => left === right : equalsIgnoreCase;
}

function* findExactMatches<T extends BasicOcrWord>(ocrWords: T[], search: string, caseSensitive: boolean) {
    const comparer = getComparer(caseSensitive);

    for (let start = 0; start < ocrWords.length; start++) {
        const pageId = ocrWords[start].pageId;
        let text = '';
        const words: T[] = [];

        for (let i = start; i < ocrWords.length && text.length <= search.length; i++) {
            const word = ocrWords[i];
            if (pageId && pageId !== word.pageId) {
                break;
            }

            text += (i > start ? ' ' : '') + word.text;
            words.push(word);

            if (comparer(text, search)) {
                yield words;
                break;
            }
        }
    }
}

function* findPartialMatches<T extends BasicOcrWord>(ocrWords: T[], searchWords: string[], caseSensitive: boolean) {
    for (let start = 0; start < ocrWords.length; start++) {
        const pageId = ocrWords[start].pageId;
        const matchedWords: T[] = [];
        let isMatch = true;

        for (let i = 0; i < searchWords.length && start + i < ocrWords.length && isMatch; i++) {
            const word = ocrWords[start + i];
            if (pageId && pageId !== word.pageId) {
                isMatch = false;
                continue;
            }

            const comparer = getComparer(caseSensitive, i === searchWords.length - 1);
            if (!comparer(word.text, searchWords[i])) {
                isMatch = false;
                continue;
            }
            matchedWords.push(word);
        }

        if (isMatch && matchedWords.length > 0) {
            yield matchedWords;
        }
    }
}

export function* findOcrMatches<T extends BasicOcrWord>(
    ocrWords: T[],
    search: string,
    caseSensitive = false,
    matchFullPhrase = false
): Generator<T[]> {
    if (!search || !ocrWords?.length) {
        return;
    }

    if (matchFullPhrase) {
        yield* findExactMatches(ocrWords, search, caseSensitive);
        return;
    }

    const searchWords = search.split(/\s+/);
    yield* findPartialMatches(ocrWords, searchWords, caseSensitive);
}

export function findSingleTypeaheadMatch<T extends BasicOcrWord>(suggestions: T[], search: string) {
    const exactMatch = single(findOcrMatches(suggestions, search, true));
    if (exactMatch) {
        return exactMatch; // single exact match is perfect
    }

    const caseInsensitiveMatches = [...findOcrMatches(suggestions, search, false)];
    if (caseInsensitiveMatches.length > 0) {
        const firstMatch = caseInsensitiveMatches[0];
        if (
            caseInsensitiveMatches.every(
                (match) => match.length === firstMatch.length && match.every((word, index) => equalsIgnoreCase(word.text, firstMatch[index].text))
            )
        ) {
            return firstMatch; // take first case-insensitive match as long as there is no ambiguity
        }
    }

    // eslint-disable-next-line unicorn/no-useless-undefined
    return undefined;
}

function single<T>(source: Iterable<T>) {
    let result;
    let foundAlready = false;
    for (const value of source) {
        if (foundAlready) {
            // compiler wants explicit undefined but linter does not; compiler wins
            // eslint-disable-next-line unicorn/no-useless-undefined
            return undefined;
        }
        result = value;
        foundAlready = true;
    }
    return result;
}
