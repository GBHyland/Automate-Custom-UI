/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { ClassVerificationRootState } from '../states/root.state';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { ApiDocument, ClassVerificationBatchState, TransientApiDocument } from '../../models/contracts/class-verification-models';
import { catchError, concatMap, finalize, map, of, switchMap } from 'rxjs';
import { DocumentEntity, isDocumentValid } from '../states/document.state';
import { selectAllDocuments, selectClassById, selectDocumentEntityStateForIds, selectDocumentsRawState } from '../selectors/document.selectors';
import { DocumentStateUpdate } from '../models/document-state-updates';
import { v4 } from 'uuid';
import { cloneDeep } from 'es-toolkit/compat';
import { selectCorrelationId, selectTaskInputData } from '../selectors/screen.selectors';
import { IdpBackendService, IdpSharedImageLoadingService, IdpVerificationStatus } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { selectDeletedPages } from '../selectors/document-page.selectors';
import { DocumentPageEntity } from '../states/document-page.state';
import { IdpDocumentPage, UNCLASSIFIED_CLASS_ID } from '../../models/screen-models';

@Injectable()
export class DocumentEffects {
    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<ClassVerificationRootState>,
        private readonly idpBackendService: IdpBackendService,
        private readonly idpImageLoadingService: IdpSharedImageLoadingService
    ) {}

    loadDocumentEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadSuccess),
            map(({ taskData }) => {
                const availableClasses = taskData?.configuration?.documentClassDefinitions || [];
                const taskDocuments = taskData.batchState?.documents || [];
                const documents: DocumentEntity[] = taskDocuments.map((taskDoc) => {
                    const associatedClass = availableClasses.find((c) => c.id === taskDoc.classId);
                    const docClass = associatedClass ? { ...associatedClass, isSpecialClass: false } : undefined;

                    return {
                        id: taskDoc.id,
                        name: taskDoc.name || taskDoc.id,
                        class: docClass,
                        classificationConfidence: taskDoc.classificationConfidence || 0,
                        markAsDeleted: taskDoc.markAsDeleted || false,
                        rejectedReasonId: taskDoc.markAsRejected === true ? taskDoc.rejectReasonId : undefined,
                        verificationStatus:
                            taskDoc.classificationReviewStatus === 'ReviewRequired'
                                ? IdpVerificationStatus.AutoInvalid
                                : IdpVerificationStatus.AutoValid,
                        isGenerated: false,
                        pages: taskDoc.pages.map((taskPage) => {
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
                });

                return systemActions.createDocuments({ documents });
            })
        )
    );

    mergePageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageMerge),
            concatLatestFrom(({ pages, targetDocumentId }) => {
                const uniqueDocumentIds = [...new Set<string>([targetDocumentId, ...pages.map((p) => p.documentId)])];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, targetDocumentId }, contextDocuments]) => {
                const targetDocument = cloneDeep(contextDocuments.find((d) => d.id === targetDocumentId));
                if (!targetDocument) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Merge - Target document not found ${targetDocumentId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, typeof targetDocument> = {};
                const documentsToDelete: Array<typeof targetDocument> = [];

                for (const page of pages) {
                    if (page.documentId === targetDocumentId) {
                        continue;
                    }

                    const sourceDocument = affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Merge - Page not found ${page.id}`);
                    }

                    const pageState = sourceDocument.pages.splice(pageIndex, 1)[0];
                    targetDocument.pages.push(pageState);

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    {
                        operation: 'update',
                        documentId: targetDocumentId,
                        update: targetDocument,
                    },
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_MERGE_SUCCESS';
                const messageArgs = { pageCount: pages.length, documentName: targetDocument.name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    splitPageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageSplit),
            concatLatestFrom(({ pages, createAfterDocId }) => {
                const targetDocId = createAfterDocId || pages[0].documentId;
                const uniqueDocumentIds = [...new Set<string>([targetDocId, ...pages.map((p) => p.documentId)])];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, createAfterDocId }, contextDocuments]) => {
                const targetDocId = createAfterDocId || pages[0].documentId;
                const createAfterDocument = cloneDeep(contextDocuments.find((d) => d.id === targetDocId));
                if (!createAfterDocument) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Split - Target document not found ${targetDocId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_SPLIT_ERROR',
                    });
                }

                const newDocument: DocumentEntity = {
                    ...createAfterDocument,
                    id: this.uuid(),
                    name: `${createAfterDocument.name}_split`,
                    pages: [],
                    isGenerated: true,
                };

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, typeof createAfterDocument> = {};
                const documentsToDelete: Array<typeof createAfterDocument> = [];

                for (const page of pages) {
                    const sourceDocument = affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Split - Page not found ${page.id}`);
                    }

                    const pageToSplit = sourceDocument.pages.splice(pageIndex, 1)[0];
                    newDocument.pages.push(pageToSplit);

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    {
                        operation: 'create',
                        documentId: newDocument.id,
                        createAfterDocId: targetDocId,
                        update: newDocument,
                    },
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_SPLIT_SUCCESS_' + (pages.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { arg: pages.length > 1 ? pages.length : pages[0].name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    uuid(): string {
        return v4();
    }

    movePageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageMove),
            concatLatestFrom(({ pages, targetDocumentId }) => {
                const uniqueDocumentIds = [...new Set<string>([targetDocumentId, ...pages.map((p) => p.documentId)])];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, targetDocumentId, targetIndex }, contextDocuments]) => {
                const targetDocument = cloneDeep(contextDocuments.find((d) => d.id === targetDocumentId));
                if (!targetDocument) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Move Page - Target document not found ${targetDocumentId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.MOVE_PAGE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, typeof targetDocument> = {};
                const documentsToDelete: Array<typeof targetDocument> = [];

                for (const page of pages) {
                    const sourceDocument =
                        page.documentId === targetDocumentId
                            ? targetDocument
                            : affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Move Page - Page not found ${page.id}`);
                    }

                    const pageToMove = sourceDocument.pages.splice(pageIndex, 1)[0];
                    targetDocument.pages.splice(targetIndex, 0, pageToMove);
                    targetIndex += 1;

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                    };
                });

                updates.push(
                    {
                        operation: 'update',
                        documentId: targetDocumentId,
                        update: targetDocument,
                    },
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.MOVE_PAGE_SUCCESS_' + (pages.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { arg: pages.length > 1 ? pages.length : pages[0].name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    deletePageEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.pageDelete),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages }, contextDocuments]) => {
                if (contextDocuments.length === 0) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: 'Delete Page - No documents found',
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_DELETE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const affectedDocuments: Record<string, DocumentEntity> = {};
                const documentsToDelete: DocumentEntity[] = [];
                const affectedDocumentDeletedPages: Record<string, DocumentPageEntity[]> = {};

                for (const page of pages) {
                    const sourceDocument = affectedDocuments[page.documentId] || cloneDeep(contextDocuments.find((d) => d.id === page.documentId));
                    const pageIndex = sourceDocument?.pages.findIndex((p) => p.id === page.id);
                    if (!sourceDocument || pageIndex === -1) {
                        throw new Error(`Delete Page - Page not found ${page.id}`);
                    }

                    const sourceDocumentDeletedPages = sourceDocument.pages.splice(pageIndex, 1);
                    if (affectedDocumentDeletedPages[sourceDocument.id]) {
                        affectedDocumentDeletedPages[sourceDocument.id].push(...sourceDocumentDeletedPages);
                    } else {
                        affectedDocumentDeletedPages[sourceDocument.id] = sourceDocumentDeletedPages;
                    }

                    // delete documents with no pages
                    let deleteSourceDocument = false;
                    if (sourceDocument.pages.length === 0) {
                        if (sourceDocument.isGenerated) {
                            documentsToDelete.push(sourceDocument);
                            deleteSourceDocument = true;
                        } else {
                            sourceDocument.markAsDeleted = true;
                        }
                    }

                    if (!deleteSourceDocument) {
                        affectedDocuments[sourceDocument.id] = sourceDocument;
                    }
                }

                const updates: DocumentStateUpdate[] = Object.entries(affectedDocuments).map(([documentId, document]) => {
                    return {
                        operation: 'update',
                        documentId,
                        update: document,
                        deletedPages: affectedDocumentDeletedPages[documentId],
                    };
                });

                updates.push(
                    ...documentsToDelete.map((d) => ({
                        operation: 'delete' as const,
                        documentId: d.id,
                    }))
                );

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.PAGE_DELETE_SUCCESS_' + (pages.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { arg: pages.length > 1 ? pages.length : pages[0].name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    documentResolveEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.documentResolve),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages }, contextDocuments]) => {
                if (contextDocuments.length === 0) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: 'Resolve - No documents found',
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.RESOLVE_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const updates: DocumentStateUpdate[] = [];
                for (const doc of contextDocuments) {
                    const updatedDoc = cloneDeep(doc);
                    updatedDoc.markAsResolved = true;
                    updatedDoc.verificationStatus = IdpVerificationStatus.ManualValid;
                    updatedDoc.rejectedReasonId = undefined;
                    updates.push({
                        operation: 'update',
                        documentId: updatedDoc.id,
                        update: updatedDoc,
                    });
                }

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.RESOLVE_SUCCESS';
                return systemActions.documentOperationSuccess({ docAction, canUndoAction, updates, contextPageIds, notificationMessage });
            })
        )
    );

    documentRejectEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.documentReject),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            map(([{ docAction, canUndoAction, pages, rejectReasonId, rejectNote }, contextDocuments]) => {
                if (contextDocuments.length === 0) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: 'Reject - No documents found',
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.REJECT_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const updates: DocumentStateUpdate[] = [];
                for (const doc of contextDocuments) {
                    const updatedDoc = cloneDeep(doc);
                    updatedDoc.classificationConfidence = 1;
                    updatedDoc.markAsResolved = false;
                    updatedDoc.verificationStatus = IdpVerificationStatus.ManualValid;
                    updatedDoc.rejectedReasonId = rejectReasonId;
                    updatedDoc.rejectNote = rejectNote;
                    updates.push({
                        operation: 'update',
                        documentId: updatedDoc.id,
                        update: updatedDoc,
                    });
                }

                const notificationMessage = 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.REJECT_SUCCESS';
                return systemActions.documentOperationSuccess({ docAction, canUndoAction, updates, contextPageIds, notificationMessage });
            })
        )
    );

    classChangeEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.documentClassChange),
            concatLatestFrom(({ pages }) => {
                const uniqueDocumentIds = [...new Set<string>(pages.map((p) => p.documentId))];
                return this.store.select(selectDocumentEntityStateForIds(uniqueDocumentIds));
            }),
            concatLatestFrom(([{ classId }]) => {
                return this.store.select(selectClassById(classId));
            }),
            map(([[{ docAction, canUndoAction, pages, classId }, contextDocuments], documentClass]) => {
                if (!documentClass) {
                    return systemActions.documentOperationError({
                        docAction,
                        error: `Class Change - Not a valid document class ${classId}`,
                        notificationMessage: 'IDP_CLASS_VERIFICATION.USER_FEEDBACK.CHANGE_CLASS_ERROR',
                    });
                }

                const contextPageIds = pages.map((p) => p.id);
                const updates: DocumentStateUpdate[] = [];
                for (const doc of contextDocuments) {
                    const updatedDoc = cloneDeep(doc);
                    updatedDoc.class = documentClass;
                    updatedDoc.classificationConfidence = 1;
                    updatedDoc.verificationStatus =
                        documentClass.id === UNCLASSIFIED_CLASS_ID ? IdpVerificationStatus.ManualInvalid : IdpVerificationStatus.ManualValid;
                    updatedDoc.rejectedReasonId = undefined;
                    updatedDoc.markAsResolved = false;
                    updates.push({
                        operation: 'update',
                        documentId: updatedDoc.id,
                        update: updatedDoc,
                    });
                }

                const notificationMessage =
                    'IDP_CLASS_VERIFICATION.USER_FEEDBACK.CHANGE_CLASS_SUCCESS_' + (contextDocuments.length > 1 ? 'PLURAL' : 'SINGULAR');
                const messageArgs = { className: documentClass.name };

                return systemActions.documentOperationSuccess({
                    docAction,
                    canUndoAction,
                    updates,
                    contextPageIds,
                    notificationMessage,
                    messageArgs,
                });
            })
        )
    );

    documentOpSuccessEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.documentOperationSuccess),
            map(({ notificationMessage, messageArgs }) => {
                return systemActions.notificationShow({ severity: 'success', message: notificationMessage, messageArgs });
            })
        )
    );

    documentOpErrorEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.documentOperationError),
            map(({ error, notificationMessage }) => {
                console.error(error);
                return systemActions.notificationShow({ severity: 'error', message: notificationMessage, messageArgs: { error } });
            })
        )
    );

    taskDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdate),
            concatLatestFrom(() => {
                return this.store.select(selectDocumentsRawState);
            }),
            concatLatestFrom(() => {
                return this.store.select(selectTaskInputData);
            }),
            concatLatestFrom(() => {
                return this.store.select(selectDeletedPages);
            }),
            map(([[[{ taskAction, openNextTask }, documentEntities], taskInputData], deletedPages]) => {
                if (!taskInputData) {
                    return systemActions.taskPrepareUpdateError({ taskAction, error: 'Task data not found' });
                }

                let hasRejectedDocuments = false;
                let anyWithIssue = false;

                const updatedDocuments: ApiDocument[] = documentEntities
                    .filter((document) => !document.markAsDeleted)
                    .map((doc) => {
                        const matchingBatchDocument = taskInputData.batchState.documents.find((batchDocument) => batchDocument.id === doc.id);
                        const updatedReviewStatus =
                            doc.verificationStatus === IdpVerificationStatus.ManualValid
                                ? 'ReviewNotRequired'
                                : matchingBatchDocument?.classificationReviewStatus;
                        const isRejected = Boolean(doc.rejectedReasonId);
                        hasRejectedDocuments ||= isRejected;
                        anyWithIssue ||= !isDocumentValid(doc, taskInputData.configuration.documentClassDefinitions);

                        const update: ApiDocument = {
                            id: doc.id,
                            name: doc.name,
                            markAsRejected: isRejected,
                            markAsResolved: doc.markAsResolved,
                            rejectReasonId: doc.rejectedReasonId,
                            rejectNote: doc.rejectNote,
                            classId: doc.class?.id,
                            className: doc.class?.name,
                            classificationConfidence: doc.classificationConfidence,
                            classificationReviewStatus: updatedReviewStatus,
                            pages: doc.pages.map((page) => {
                                return {
                                    contentFileReferenceIndex: page.contentFileReferenceIndex,
                                    sourcePageIndex: page.sourcePageIndex,
                                    rotation: ((page.rotation ?? 0) + (page.viewerRotation ?? 0)) % 360,
                                };
                            }),
                        };

                        update.reprocess = matchingBatchDocument
                            ? matchingBatchDocument.reprocess || !this.isBatchStateDocumentSame(matchingBatchDocument, update)
                            : true;

                        return update.reprocess ? update : { ...(matchingBatchDocument ?? {}), ...update };
                    });

                const updatedTaskData = cloneDeep(taskInputData);
                updatedTaskData.batchState.documents = updatedDocuments;
                updatedTaskData.batchState.hasRejectedDocuments = hasRejectedDocuments;
                updatedTaskData.batchState.deletedPages = deletedPages.map((page) => ({
                    contentFileReferenceIndex: page.contentFileReferenceIndex,
                    sourcePageIndex: page.sourcePageIndex,
                    rotation: page.rotation ?? 0,
                }));

                if (taskAction === 'Complete') {
                    updatedTaskData.batchState.separationStatus = 'Separated';
                    updatedTaskData.batchState.classificationStatus = 'Classified';
                    if (updatedTaskData.batchState.documents.some((document) => document.reprocess)) {
                        updatedTaskData.batchState.extractionStatus = 'Awaiting';
                    }

                    this.deleteTransientBatchStateProperties(updatedTaskData.batchState);
                } else if (anyWithIssue) {
                    updatedTaskData.batchState.separationStatus = 'ReviewRequired';
                    updatedTaskData.batchState.classificationStatus = 'ReviewRequired';
                } else {
                    updatedTaskData.batchState.classificationStatus = 'Awaiting';
                }

                return systemActions.updateDocumentsRotation({ taskAction, taskData: updatedTaskData, openNextTask });
            })
        )
    );

    private isBatchStateDocumentSame(existing: ApiDocument, updated: ApiDocument) {
        if (
            !this.isBatchStateDocumentClassSame(existing, updated) ||
            existing.rejectReasonId !== updated.rejectReasonId ||
            existing.markAsResolved !== updated.markAsResolved ||
            existing.pages.length !== updated.pages.length
        ) {
            return false;
        }

        for (const existingPage of existing.pages) {
            const updatedPage = updated.pages.find(
                (page) =>
                    page.contentFileReferenceIndex === existingPage.contentFileReferenceIndex && page.sourcePageIndex === existingPage.sourcePageIndex
            );
            if (!updatedPage || updatedPage.rotation !== existingPage.rotation) {
                return false;
            }
        }

        return true;
    }

    private isBatchStateDocumentClassSame(existing: ApiDocument, updated: ApiDocument) {
        return existing.classId === undefined || existing.classId === UNCLASSIFIED_CLASS_ID
            ? updated.classId === undefined || updated.classId === UNCLASSIFIED_CLASS_ID
            : existing.classId === updated.classId;
    }

    private deleteTransientBatchStateProperties(batch: ClassVerificationBatchState): void {
        for (const document of batch.documents) {
            const asTransient = document as TransientApiDocument;
            delete asTransient.reprocess;
        }
    }

    updateRotationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.updateDocumentsRotation),
            concatLatestFrom(() => this.store.select(selectCorrelationId)),
            concatLatestFrom(() => this.store.select(selectAllDocuments)),
            concatMap(([[{ taskAction, taskData, openNextTask }, correlationId], allDocuments]) => {
                const isSaveOrComplete = taskAction === 'Save' || taskAction === 'Complete';
                const fileReferences = [...new Set(taskData.batchState.contentFileReferences.map((ref) => ref.sys_id))];
                if (!isSaveOrComplete || fileReferences.length === 0) {
                    return of(systemActions.taskPrepareUpdateSuccess({ taskAction, taskData, openNextTask }));
                }

                const allDocumentsInTask = taskData.batchState.documents;
                const allPagesState = allDocuments.flatMap((doc) => doc.pages ?? []);

                const pageMap = new Map<string, IdpDocumentPage>();
                for (const page of allPagesState) {
                    pageMap.set(`${page.documentId}_${page.sourcePageIndex}_${page.fileReference}`, page);
                }

                const pagesWithIndex = allDocumentsInTask.flatMap(
                    (doc) =>
                        doc.pages
                            .map((p) => {
                                const fileRef = fileReferences[p.contentFileReferenceIndex];
                                const key = `${doc.id}_${p.sourcePageIndex}_${fileRef}`;
                                const matchedPage = pageMap.get(key);
                                if (!matchedPage) {
                                    return undefined;
                                }
                                return {
                                    contentFileReferenceIndex: p.contentFileReferenceIndex,
                                    pageIndex: p.sourcePageIndex,
                                    rotation: (360 - (p.rotation ?? 0)) % 360,
                                };
                            })
                            .filter(Boolean) as { contentFileReferenceIndex: number; pageIndex: number; rotation: number }[]
                );

                const pages = allPagesState.map((page) => ({
                    pageId: page.id,
                    documentId: page.documentId,
                    viewerRotation: 0,
                }));

                if (pagesWithIndex.length === 0) {
                    this.store.dispatch(userActions.updatePagesRotation({ pages, taskDataSynced: undefined }));
                    return of(systemActions.taskPrepareUpdateSuccess({ taskAction, taskData, openNextTask }));
                }

                return this.idpBackendService.updateRotationData$(correlationId, fileReferences, pagesWithIndex).pipe(
                    map(() => {
                        this.store.dispatch(userActions.updatePagesRotation({ pages, taskDataSynced: undefined }));
                        return systemActions.taskPrepareUpdateSuccess({ taskAction, taskData, openNextTask });
                    }),
                    catchError(() => of(systemActions.taskPrepareUpdateError({ taskAction, error: 'Failed to update rotation data' }))),
                    finalize(() => this.idpImageLoadingService.cleanup())
                );
            })
        )
    );

    uploadedDocumentReceivedMetadataSuccessEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.uploadedDocumentReceivedMetadataSuccess),
            concatLatestFrom(() => this.store.select(selectTaskInputData)),
            switchMap(([{ metadata, uploadedDocument }, taskInputData]) => {
                if (!taskInputData) {
                    return [systemActions.taskPrepareUpdateError({ taskAction: 'Save', error: 'Task data not found' })];
                }

                const updatedTaskData = cloneDeep(taskInputData);

                const document: DocumentEntity = {
                    id: uploadedDocument.id,
                    name: uploadedDocument.fileName,
                    isGenerated: true,
                    verificationStatus: IdpVerificationStatus.AutoValid,
                    classificationConfidence: 0,
                    pages: metadata.pages.map((page: any) => {
                        const pageId = `${uploadedDocument.id}_${page.pageIndex}`;

                        return {
                            id: pageId,
                            name: `Page ${pageId}`,
                            rotation: page.rotation,
                            sourcePageIndex: page.pageIndex,
                            fileReference: uploadedDocument.sysId ?? '',
                            contentFileReferenceIndex: updatedTaskData?.batchState.contentFileReferences.length,
                        };
                    }),
                };

                updatedTaskData?.batchState.documents.push({
                    id: document.id,
                    name: document.name,
                    markAsDeleted: false,
                    markAsRejected: false,
                    markAsResolved: false,
                    classificationConfidence: 0,
                    pages: document.pages.map((page) => ({
                        contentFileReferenceIndex: updatedTaskData?.batchState.contentFileReferences.length,
                        sourcePageIndex: page.sourcePageIndex,
                        rotation: page.rotation,
                    })),
                });

                updatedTaskData.batchState.contentFileReferences.push({
                    sys_id: uploadedDocument.sysId ?? '',
                    sysfile_blob: undefined,
                });

                return [
                    systemActions.taskPrepareUpdateSuccess({ taskAction: 'Save', taskData: updatedTaskData, openNextTask: false }),
                    systemActions.createDocuments({ documents: [document] }),
                ];
            })
        )
    );
}
