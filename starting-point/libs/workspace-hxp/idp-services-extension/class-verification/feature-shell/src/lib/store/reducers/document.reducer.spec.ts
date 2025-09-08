/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { IdpLoadState, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { documentAdapter, DocumentEntity, DocumentState, initialDocumentState } from '../states/document.state';
import { documentReducer } from './document.reducer';
import { deepCopyDocumentEntity, mockDocumentEntities } from '../models/mocked/mocked-documents';
import { IdpDocumentAction } from '../../models/screen-models';
import {
    DocumentCreateStateUpdate,
    DocumentDeleteStateUpdate,
    DocumentStateUpdate,
    DocumentUpdateStateUpdate,
} from '../models/document-state-updates';

describe('Document Reducer', () => {
    it('should return the initial state for unknown action', () => {
        const action = { type: 'Unknown' };
        const state = documentReducer(initialDocumentState, action);

        expect(state).toBe(initialDocumentState);
    });

    it('should add documents on create documents', () => {
        const createdDocuments = mockDocumentEntities();
        const existingDocuments = [createdDocuments.pop() as DocumentEntity];

        let mockDocumentState: DocumentState = {
            ...initialDocumentState,
            loadState: IdpLoadState.NotInitialized,
            lastAction: {} as any,
        };

        mockDocumentState = documentAdapter.setAll(existingDocuments, mockDocumentState);

        const action = systemActions.createDocuments({
            documents: createdDocuments,
        });

        const state = documentReducer(mockDocumentState, action);

        expect(Object.values(state.entities).length).toEqual(createdDocuments.length + existingDocuments.length);
        expect(Object.values(state.entities)).toEqual([...existingDocuments, ...createdDocuments]);
        expect(state.loadState).toEqual(IdpLoadState.Loaded);
        expect(state.lastAction).toEqual(undefined);
    });

    it('should set selected pages on page select', () => {
        const documents = mockDocumentEntities();

        let mockDocumentState: DocumentState = {
            ...initialDocumentState,
            selectedPageIds: [documents[2].pages[0].id],
            lastAction: {} as any,
        };

        mockDocumentState = documentAdapter.setAll(documents, mockDocumentState);

        const selectedPageIds = [documents[0].pages[0].id, documents[0].pages[1].id, documents[1].pages[1].id];
        const action = userActions.pageSelect({
            pageIds: selectedPageIds,
        });

        const state = documentReducer(mockDocumentState, action);

        expect(state.selectedPageIds.length).toEqual(3);
        expect(state.selectedPageIds).toEqual(selectedPageIds);
        expect(state.lastAction).toEqual(undefined);
    });

    it('should update expanded document ids on document expand toggle', () => {
        const documents = mockDocumentEntities();

        let mockDocumentState: DocumentState = {
            ...initialDocumentState,
            expandedDocumentIds: [documents[0].id],
            lastAction: {} as any,
        };

        mockDocumentState = documentAdapter.setAll(documents, mockDocumentState);

        const action = userActions.documentExpandToggle({
            documentId: documents[1].id,
        });

        const state = documentReducer(mockDocumentState, action);

        expect(state.expandedDocumentIds.length).toEqual(2);
        expect(state.expandedDocumentIds).toEqual([documents[0].id, documents[1].id]);
        expect(state.lastAction).toEqual(undefined);
    });

    it('should clear expanded document id on document expand toggle with expanded document id', () => {
        const documents = mockDocumentEntities();

        let mockDocumentState: DocumentState = {
            ...initialDocumentState,
            expandedDocumentIds: [documents[0].id],
        };

        mockDocumentState = documentAdapter.setAll(documents, mockDocumentState);

        const action = userActions.documentExpandToggle({
            documentId: documents[0].id,
        });

        const state = documentReducer(mockDocumentState, action);

        expect(state.expandedDocumentIds.length).toEqual(0);
    });

    it('should set load state to loading on document and page structure actions', () => {
        const cases = [
            { action: userActions.pageMerge({} as any) },
            { action: userActions.pageSplit({} as any) },
            { action: userActions.pageMove({} as any) },
            { action: userActions.pageDelete({} as any) },
            { action: userActions.documentClassChange({} as any) },
            { action: userActions.documentResolve({} as any) },
            { action: userActions.documentReject({} as any) },
        ];

        for (const { action } of cases) {
            const state = documentReducer(initialDocumentState, action);

            expect(state.loadState).toEqual(IdpLoadState.Loading);
        }
    });

    it('should set error state on document operation error', () => {
        const mockDocumentState: DocumentState = {
            ...initialDocumentState,
            loadState: IdpLoadState.Loaded,
            lastAction: undefined,
        };

        const documentAction = IdpDocumentAction.Split;
        const action = systemActions.documentOperationError({
            docAction: documentAction,
        } as any);

        const state = documentReducer(mockDocumentState, action);

        expect(state.loadState).toEqual(IdpLoadState.Error);
        expect(state.lastAction).toBeDefined();
        expect(state.lastAction?.isSuccess).toEqual(false);
        expect(state.lastAction?.action).toEqual(documentAction);
    });

    it('should apply document operations and set success state on document operation success', () => {
        const documents = mockDocumentEntities();
        const updated1 = deepCopyDocumentEntity(documents[0]);
        updated1.name = `${documents[0].name} Updated`;
        updated1.pages[0].fileReference = 'cf101';
        const updated2 = deepCopyDocumentEntity(documents[1]);
        updated2.name = `${documents[1].name} Updated`;

        const cases = [
            {
                params: {
                    type: IdpDocumentAction.Merge,
                    updates: [
                        { operation: 'update', documentId: updated1.id, update: updated1 },
                        { operation: 'delete', documentId: documents[1].id },
                    ],
                    updatedPageIds: [updated1.pages[0].id],
                },
                expected: {
                    documentUpdates: [updated1.id],
                    pageUpdates: [{ id: updated1.pages[0].id, name: updated1.pages[0].name, documentId: updated1.id }],
                },
            },
            {
                params: {
                    type: IdpDocumentAction.ChangeClass,
                    updates: [{ operation: 'update', documentId: updated2.id, update: updated2 }],
                    updatedPageIds: [],
                },
                expected: {
                    documentUpdates: [updated2.id],
                    pageUpdates: [],
                },
            },
            {
                params: {
                    type: IdpDocumentAction.Delete,
                    updates: [
                        { operation: 'update', documentId: updated1.id, update: updated1 },
                        { operation: 'delete', documentId: updated1.id },
                    ],
                    updatedPageIds: [],
                },
                expected: {
                    documentUpdates: [updated1.id],
                    pageUpdates: [],
                },
            },
        ];

        for (const { params, expected } of cases) {
            let mockDocumentState: DocumentState = {
                ...initialDocumentState,
                loadState: IdpLoadState.Loading,
                lastAction: undefined,
            };

            mockDocumentState = documentAdapter.setAll(documents, mockDocumentState);

            const action = systemActions.documentOperationSuccess({
                docAction: params.type,
                updates: params.updates,
                contextPageIds: params.updatedPageIds,
            } as any);
            const state = documentReducer(mockDocumentState, action);

            expect(state.loadState).toEqual(IdpLoadState.Loaded);
            expect(state.lastAction).toBeDefined();
            expect(state.lastAction?.isSuccess).toEqual(true);
            expect(state.lastAction?.action).toEqual(params.type);
            expect(state.lastAction?.documents).toEqual(expected.documentUpdates);
            expect(state.lastAction?.pages).toEqual(expected.pageUpdates);

            checkDocumentOperations(params.updates as DocumentStateUpdate[], state);
        }
    });

    function checkDocumentOperations(operations: DocumentStateUpdate[], state: DocumentState): void {
        const deletes = operations.filter((op) => op.operation === 'delete');
        if (deletes.length > 0) {
            for (let operation of deletes) {
                operation = operation as DocumentDeleteStateUpdate;
                const expectedDocument = state.entities[operation.documentId];
                expect(expectedDocument).toBeUndefined();
            }
        }

        const creates = operations.filter((op) => op.operation === 'create' && !deletes.some((del) => op.documentId === del.documentId));
        if (creates.length > 0) {
            // eslint-disable-next-line prefer-const
            for (let [i, operation] of creates.entries()) {
                operation = operation as DocumentCreateStateUpdate;
                const expectedDocument = state.entities[operation.documentId];
                expect(expectedDocument).toBeDefined();
                expect(expectedDocument).toEqual(operation.update);
                const entities = Object.values(state.entities);
                expect(entities.indexOf(expectedDocument)).toEqual(
                    operation.createAfterDocId ? entities.indexOf(state.entities[operation.createAfterDocId]) + 1 : i
                );
            }
        }

        const updates = operations.filter((op) => op.operation === 'update' && !deletes.some((del) => op.documentId === del.documentId));
        if (updates.length > 0) {
            for (let operation of updates) {
                operation = operation as DocumentUpdateStateUpdate;
                const expectedDocument = state.entities[operation.documentId];
                expect(expectedDocument).toBeDefined();
                expect(expectedDocument).toEqual(operation.update);
            }
        }
    }

    it('should apply document operations on apply document updates', () => {
        const documents = mockDocumentEntities();
        const updated1 = deepCopyDocumentEntity(documents[0]);
        updated1.name = `${documents[0].name} Updated`;
        updated1.pages[0].fileReference = 'cf101';
        const updated2 = deepCopyDocumentEntity(documents[1]);
        updated2.name = `${documents[1].name} Updated`;
        const created1 = {
            id: 'd_cf343000',
            name: 'Document 343000',
            class: 'intergalactic passport',
            verificationStatus: IdpVerificationStatus.AutoValid,
            classificationConfidence: 100,
            pages: [
                {
                    id: 'cf343000_0',
                    name: 'Page 1 of Document 343000',
                    documentId: 'd_cf343000',
                    fileReference: 'cf343000',
                    sourcePageIndex: 0,
                    hasIssue: false,
                    isSelected: false,
                },
            ],
            hasIssue: false,
            isSelected: false,
            isExpanded: false,
            rejectedReasonId: undefined,
        };

        const cases = [
            [
                {
                    operation: 'update',
                    documentId: updated1.id,
                    update: updated1,
                },
                {
                    operation: 'create',
                    documentId: created1.id,
                    update: created1,
                    createAfterDocId: documents[2].id,
                },
                {
                    operation: 'delete',
                    documentId: documents[1].id,
                },
            ],
            [
                {
                    operation: 'create',
                    documentId: created1.id,
                    update: created1,
                },
            ],
        ] as DocumentStateUpdate[][];

        for (let updates of cases) {
            updates = updates as DocumentStateUpdate[];

            let mockDocumentState: DocumentState = {
                ...initialDocumentState,
            };

            mockDocumentState = documentAdapter.setAll(documents, mockDocumentState);

            const action = systemActions.applyDocumentUpdates({ updates });
            const state = documentReducer(mockDocumentState, action);

            checkDocumentOperations(updates, state);
        }
    });

    it('should update pages rotation on update pages rotation', () => {
        const documents = mockDocumentEntities();
        const updated1 = deepCopyDocumentEntity(documents[0]);
        updated1.pages[0].viewerRotation = 90;
        updated1.pages[0].rotation = 90;

        const update: DocumentUpdateStateUpdate = {
            operation: 'update',
            documentId: updated1.id,
            update: updated1,
        };

        let mockDocumentState: DocumentState = {
            ...initialDocumentState,
            loadState: IdpLoadState.Loading,
        };

        mockDocumentState = documentAdapter.setAll(documents, mockDocumentState);

        const action = userActions.updatePagesRotation({
            pages: [
                {
                    pageId: updated1.pages[0].id,
                    documentId: updated1.id,
                    viewerRotation: updated1.pages[0].viewerRotation,
                    rotation: updated1.pages[0].rotation,
                },
            ],
            taskDataSynced: false,
        });

        const state = documentReducer(mockDocumentState, action);
        const expectedDocument = state.entities[update.documentId];
        expect(expectedDocument).toBeDefined();
        expect(expectedDocument).toEqual(update.update);
    });
});
