/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Observable } from 'rxjs';
import { hot, cold, getTestScheduler } from 'jasmine-marbles';
import { DocumentEffects } from './document.effects';
import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { systemActions, userActions } from '../actions/class-verification.actions';
import {
    ContentFileReference,
    IdpBackendService,
    IdpDocumentClassDefinition,
    IdpLoadState,
    IdpSharedImageLoadingService,
    IdpVerificationStatus,
    TaskContext,
} from '@hxp/workspace-hxp/idp-services-extension/shared';
import { mockDocumentEntities, mockDocumentEntitiesByIdpDocuments } from '../models/mocked/mocked-documents';
import { IdpConfigClass, IdpDocument, IdpDocumentAction, IdpDocumentPage, IdpTaskData, UNCLASSIFIED_CLASS_ID } from '../../models/screen-models';
import { mockIdpDocuments } from '../../models/mocked/mocked-documents';
import { cloneDeep } from 'es-toolkit/compat';
import { documentAdapter, DocumentEntity, DocumentState, initialDocumentState } from '../states/document.state';
import { DocumentStateUpdate } from '../models/document-state-updates';
import { classVerificationStateName, initialClassVerificationRootState } from '../states/root.state';
import { documentClassAdapter, DocumentClassState, initialDocumentClassState } from '../states/document-class.state';
import { mockIdpConfigClasses } from '../../models/mocked/mocked-classes';
import { selectAllDocuments, selectDocumentsRawState } from '../selectors/document.selectors';
import { selectCorrelationId, selectTaskInputData } from '../selectors/screen.selectors';
import { selectDeletedPages } from '../selectors/document-page.selectors';
import { ApiDocument, ClassVerificationBatchState } from '../../models/contracts/class-verification-models';

export const resetMockStore = (store: MockStore) => {
    const cleanDocumentState = documentAdapter.setAll([], initialDocumentState);
    const cleanClassesState = documentClassAdapter.setAll([], initialDocumentClassState);
    const cleanState = {
        [classVerificationStateName]: {
            ...initialClassVerificationRootState,
            documents: cleanDocumentState,
            documentClasses: cleanClassesState,
        },
    };

    store.setState(cleanState);
    store.resetSelectors();
};

describe('Document Effects', () => {
    let actions$: Observable<any>;
    let effects: DocumentEffects;
    let store: MockStore;

    const idpBackendSpy = jasmine.createSpyObj(
        'IdpBackendService',
        {
            updateRotationData$: {},
        },
        {}
    );

    const idpSharedImageServiceSpy = jasmine.createSpyObj('IdpSharedImageLoadingService', ['cleanup']);

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: IdpBackendService, useValue: idpBackendSpy },
                { provide: IdpSharedImageLoadingService, useValue: idpSharedImageServiceSpy },
                DocumentEffects,
                provideMockActions(() => actions$),
                provideMockStore(),
            ],
        });

        effects = TestBed.inject(DocumentEffects);
        store = TestBed.inject(MockStore);
        resetMockStore(store);
    });

    afterEach(() => {
        resetMockStore(store);
    });

    describe('Task Data Input', () => {
        it('should map task documents to document entities', () => {
            const taskData: IdpTaskData = {
                batchState: {
                    documents: [
                        {
                            id: 'd_cf1',
                            name: 'Document 1',
                            classId: 'payslips',
                            classificationConfidence: 0.9,
                            pages: [
                                { contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 0 },
                                { contentFileReferenceIndex: 0, sourcePageIndex: 1, rotation: 0 },
                            ],
                        },
                        {
                            id: 'd_cf2',
                            name: 'Document 2',
                            markAsDeleted: true,
                            markAsRejected: true,
                            rejectReasonId: 'rr1',
                            classificationReviewStatus: 'ReviewRequired',
                            pages: [
                                { contentFileReferenceIndex: 1, sourcePageIndex: 0, rotation: 0 },
                                { contentFileReferenceIndex: 1, sourcePageIndex: 1, rotation: 0 },
                            ],
                        },
                    ],
                    contentFileReferences: [{ sys_id: 'cf1' }, { sys_id: 'cf2' }],
                },
                rejectReasons: [],
                configuration: {
                    classificationConfidenceThreshold: 0.9,
                    documentClassDefinitions: [
                        { id: 'payslips', name: 'Payslips', description: "Yup! It's Payslips." },
                        { id: 'contracts', name: 'Contracts', description: 'Contracts.' },
                    ],
                },
            };

            const action = systemActions.screenLoadSuccess({ taskData, taskContext: {} as TaskContext });
            const outcome = systemActions.createDocuments({
                documents: [
                    {
                        id: 'd_cf1',
                        name: 'Document 1',
                        class: { id: 'payslips', name: 'Payslips', description: "Yup! It's Payslips.", isSpecialClass: false } as any,
                        verificationStatus: IdpVerificationStatus.AutoValid,
                        classificationConfidence: 0.9,
                        isGenerated: false,
                        markAsDeleted: false,
                        rejectedReasonId: undefined,
                        pages: [
                            { id: '0_0', name: 'Page 0_0', fileReference: 'cf1', contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 0 },
                            { id: '0_1', name: 'Page 0_1', fileReference: 'cf1', contentFileReferenceIndex: 0, sourcePageIndex: 1, rotation: 0 },
                        ],
                    },
                    {
                        id: 'd_cf2',
                        name: 'Document 2',
                        class: undefined,
                        verificationStatus: IdpVerificationStatus.AutoInvalid,
                        classificationConfidence: 0,
                        rejectedReasonId: 'rr1',
                        isGenerated: false,
                        markAsDeleted: true,
                        pages: [
                            { id: '1_0', name: 'Page 1_0', fileReference: 'cf2', contentFileReferenceIndex: 1, sourcePageIndex: 0, rotation: 0 },
                            { id: '1_1', name: 'Page 1_1', fileReference: 'cf2', contentFileReferenceIndex: 1, sourcePageIndex: 1, rotation: 0 },
                        ],
                    },
                ],
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.loadDocumentEffect$).toBeObservable(expected);
        });

        it('should return empty documents if task documents are not set', () => {
            const taskData: IdpTaskData = {
                configuration: {},
            } as unknown as IdpTaskData;
            const action = systemActions.screenLoadSuccess({ taskData, taskContext: {} as TaskContext });
            const outcome = systemActions.createDocuments({ documents: [] });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.loadDocumentEffect$).toBeObservable(expected);
        });

        it('should return documents with undefined class if task classes are not set', () => {
            const taskData: IdpTaskData = {
                batchState: {
                    documents: [
                        {
                            id: 'd_cf1',
                            name: 'Document 1',
                            classId: 'payslips',
                            classificationConfidence: 99,
                            pages: [
                                { contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 0 },
                                { contentFileReferenceIndex: 0, sourcePageIndex: 1, rotation: 0 },
                            ],
                        },
                    ],
                    contentFileReferences: [{ sys_id: 'cf1' }],
                },
                configuration: {
                    classificationConfiguration: {
                        rejectReasons: [],
                        documentClassDefinitions: [],
                    },
                },
            } as unknown as IdpTaskData;

            const action = systemActions.screenLoadSuccess({ taskData, taskContext: {} as TaskContext });
            const outcome = systemActions.createDocuments({
                documents: [
                    {
                        id: 'd_cf1',
                        name: 'Document 1',
                        class: undefined,
                        verificationStatus: IdpVerificationStatus.AutoValid,
                        classificationConfidence: 99,
                        isGenerated: false,
                        markAsDeleted: false,
                        rejectedReasonId: undefined,
                        pages: [
                            { id: '0_0', name: 'Page 0_0', fileReference: 'cf1', contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 0 },
                            { id: '0_1', name: 'Page 0_1', fileReference: 'cf1', contentFileReferenceIndex: 0, sourcePageIndex: 1, rotation: 0 },
                        ],
                    },
                ],
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.loadDocumentEffect$).toBeObservable(expected);
        });
    });

    describe('Page Merge', () => {
        it('should merge pages', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];
            const targetDocument = entities[3];

            const affectedEntities = cloneDeep([entities[1], entities[2], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [...targetDocument.pages, entities[1].pages[0], entities[2].pages[0]];
            entities[1].pages = entities[1].pages.slice(1);
            entities[2].pages = entities[2].pages.slice(1);
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1] },
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument }
            );

            testPageMergeEffect(pages, targetDocument, updates, affectedEntities);
        });

        function testPageMergeEffect(
            pages: IdpDocumentPage[],
            targetDocument: DocumentEntity,
            updates: DocumentStateUpdate[],
            affectedEntities: DocumentEntity[]
        ) {
            setMockStoreState(affectedEntities);

            const action = userActions.pageMerge({
                docAction: IdpDocumentAction.Merge,
                canUndoAction: true,
                pages,
                targetDocumentId: targetDocument.id,
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_SUCCESS',
                messageArgs: jasmine.any(Object),
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.mergePageEffect$).toBeObservable(expected);
        }

        it('should return document operation error on pages merge if target document cannot be found', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];
            const targetDocument = entities[3];

            setMockStoreState(cloneDeep([entities[1], entities[2]]));

            const action = userActions.pageMerge({
                docAction: IdpDocumentAction.Merge,
                canUndoAction: true,
                pages,
                targetDocumentId: targetDocument.id,
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.mergePageEffect$).toBeObservable(expected);
        });

        it("should delete documents on pages merge if all it's pages are merged into another document", () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [...documents[2].pages, ...documents[3].pages];
            entities[3].isGenerated = true;
            const targetDocument = entities[1];

            const affectedEntities = cloneDeep([entities[2], entities[3], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [...targetDocument.pages, ...entities[2].pages, ...entities[3].pages];
            entities[2].pages = [];
            entities[2].markAsDeleted = true;
            updates.push(
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument },
                { operation: 'delete', documentId: entities[3].id }
            );

            testPageMergeEffect(pages, targetDocument, updates, affectedEntities);
        });

        it('should throw an error when page does not exist in any of the affected documents on pages merge', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const badPage1 = cloneDeep(documents[2].pages[0]);
            badPage1.documentId = 'bad_document_id';
            const badPage2 = cloneDeep(documents[2].pages[0]);
            badPage2.id = 'bad_page_id';
            const badPage3 = documents[1].pages[1];
            const pages = [documents[2].pages[0], badPage1, badPage2, badPage3];
            const targetDocument = entities[1];

            setMockStoreState(cloneDeep([entities[2], targetDocument]));

            const action = userActions.pageMerge({
                docAction: IdpDocumentAction.Merge,
                canUndoAction: true,
                pages,
                targetDocumentId: targetDocument.id,
            });

            actions$ = hot('-a-', { a: action });
            const expected = cold('-#-', {}, jasmine.stringMatching(/.+/));

            expect(effects.mergePageEffect$).toBeObservable(expected);
        });
    });

    function setMockStoreState(documents: DocumentEntity[], classes?: IdpConfigClass[] | undefined) {
        const loadedDocumentState: DocumentState = { ...initialDocumentState, loadState: IdpLoadState.Loaded };
        const mockDocumentState = documentAdapter.setAll(cloneDeep(documents), loadedDocumentState);

        let mockClassesState: DocumentClassState = initialDocumentClassState;
        if (classes !== undefined) {
            const loadedClassesState: DocumentClassState = { ...initialDocumentClassState, loadState: IdpLoadState.Loaded };
            mockClassesState = documentClassAdapter.setAll(classes, loadedClassesState);
            mockClassesState.loadState = IdpLoadState.Loaded;
        }

        const mockState = {
            [classVerificationStateName]: {
                ...initialClassVerificationRootState,
                documents: mockDocumentState,
                documentClasses: mockClassesState,
            },
        };
        store.setState(mockState);
    }

    describe('Page Split', () => {
        it('should split pages', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];

            const affectedEntities = cloneDeep([entities[1], entities[2]]);

            const updates: DocumentStateUpdate[] = [];
            const created = {
                ...entities[1],
                id: 'mock_page_id',
                name: `${entities[1].name}_split`,
                isGenerated: true,
                pages: [entities[1].pages[0], entities[2].pages[0]],
            };
            entities[1].pages = entities[1].pages.slice(1);
            entities[2].pages = entities[2].pages.slice(1);
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1] },
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'create', documentId: 'mock_page_id', update: created, createAfterDocId: entities[1].id }
            );

            testPageSplitEffect(pages, updates, affectedEntities);
        });

        function testPageSplitEffect(
            pages: IdpDocumentPage[],
            updates: DocumentStateUpdate[],
            affectedEntities: DocumentEntity[],
            createAfterDocId?: string
        ) {
            setMockStoreState(affectedEntities);
            spyOn(effects, 'uuid').and.returnValue('mock_page_id');

            const action = userActions.pageSplit({
                docAction: IdpDocumentAction.Split,
                canUndoAction: true,
                pages,
                createAfterDocId: createAfterDocId,
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: jasmine.stringMatching(/IDP_CLASS_VERIFICATION\.USER_FEEDBACK\.PAGE_SPLIT_SUCCESS.*/),
                messageArgs: jasmine.any(Object),
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.splitPageEffect$).toBeObservable(expected);
        }

        it('should return document operation error on pages split if target document cannot be found', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];

            setMockStoreState(cloneDeep([entities[1], entities[2]]));

            const action = userActions.pageSplit({
                docAction: IdpDocumentAction.Split,
                canUndoAction: true,
                pages,
                createAfterDocId: 'bad_document_id',
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_SPLIT_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.splitPageEffect$).toBeObservable(expected);
        });

        it("should delete documents on pages split if all it's pages are split into a new document", () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [...documents[2].pages, ...documents[3].pages];
            entities[3].isGenerated = true;

            const affectedEntities = cloneDeep([entities[2], entities[3]]);

            const updates: DocumentStateUpdate[] = [];
            const created = {
                ...entities[2],
                id: 'mock_page_id',
                name: `${entities[2].name}_split`,
                isGenerated: true,
                pages: [...entities[2].pages, ...entities[3].pages],
            };
            entities[2].pages = [];
            entities[2].markAsDeleted = true;
            updates.push(
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'create', documentId: 'mock_page_id', update: created, createAfterDocId: entities[2].id },
                { operation: 'delete', documentId: entities[3].id }
            );

            testPageSplitEffect(pages, updates, affectedEntities);
        });

        it('should throw an error when page does not exist in any of the affected documents on pages split', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const badPage1 = cloneDeep(documents[2].pages[0]);
            badPage1.documentId = 'bad_document_id';
            const badPage2 = cloneDeep(documents[2].pages[0]);
            badPage2.id = 'bad_page_id';
            const badPage3 = documents[1].pages[1];
            const pages = [documents[2].pages[0], badPage1, badPage2, badPage3];

            setMockStoreState(cloneDeep([entities[2]]));

            const action = userActions.pageSplit({
                docAction: IdpDocumentAction.Split,
                canUndoAction: true,
                pages,
            });

            actions$ = hot('-a-', { a: action });
            const expected = cold('-#-', {}, jasmine.stringMatching(/.+/));

            expect(effects.splitPageEffect$).toBeObservable(expected);
        });

        it('should split single page', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0]];

            const affectedEntities = cloneDeep([entities[1]]);

            const updates: DocumentStateUpdate[] = [];
            const created = {
                ...entities[1],
                id: 'mock_page_id',
                name: `${entities[1].name}_split`,
                isGenerated: true,
                pages: [entities[1].pages[0]],
            };
            entities[1].pages = entities[1].pages.slice(1);
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1] },
                { operation: 'create', documentId: 'mock_page_id', update: created, createAfterDocId: entities[1].id }
            );

            testPageSplitEffect(pages, updates, affectedEntities);
        });

        it('should generate a valid UUID', () => {
            const uuid = effects.uuid();
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            expect(uuid).toMatch(uuidRegex);
        });

        it('should generate unique UUIDs', () => {
            const uuid1 = effects.uuid();
            const uuid2 = effects.uuid();
            expect(uuid1).not.toEqual(uuid2);
        });
    });

    describe('Page Move', () => {
        it('should move pages to another document', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];
            const targetDocument = entities[3];
            const targetIndex = targetDocument.pages.length;

            const affectedEntities = cloneDeep([entities[1], entities[2], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [...targetDocument.pages, entities[1].pages[0], entities[2].pages[0]];
            entities[1].pages = entities[1].pages.slice(1);
            entities[2].pages = entities[2].pages.slice(1);
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1] },
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument }
            );

            testPageMoveEffect(pages, targetDocument, targetIndex, updates, affectedEntities);
        });

        function testPageMoveEffect(
            pages: IdpDocumentPage[],
            targetDocument: DocumentEntity,
            targetIndex: number,
            updates: DocumentStateUpdate[],
            affectedEntities: DocumentEntity[]
        ) {
            setMockStoreState(affectedEntities);

            const action = userActions.pageMove({
                docAction: IdpDocumentAction.MovePage,
                canUndoAction: true,
                pages,
                targetDocumentId: targetDocument.id,
                targetIndex,
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: jasmine.stringMatching(/IDP_CLASS_VERIFICATION\.USER_FEEDBACK\.MOVE_PAGE_SUCCESS.*/),
                messageArgs: jasmine.any(Object),
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.movePageEffect$).toBeObservable(expected);
        }

        it('should move pages to another document at target index', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[2].pages[0], documents[3].pages[0]];
            const targetDocument = entities[1];
            const targetIndex = 1;

            const affectedEntities = cloneDeep([entities[2], entities[3], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [targetDocument.pages[0], entities[2].pages[0], entities[3].pages[0], ...targetDocument.pages.slice(1)];
            entities[2].pages = entities[2].pages.slice(1);
            entities[3].pages = entities[3].pages.slice(1);
            entities[3].markAsDeleted = true;
            updates.push(
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: entities[3].id, update: entities[3] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument }
            );

            testPageMoveEffect(pages, targetDocument, targetIndex, updates, affectedEntities);
        });

        it('should move internal (reorder) and external (append) pages', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0], documents[3].pages[0]];
            const targetDocument = entities[1];
            const targetIndex = 1;

            const affectedEntities = cloneDeep([entities[2], entities[3], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [
                targetDocument.pages[1],
                targetDocument.pages[0],
                entities[2].pages[0],
                entities[3].pages[0],
                ...targetDocument.pages.slice(2),
            ];
            entities[2].pages = entities[2].pages.slice(1);
            entities[3].pages = entities[3].pages.slice(1);
            entities[3].markAsDeleted = true;
            updates.push(
                { operation: 'update', documentId: targetDocument.id, update: targetDocument },
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: entities[3].id, update: entities[3] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument }
            );

            testPageMoveEffect(pages, targetDocument, targetIndex, updates, affectedEntities);
        });

        it('should return document operation error on pages move if target document cannot be found', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[2].pages[0], documents[3].pages[0]];
            const targetDocument = entities[1];
            const targetIndex = 1;

            setMockStoreState(cloneDeep([entities[2], entities[3]]));

            const action = userActions.pageMove({
                docAction: IdpDocumentAction.MovePage,
                canUndoAction: true,
                pages,
                targetDocumentId: targetDocument.id,
                targetIndex,
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.MOVE_PAGE_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.movePageEffect$).toBeObservable(expected);
        });

        it("should delete documents on pages move if all it's pages are moved into another document", () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [...documents[2].pages, ...documents[3].pages];
            entities[3].isGenerated = true;
            const targetDocument = entities[1];
            const targetIndex = targetDocument.pages.length;

            const affectedEntities = cloneDeep([entities[2], entities[3], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [...targetDocument.pages, ...entities[2].pages, ...entities[3].pages];
            entities[2].pages = [];
            entities[2].markAsDeleted = true;
            updates.push(
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument },
                { operation: 'delete', documentId: entities[3].id }
            );

            testPageMoveEffect(pages, targetDocument, targetIndex, updates, affectedEntities);
        });

        it('should throw an error when page does not exist in any of the affected documents on pages move', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const badPage1 = cloneDeep(documents[2].pages[0]);
            badPage1.documentId = 'bad_document_id';
            const badPage2 = cloneDeep(documents[2].pages[0]);
            badPage2.id = 'bad_page_id';
            const pages = [documents[2].pages[0], badPage1, badPage2];
            const targetDocument = entities[1];
            const targetIndex = targetDocument.pages.length;

            setMockStoreState(cloneDeep([entities[2], targetDocument]));

            const action = userActions.pageMove({
                docAction: IdpDocumentAction.MovePage,
                canUndoAction: true,
                pages,
                targetDocumentId: targetDocument.id,
                targetIndex,
            });

            actions$ = hot('-a-', { a: action });
            const expected = cold('-#-', {}, jasmine.stringMatching(/.+/));

            expect(effects.movePageEffect$).toBeObservable(expected);
        });

        it('should move single page', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[2].pages[0]];
            const targetDocument = entities[1];
            const targetIndex = targetDocument.pages.length;

            const affectedEntities = cloneDeep([entities[2], targetDocument]);

            const updates: DocumentStateUpdate[] = [];
            targetDocument.pages = [...targetDocument.pages, entities[2].pages[0]];
            entities[2].pages = entities[2].pages.slice(1);
            updates.push(
                { operation: 'update', documentId: entities[2].id, update: entities[2] },
                { operation: 'update', documentId: targetDocument.id, update: targetDocument }
            );

            testPageMoveEffect(pages, targetDocument, targetIndex, updates, affectedEntities);
        });
    });

    describe('Page Delete', () => {
        it('should delete pages', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];

            const affectedEntities = cloneDeep([entities[1], entities[2]]);

            const updates: DocumentStateUpdate[] = [];
            const deletedPages1 = entities[1].pages.splice(0, 1);
            const deletedPages2 = entities[2].pages.splice(0, 1);
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1], deletedPages: deletedPages1 },
                { operation: 'update', documentId: entities[2].id, update: entities[2], deletedPages: deletedPages2 }
            );

            testPageDeleteEffect(pages, updates, affectedEntities);
        });

        function testPageDeleteEffect(pages: IdpDocumentPage[], updates: DocumentStateUpdate[], affectedEntities: DocumentEntity[]) {
            setMockStoreState(affectedEntities);

            const action = userActions.pageDelete({
                docAction: IdpDocumentAction.Delete,
                canUndoAction: true,
                pages,
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: jasmine.stringMatching(/IDP_CLASS_VERIFICATION\.USER_FEEDBACK\.PAGE_DELETE_SUCCESS.*/),
                messageArgs: jasmine.any(Object),
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.deletePageEffect$).toBeObservable(expected);
        }

        it('should return document operation error on pages delete if context document cannot be found', () => {
            const documents = mockIdpDocuments();
            const pages = [documents[2].pages[0], documents[3].pages[0]];

            setMockStoreState([]);

            const action = userActions.pageDelete({
                docAction: IdpDocumentAction.Delete,
                canUndoAction: true,
                pages,
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_DELETE_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.deletePageEffect$).toBeObservable(expected);
        });

        it("should delete documents on pages delete if all it's pages are deleted", () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [...documents[2].pages, ...documents[3].pages];
            entities[3].isGenerated = true;

            const affectedEntities = cloneDeep([entities[2], entities[3]]);

            const updates: DocumentStateUpdate[] = [];
            const deletedPages1 = cloneDeep(entities[2].pages);
            entities[2].pages = [];
            entities[2].markAsDeleted = true;
            updates.push(
                { operation: 'update', documentId: entities[2].id, update: entities[2], deletedPages: deletedPages1 },
                { operation: 'delete', documentId: entities[3].id }
            );

            testPageDeleteEffect(pages, updates, affectedEntities);
        });

        it('should throw an error when page does not exist in any of the affected documents on pages delete', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const badPage1 = cloneDeep(documents[2].pages[0]);
            badPage1.documentId = 'bad_document_id';
            const badPage2 = cloneDeep(documents[2].pages[0]);
            badPage2.id = 'bad_page_id';
            const pages = [documents[2].pages[0], badPage1, badPage2];

            setMockStoreState(cloneDeep([entities[2]]));

            const action = userActions.pageDelete({
                docAction: IdpDocumentAction.Delete,
                canUndoAction: true,
                pages,
            });

            actions$ = hot('-a-', { a: action });
            const expected = cold('-#-', {}, jasmine.stringMatching(/.+/));

            expect(effects.deletePageEffect$).toBeObservable(expected);
        });

        it('should delete single page', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0]];

            const affectedEntities = cloneDeep([entities[1]]);

            const updates: DocumentStateUpdate[] = [];
            const deletedPages1 = entities[1].pages.splice(0, 1);
            updates.push({ operation: 'update', documentId: entities[1].id, update: entities[1], deletedPages: deletedPages1 });

            testPageDeleteEffect(pages, updates, affectedEntities);
        });
    });

    describe('Document Resolve', () => {
        it('should resolve documents', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];

            const affectedEntities = cloneDeep([entities[1], entities[2]]);

            const updates: DocumentStateUpdate[] = [];
            entities[1].markAsResolved = true;
            entities[1].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[1].rejectedReasonId = undefined;
            entities[2].markAsResolved = true;
            entities[2].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[2].rejectedReasonId = undefined;
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1] },
                { operation: 'update', documentId: entities[2].id, update: entities[2] }
            );

            setMockStoreState(affectedEntities);

            const action = userActions.documentResolve({
                docAction: IdpDocumentAction.Resolve,
                canUndoAction: true,
                pages,
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.RESOLVE_SUCCESS',
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.documentResolveEffect$).toBeObservable(expected);
        });

        it('should return document operation error on documents resolve if context document cannot be found', () => {
            const documents = mockIdpDocuments();
            const pages = [documents[2].pages[0], documents[3].pages[0]];

            setMockStoreState([]);

            const action = userActions.documentResolve({
                docAction: IdpDocumentAction.Resolve,
                canUndoAction: true,
                pages,
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.RESOLVE_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.documentResolveEffect$).toBeObservable(expected);
        });
    });

    describe('Document Reject', () => {
        it('should reject documents', () => {
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);
            const pages = [documents[1].pages[0], documents[2].pages[0]];

            const affectedEntities = cloneDeep([entities[1], entities[2]]);

            const updates: DocumentStateUpdate[] = [];
            entities[1].classificationConfidence = 1;
            entities[1].markAsResolved = false;
            entities[1].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[1].rejectedReasonId = 'rr1';
            entities[1].rejectNote = 'Rejected!';
            entities[2].classificationConfidence = 1;
            entities[2].markAsResolved = false;
            entities[2].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[2].rejectedReasonId = 'rr1';
            entities[2].rejectNote = 'Rejected!';
            updates.push(
                { operation: 'update', documentId: entities[1].id, update: entities[1] },
                { operation: 'update', documentId: entities[2].id, update: entities[2] }
            );

            setMockStoreState(affectedEntities);

            const action = userActions.documentReject({
                docAction: IdpDocumentAction.Reject,
                canUndoAction: true,
                pages,
                rejectReasonId: 'rr1',
                rejectNote: 'Rejected!',
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.REJECT_SUCCESS',
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.documentRejectEffect$).toBeObservable(expected);
        });

        it('should return document operation error on documents reject if context document cannot be found', () => {
            const documents = mockIdpDocuments();
            const pages = [documents[2].pages[0], documents[3].pages[0]];

            setMockStoreState([]);

            const action = userActions.documentReject({
                docAction: IdpDocumentAction.Reject,
                canUndoAction: true,
                pages,
                rejectReasonId: 'rr1',
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.REJECT_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.documentRejectEffect$).toBeObservable(expected);
        });
    });

    describe('Document Class Change', () => {
        it('should change class for multiple documents', () => {
            const classes = mockIdpConfigClasses();
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);

            setMockStoreState(cloneDeep(entities), classes);

            const pages = [documents[0].pages[0], documents[1].pages[0]];
            const targetClass = classes[3];

            const updates: DocumentStateUpdate[] = [];
            entities[0].class = targetClass;
            entities[0].classificationConfidence = 1;
            entities[0].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[0].rejectedReasonId = undefined;
            entities[0].markAsResolved = false;
            entities[1].class = targetClass;
            entities[1].classificationConfidence = 1;
            entities[1].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[1].rejectedReasonId = undefined;
            entities[1].markAsResolved = false;
            updates.push(
                { operation: 'update', documentId: entities[0].id, update: entities[0] },
                { operation: 'update', documentId: entities[1].id, update: entities[1] }
            );

            testClassChangeEffect(pages, targetClass, updates);
        });

        function testClassChangeEffect(pages: IdpDocumentPage[], targetClass: IdpConfigClass, updates: DocumentStateUpdate[]) {
            const action = userActions.documentClassChange({
                docAction: IdpDocumentAction.ChangeClass,
                canUndoAction: true,
                pages,
                classId: targetClass.id,
            });

            const outcome = systemActions.documentOperationSuccess({
                docAction: action.docAction,
                canUndoAction: action.canUndoAction,
                updates,
                contextPageIds: pages.map((p) => p.id),
                notificationMessage: jasmine.stringMatching(/IDP_CLASS_VERIFICATION\.USER_FEEDBACK\.CHANGE_CLASS_SUCCESS.*/),
                messageArgs: jasmine.any(Object),
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.classChangeEffect$).toBeObservable(expected);
        }

        it('should change class for single document', () => {
            const classes = mockIdpConfigClasses();
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);

            setMockStoreState(cloneDeep(entities), classes);

            const pages = [documents[0].pages[0]];
            const targetClass = classes[3];

            const updates: DocumentStateUpdate[] = [];
            entities[0].class = targetClass;
            entities[0].classificationConfidence = 1;
            entities[0].verificationStatus = IdpVerificationStatus.ManualValid;
            entities[0].rejectedReasonId = undefined;
            entities[0].markAsResolved = false;
            updates.push({ operation: 'update', documentId: entities[0].id, update: entities[0] });

            testClassChangeEffect(pages, targetClass, updates);
        });

        it('should return document operation error on class change if target class cannot be found', () => {
            const classes = mockIdpConfigClasses();
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);

            setMockStoreState(cloneDeep(entities), []);

            const pages = [documents[0].pages[0]];
            const targetClass = classes[3];

            const action = userActions.documentClassChange({
                docAction: IdpDocumentAction.ChangeClass,
                canUndoAction: true,
                pages,
                classId: targetClass.id,
            });

            const outcome = systemActions.documentOperationError({
                docAction: action.docAction,
                error: jasmine.any(String),
                notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.CHANGE_CLASS_ERROR',
            } as any);

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.classChangeEffect$).toBeObservable(expected);
        });

        it('should set verification status to invalid on change class when changing class to unclassified', () => {
            const classes = mockIdpConfigClasses();
            const documents = mockIdpDocuments();
            const entities = mockDocumentEntitiesByIdpDocuments(documents);

            setMockStoreState(cloneDeep(entities), classes);

            const pages = [documents[0].pages[0]];
            const targetClass = classes[1];

            const updates: DocumentStateUpdate[] = [];
            entities[0].class = targetClass;
            entities[0].classificationConfidence = 1;
            entities[0].verificationStatus = IdpVerificationStatus.ManualInvalid;
            entities[0].rejectedReasonId = undefined;
            entities[0].markAsResolved = false;
            updates.push({ operation: 'update', documentId: entities[0].id, update: entities[0] });

            testClassChangeEffect(pages, targetClass, updates);
        });
    });

    it('should show notification on document operation success', () => {
        const action = systemActions.documentOperationSuccess({
            notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_SUCCESS',
            messageArgs: { arg: 'Page 0_0' },
        } as any);

        const outcome = systemActions.notificationShow({
            severity: 'success',
            message: action.notificationMessage,
            messageArgs: action.messageArgs,
        });

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.documentOpSuccessEffect$).toBeObservable(expected);
    });

    it('should show notification on document operation error', () => {
        const action = systemActions.documentOperationError({
            notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_ERROR',
            error: { name: 'Error 1', message: 'Error happened!', stack: 'Right here at line 1' },
        } as any);

        const outcome = systemActions.notificationShow({
            severity: 'error',
            message: action.notificationMessage,
            messageArgs: { error: action.error },
        });

        const spyConsoleError = spyOn(console, 'error');

        actions$ = hot('       -a-', { a: action });
        const expected = cold('-b-', { b: outcome });

        expect(effects.documentOpErrorEffect$).toBeObservable(expected);
        expect(spyConsoleError).toHaveBeenCalled();
    });

    describe('Task Data Output', () => {
        it('should update task data', () => {
            const classes = mockIdpConfigClasses();
            const initialDocuments = mockDocumentEntities();

            const initialDocumentsTaskData: IdpTaskData = mapTaskData(initialDocuments);
            initialDocumentsTaskData.batchState.documents[0].classificationReviewStatus = 'ReviewRequired';

            const updatedDocuments = cloneDeep(initialDocuments);

            updatedDocuments[0].class = classes[1];

            updatedDocuments[1].markAsDeleted = true;

            const deletedPages = [updatedDocuments[2].pages[1], updatedDocuments[2].pages[2]];
            updatedDocuments[2].pages = [updatedDocuments[2].pages[0]];
            updatedDocuments[2].pages[0].rotation = 90;
            updatedDocuments[2].verificationStatus = IdpVerificationStatus.ManualValid;

            updatedDocuments[3].rejectedReasonId = 'Invalid';

            store.overrideSelector(selectDocumentsRawState, updatedDocuments);
            store.overrideSelector(selectTaskInputData, initialDocumentsTaskData);
            store.overrideSelector(selectDeletedPages, deletedPages);

            const updatedTaskData: IdpTaskData = mapTaskData(updatedDocuments);
            updatedTaskData.batchState.deletedPages = deletedPages.map((page) => ({
                contentFileReferenceIndex: page.contentFileReferenceIndex,
                sourcePageIndex: page.sourcePageIndex,
                rotation: page.rotation ?? 0,
            }));
            updatedTaskData.batchState.hasRejectedDocuments = true;
            updatedTaskData.batchState.separationStatus = 'ReviewRequired';
            updatedTaskData.batchState.classificationStatus = 'ReviewRequired';

            updatedTaskData.batchState.documents[0].classificationReviewStatus = 'ReviewRequired';
            updatedTaskData.batchState.documents[0].reprocess = false;
            updatedTaskData.batchState.documents[1].reprocess = true;
            updatedTaskData.batchState.documents[1].classificationReviewStatus = 'ReviewNotRequired';
            updatedTaskData.batchState.documents[2].reprocess = true;

            const outcome = systemActions.updateDocumentsRotation({
                taskAction: 'Save',
                taskData: updatedTaskData,
                openNextTask: undefined,
            });

            actions$ = hot('       -a-', { a: systemActions.taskPrepareUpdate({ taskAction: 'Save' }) });
            const expected = cold('-b-', { b: outcome });

            expect(effects.taskDataEffect$).toBeObservable(expected);
        });

        function mapTaskDataDocument(document: DocumentEntity): [ApiDocument, IdpDocumentClassDefinition | undefined, ContentFileReference[]] {
            const { class: _class, verificationStatus, rejectedReasonId, isGenerated, markAsDeleted, ...rest } = document;
            const tdDocument = {
                ...rest,
                classId: document.class?.id,
                className: document.class?.name,
                rejectReasonId: document.rejectedReasonId,
                rejectNote: document.rejectNote,
                markAsRejected: !!document.rejectedReasonId,
                pages: document.pages.map((page) => ({
                    contentFileReferenceIndex: 0,
                    sourcePageIndex: page.sourcePageIndex,
                    rotation: page.rotation ?? 0,
                })),
                classificationReviewStatus: undefined,
            };

            const tdDocumentClassDefinition = document.class
                ? {
                      id: document.class.id,
                      name: document.class.name,
                      description: document.class.name,
                  }
                : undefined;

            const tdContentFileReferences = document.pages.reduce((acc, page) => {
                acc[page.contentFileReferenceIndex] = { sys_id: page.fileReference };
                return acc;
            }, [] as ContentFileReference[]);

            return [tdDocument, tdDocumentClassDefinition, tdContentFileReferences];
        }

        it('should update task data as classified', () => {
            const taskData: IdpTaskData = {
                batchState: {
                    documents: [
                        {
                            id: 'd_cf3',
                            name: 'Document 3',
                            classId: 'payslips',
                            classificationConfidence: 99,
                            pages: [
                                { contentFileReferenceIndex: 0, sourcePageIndex: 0, rotation: 0 },
                                { contentFileReferenceIndex: 0, sourcePageIndex: 1, rotation: 0 },
                            ],
                        },
                    ],
                    contentFileReferences: [{ sys_id: 'cf1' }, { sys_id: 'cf2' }],
                },
                rejectReasons: [],
                configuration: {
                    classificationConfidenceThreshold: 0.9,
                    documentClassDefinitions: [
                        { id: 'payslips', name: 'Payslips', description: "Yup! It's Payslips." },
                        { id: 'contracts', name: 'Contracts', description: 'Contracts.' },
                    ],
                },
            };

            const document = mockDocumentEntities()[2];
            document.verificationStatus = IdpVerificationStatus.ManualValid;

            const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

            store.overrideSelector(selectDocumentsRawState, [document]);
            store.overrideSelector(selectTaskInputData, taskData);
            store.overrideSelector(selectDeletedPages, []);

            const outcome = jasmine.objectContaining({
                taskData: jasmine.objectContaining({
                    batchState: jasmine.objectContaining({
                        separationStatus: 'Separated',
                        classificationStatus: 'Classified',
                    }),
                }),
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.taskDataEffect$).toBeObservable(expected);
        });

        it('should return task data update error if task data cannot be selected', () => {
            const entities = mockDocumentEntities();

            const action = systemActions.taskPrepareUpdate({ taskAction: 'Save' });

            store.overrideSelector(selectDocumentsRawState, [entities[1]]);
            // eslint-disable-next-line unicorn/no-useless-undefined
            store.overrideSelector(selectTaskInputData, undefined);

            const outcome = systemActions.taskPrepareUpdateError({
                taskAction: 'Save',
                error: 'Task data not found',
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.taskDataEffect$).toBeObservable(expected);
        });

        it('should update task data as classification awaiting', () => {
            const document = mockDocumentEntities()[2];
            document.verificationStatus = IdpVerificationStatus.ManualValid;

            const action = systemActions.taskPrepareUpdate({ taskAction: 'Save' });

            store.overrideSelector(selectDocumentsRawState, [document]);
            store.overrideSelector(selectTaskInputData, mapTaskData([document]));
            store.overrideSelector(selectDeletedPages, []);

            const outcome = jasmine.objectContaining({
                taskData: jasmine.objectContaining({
                    batchState: jasmine.objectContaining({
                        classificationStatus: 'Awaiting',
                    }),
                }),
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.taskDataEffect$).toBeObservable(expected);
        });

        describe('should handle task data extraction status updates', () => {
            const classes = mockIdpConfigClasses();
            const shouldSetCases = [
                { initialClass: classes[2], newClass: classes[3] },
                { initialClass: classes[2], newClass: classes[1] },
            ];

            for (const { initialClass, newClass } of shouldSetCases) {
                it(`should set awaiting when initial class is ${getClassName(initialClass)} and new class is ${getClassName(newClass)}`, () => {
                    testTaskDataExtractionStatus('ReviewRequired', 'Awaiting', initialClass, newClass);
                });
            }

            const shouldNotSetCases = [
                { initialClass: undefined, newClass: classes[1] },
                { initialClass: classes[1], newClass: undefined },
            ];

            for (const { initialClass, newClass } of shouldNotSetCases) {
                it(`should not set status when initial class is ${getClassName(initialClass)} and new class is ${getClassName(newClass)}`, () => {
                    testTaskDataExtractionStatus('ReviewRequired', 'ReviewRequired', initialClass, newClass);
                });
            }

            function testTaskDataExtractionStatus(
                initialStatus: 'Awaiting' | 'Extracted' | 'ReviewRequired' | undefined,
                newStatus: string,
                initialClass: IdpConfigClass | undefined,
                newClass: IdpConfigClass | undefined
            ) {
                const document = mockDocumentEntities()[2];
                document.verificationStatus = IdpVerificationStatus.ManualValid;
                document.class = initialClass;

                const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

                store.overrideSelector(selectDocumentsRawState, [{ ...document, class: newClass }]);
                store.overrideSelector(selectTaskInputData, mapTaskData([document], { batchState: { extractionStatus: initialStatus } }));
                store.overrideSelector(selectDeletedPages, []);

                const outcome = jasmine.objectContaining({
                    taskData: jasmine.objectContaining({
                        batchState: jasmine.objectContaining({
                            extractionStatus: newStatus,
                        }),
                    }),
                });

                actions$ = hot('       -a-', { a: action });
                const expected = cold('-b-', { b: outcome });

                expect(effects.taskDataEffect$).toBeObservable(expected);
            }

            function getClassName(documentClass: IdpConfigClass | undefined): string {
                return documentClass ? documentClass.name : 'undefined';
            }
        });

        function mapTaskData(documents: DocumentEntity[], options?: { batchState?: Partial<ClassVerificationBatchState> }): IdpTaskData {
            documents = documents.filter((document) => !document.markAsDeleted);

            const { batchState } = options || {};

            const tdDocuments = [];
            const tdContentFileReferences = [];
            const tdDocumentClassDefinitions = [];
            for (const document of documents) {
                const [tdDocument, tdDocumentClassDefinition, tdDocumentContentFileReferences] = mapTaskDataDocument(document);
                tdDocuments.push(tdDocument);
                if (
                    tdDocumentClassDefinition &&
                    tdDocumentClassDefinition.id !== UNCLASSIFIED_CLASS_ID &&
                    tdDocumentClassDefinitions.findIndex((c) => c.id === tdDocumentClassDefinition.id) === -1
                ) {
                    tdDocumentClassDefinitions.push(tdDocumentClassDefinition);
                }
                for (const [index, contentFileReference] of tdDocumentContentFileReferences.entries()) {
                    tdContentFileReferences[index] = contentFileReference;
                }
            }

            return {
                batchState: {
                    ...batchState,
                    documents: [...tdDocuments, ...(batchState?.documents ?? [])],
                    contentFileReferences: [...tdContentFileReferences, ...(batchState?.contentFileReferences ?? [])],
                },
                rejectReasons: [],
                configuration: {
                    classificationConfidenceThreshold: 0.9,
                    documentClassDefinitions: tdDocumentClassDefinitions,
                },
            };
        }

        it('should retain task data external document properties', () => {
            const document = mockDocumentEntities()[2];
            document.verificationStatus = IdpVerificationStatus.ManualValid;

            const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

            store.overrideSelector(selectDocumentsRawState, [document]);

            const expectedTaskDataDocumentFieldsProperty = [
                { name: 'field1', value: 'value1', type: 'text' },
                { name: 'field2', value: 'value2', type: 'number' },
            ];
            const mappedTaskData = mapTaskData([document]);
            (mappedTaskData.batchState.documents[0] as any).fields = expectedTaskDataDocumentFieldsProperty;
            store.overrideSelector(selectTaskInputData, mappedTaskData);

            store.overrideSelector(selectDeletedPages, []);

            const outcome = jasmine.objectContaining({
                taskData: jasmine.objectContaining({
                    batchState: jasmine.objectContaining({
                        documents: jasmine.arrayContaining([
                            jasmine.objectContaining({
                                fields: expectedTaskDataDocumentFieldsProperty,
                            }),
                        ]),
                    }),
                }),
            });

            actions$ = hot('       -a-', { a: action });
            const expected = cold('-b-', { b: outcome });

            expect(effects.taskDataEffect$).toBeObservable(expected);
        });

        it('should not retain task data external document properties when document changed', () => {
            const classes = mockIdpConfigClasses();
            const document = mockDocumentEntities()[2];
            document.verificationStatus = IdpVerificationStatus.ManualValid;
            document.class = classes[2];

            const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

            store.overrideSelector(selectDocumentsRawState, [{ ...document, class: classes[3] }]);

            const mappedTaskData = mapTaskData([document]);
            (mappedTaskData.batchState.documents[0] as any).fields = [
                { name: 'field1', value: 'value1', type: 'text' },
                { name: 'field2', value: 'value2', type: 'number' },
            ];
            store.overrideSelector(selectTaskInputData, mappedTaskData);

            store.overrideSelector(selectDeletedPages, []);

            actions$ = hot('-a-', { a: action });

            effects.taskDataEffect$.subscribe((result) => {
                switch (result.type) {
                    case systemActions.updateDocumentsRotation.type: {
                        expect((result.taskData.batchState.documents[0] as any).fields).toBeUndefined();
                        break;
                    }
                    default: {
                        fail(`Expected success action, but got: ${result.type}`);
                        break;
                    }
                }
            });

            getTestScheduler().flush();
        });

        it('should not retain task data document transient properties on task complete', () => {
            const document = mockDocumentEntities()[2];

            const action = systemActions.taskPrepareUpdate({ taskAction: 'Complete' });

            store.overrideSelector(selectDocumentsRawState, [document]);

            const mappedTaskData = mapTaskData([document]);
            mappedTaskData.batchState.documents[0].reprocess = true;
            store.overrideSelector(selectTaskInputData, mappedTaskData);

            store.overrideSelector(selectDeletedPages, []);

            actions$ = hot('-a-', { a: action });

            effects.taskDataEffect$.subscribe((result) => {
                switch (result.type) {
                    case systemActions.updateDocumentsRotation.type: {
                        expect(result.taskData.batchState.documents[0].reprocess).toBeUndefined();
                        break;
                    }
                    default: {
                        fail(`Expected success action, but got: ${result.type}`);
                        break;
                    }
                }
            });

            getTestScheduler().flush();
        });

        describe('updateRotationEffect$', () => {
            it('should call updateRotationData$ and dispatch taskPrepareUpdateSuccess on Save/Complete', () => {
                const taskData: any = {
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

                const allDocuments: IdpDocument[] = [
                    {
                        id: 'd_cf1',
                        name: 'Document 1',
                        class: undefined,
                        verificationStatus: IdpVerificationStatus.AutoInvalid,
                        classificationConfidence: 0,
                        pages: [
                            {
                                id: 'p1',
                                name: 'Page 1 of Document 1',
                                documentId: 'd_cf1',
                                sourcePageIndex: 0,
                                rotation: 90,
                                viewerRotation: 0,
                                fileReference: 'cf1',
                            },
                            {
                                id: 'p2',
                                name: 'Page 2 of Document 1',
                                documentId: 'd_cf1',
                                sourcePageIndex: 1,
                                rotation: 180,
                                viewerRotation: 0,
                                fileReference: 'cf1',
                            },
                        ],
                    },
                ];
                const action = systemActions.updateDocumentsRotation({
                    taskAction: 'Save',
                    taskData,
                    openNextTask: false,
                });
                const correlationId = 'corr-id-1';
                const pagesWithIndex = [
                    { contentFileReferenceIndex: 0, pageIndex: 0, rotation: 270 },
                    { contentFileReferenceIndex: 0, pageIndex: 1, rotation: 180 },
                ];
                idpBackendSpy.updateRotationData$.and.returnValue(cold('(a|)', { a: undefined }));

                store.overrideSelector(selectCorrelationId, correlationId);
                store.overrideSelector(selectAllDocuments, allDocuments);

                actions$ = hot('-a-', { a: action });
                const outcome = systemActions.taskPrepareUpdateSuccess({
                    taskAction: 'Save',
                    taskData,
                    openNextTask: false,
                });

                const expected = cold('-b-', { b: outcome });

                expect(effects.updateRotationEffect$).toBeObservable(expected);
                expect(idpBackendSpy.updateRotationData$).toHaveBeenCalledWith(correlationId, ['cf1', 'cf2'], pagesWithIndex);
                expect(idpSharedImageServiceSpy.cleanup).toHaveBeenCalled();
            });

            it('should not call updateRotationData$ if fileReferences is empty', () => {
                const taskData: any = {
                    batchState: {
                        contentFileReferences: [],
                        documents: [],
                    },
                };
                const action = systemActions.updateDocumentsRotation({
                    taskAction: 'Save',
                    taskData,
                    openNextTask: false,
                });
                store.overrideSelector(selectCorrelationId, 'corr-id-2');
                store.overrideSelector(selectAllDocuments, []);

                actions$ = hot('-a-', { a: action });
                const outcome = systemActions.taskPrepareUpdateSuccess({
                    taskAction: 'Save',
                    taskData,
                    openNextTask: false,
                });

                const expected = cold('-b-', { b: outcome });

                expect(effects.updateRotationEffect$).toBeObservable(expected);
            });

            it('should not call updateRotationData$ if taskAction is not Save/Complete', () => {
                const taskData: any = {
                    batchState: {
                        contentFileReferences: [{ sys_id: 'cf1' }],
                        documents: [],
                    },
                };
                const action = systemActions.updateDocumentsRotation({
                    taskAction: 'Claim',
                    taskData,
                    openNextTask: false,
                });
                store.overrideSelector(selectCorrelationId, 'corr-id-3');
                store.overrideSelector(selectAllDocuments, []);

                actions$ = hot('-a-', { a: action });
                const outcome = systemActions.taskPrepareUpdateSuccess({
                    taskAction: 'Claim',
                    taskData,
                    openNextTask: false,
                });
                const expected = cold('-b-', { b: outcome });

                expect(effects.updateRotationEffect$).toBeObservable(expected);
            });

            it('should dispatch taskPrepareUpdateError on updateRotationData$ error', () => {
                const taskData: any = {
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
                const allDocuments: IdpDocument[] = [
                    {
                        id: 'd_cf1',
                        name: 'Document 1',
                        class: undefined,
                        verificationStatus: IdpVerificationStatus.AutoInvalid,
                        classificationConfidence: 0,
                        pages: [
                            {
                                id: 'p1',
                                name: 'Page 1 of Document 1',
                                documentId: 'd_cf1',
                                sourcePageIndex: 0,
                                rotation: 90,
                                viewerRotation: 0,
                                fileReference: 'cf1',
                            },
                        ],
                    },
                ];
                const action = systemActions.updateDocumentsRotation({
                    taskAction: 'Save',
                    taskData,
                    openNextTask: false,
                });
                const correlationId = 'corr-id-4';
                idpBackendSpy.updateRotationData$.and.returnValue(cold('#', {}, new Error('fail')));

                store.overrideSelector(selectCorrelationId, correlationId);
                store.overrideSelector(selectAllDocuments, allDocuments);

                actions$ = hot('-a-', { a: action });
                const expected = cold('-b-', {
                    b: systemActions.taskPrepareUpdateError({
                        taskAction: 'Save',
                        error: 'Failed to update rotation data',
                    }),
                });

                expect(effects.updateRotationEffect$).toBeObservable(expected);
                expect(idpSharedImageServiceSpy.cleanup).toHaveBeenCalled();
            });
        });
    });
});
