/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { documentReducer } from './document.reducer';
import { IdpPagesMetadata, systemActions, userActions } from '../actions/field-verification.actions';
import { DocumentState, initialDocumentState } from '../states/document.state';
import { IdpLoadState, RejectReason } from '@hxp/workspace-hxp/idp-services-extension/shared';

describe('documentReducer', () => {
    it('should return the initial state', () => {
        const state = documentReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialDocumentState);
    });

    it('should handle documentLoad action', () => {
        const documentState = {
            class: { id: 'someClassId', name: 'someClassName' },
            id: 'someId',
            name: 'someName',
            someKey: 'someValue',
            pages: [
                {
                    id: 'page1',
                    name: 'Page 1',
                    fileReference: 'fileRef1',
                    contentFileReferenceIndex: 0,
                    sourcePageIndex: 0,
                },
            ],
        };
        const action = systemActions.documentLoad({
            documentState,
            fields: [],
            tables: [],
        });
        const expectedState = {
            ...initialDocumentState,
            ...documentState,
            loadState: IdpLoadState.Loaded,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle documentLoadError action', () => {
        const action = systemActions.documentLoadError({ error: 'Some error message' });
        const expectedState = {
            ...initialDocumentState,
            loadState: IdpLoadState.Error,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle pageSelect action', () => {
        const pageId = 'page1';
        const action = userActions.pageSelect({ pageId });
        const expectedState = {
            ...initialDocumentState,
            selectedPageIds: [pageId],
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle rejectReasonUpdate action', () => {
        const reason: RejectReason = { id: '1', value: 'rejectReason' };
        const action = userActions.rejectReasonUpdate({ rejectReasonId: reason.id });
        const expectedState = {
            ...initialDocumentState,
            rejectReasonId: reason.id,
            rejectNote: undefined,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle rejectReasonUpdate action with note', () => {
        const reason: RejectReason = { id: '1', value: 'rejectReason' };
        const rejectNoteTyped = 'incorrect pricing on invoice';
        const action = userActions.rejectReasonUpdate({ rejectReasonId: reason.id, rejectNote: rejectNoteTyped });
        const expectedState = {
            ...initialDocumentState,
            rejectReasonId: reason.id,
            rejectNote: rejectNoteTyped,
        };
        const state = documentReducer(initialDocumentState, action);
        expect(state).toEqual(expectedState);
    });

    it('should handle updatePagesRotation action', () => {
        const initialPages = [
            {
                id: 'page1',
                documentId: 'doc1',
                name: 'Page 1',
                fileReference: 'fileRef1',
                contentFileReferenceIndex: 0,
                sourcePageIndex: 0,
                rotation: 90,
                viewerRotation: 90,
            },
            {
                id: 'page2',
                documentId: 'doc1',
                name: 'Page 2',
                fileReference: 'fileRef2',
                contentFileReferenceIndex: 0,
                sourcePageIndex: 1,
                rotation: 0,
                viewerRotation: 90,
            },
        ];
        const updatedPages: IdpPagesMetadata[] = [
            { pageId: 'page1', documentId: 'doc1', rotation: 180, viewerRotation: 180 },
            { pageId: 'page2', documentId: 'doc1', rotation: 270, viewerRotation: 270 },
        ];
        const initialState: DocumentState = {
            ...initialDocumentState,
            id: 'doc1',
            pages: initialPages,
        };
        const action = userActions.updatePagesRotation({ pages: updatedPages, taskDataSynced: false });
        const expectedState = {
            ...initialState,
            pages: [
                {
                    id: 'page1',
                    documentId: 'doc1',
                    name: 'Page 1',
                    fileReference: 'fileRef1',
                    contentFileReferenceIndex: 0,
                    sourcePageIndex: 0,
                    rotation: 180,
                    viewerRotation: 180,
                },
                {
                    id: 'page2',
                    documentId: 'doc1',
                    name: 'Page 2',
                    fileReference: 'fileRef2',
                    contentFileReferenceIndex: 0,
                    sourcePageIndex: 1,
                    rotation: 270,
                    viewerRotation: 270,
                },
            ],
        };
        const state = documentReducer(initialState, action);
        expect(state).toEqual(expectedState);
    });
});
