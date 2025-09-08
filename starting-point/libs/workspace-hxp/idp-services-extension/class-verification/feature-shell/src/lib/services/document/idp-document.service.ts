/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable } from '@angular/core';
import { Observable, asapScheduler, combineLatest, of } from 'rxjs';
import { distinctUntilChanged, map, observeOn, shareReplay, switchMap, withLatestFrom } from 'rxjs/operators';
import { IdpDocument, IdpDocumentAction, IdpDocumentPage } from '../../models/screen-models';
import { Store } from '@ngrx/store';
import {
    selectAllDocuments,
    selectAllDocumentsForClass,
    selectAllDocumentsValid,
    selectAllSelectedDocuments,
    selectAllSelectedPages,
    selectDocumentsGroupedByClass,
    selectSelectedDocumentClass,
} from '../../store/selectors/document.selectors';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userActions } from '../../store/actions/class-verification.actions';
import { IdpScreenViewFilter, IdpScreenViewSortOption } from '../../models/common-models';
import { selectFullScreen, selectSortOption, selectViewFilter } from '../../store/selectors/screen.selectors';
import { selectCanRedo, selectCanUndo } from '../../store/selectors/undo-redo.selectors';
import { IdpPagesMetadata } from '../../store/models/document-state-updates';

@Injectable()
export class IdpDocumentService {
    readonly allDocuments$: Observable<IdpDocument[]>;
    readonly allPages$: Observable<IdpDocumentPage[]>;
    readonly allDocumentsForSelectedClass$: Observable<IdpDocument[]>;
    readonly selectedDocuments$: Observable<IdpDocument[]>;
    readonly allPagesForSelectedClass$: Observable<IdpDocumentPage[]>;
    readonly selectedPages$: Observable<IdpDocumentPage[]>;
    readonly allDocumentsValid$: Observable<boolean>;
    readonly documentViewFilter$: Observable<IdpScreenViewFilter>;
    readonly fullScreenMode$: Observable<boolean>;
    readonly undoRedoState$: Observable<{ canUndo: boolean; canRedo: boolean }>;

    constructor(private readonly store: Store, destroyRef: DestroyRef) {
        this.allDocuments$ = store.select(selectAllDocuments).pipe(takeUntilDestroyed(destroyRef));

        this.allPages$ = this.allDocuments$.pipe(map((documents) => documents.flatMap((d) => d.pages)));

        this.allDocumentsForSelectedClass$ = combineLatest([
            store.select(selectSelectedDocumentClass).pipe(distinctUntilChanged((prev, curr) => prev?.id === curr?.id)),
            store.select(selectViewFilter),
        ]).pipe(
            takeUntilDestroyed(destroyRef),
            switchMap(([selectedClass, viewFilter]) => {
                if (!selectedClass) {
                    return of([]);
                }

                return this.store.select(selectAllDocumentsForClass(selectedClass?.id)).pipe(
                    map((docs) => {
                        if (viewFilter === IdpScreenViewFilter.All) {
                            return docs;
                        }
                        return docs.filter((doc) => doc.hasIssue);
                    })
                );
            }),
            shareReplay({ refCount: true, bufferSize: 1 })
        );

        this.allPagesForSelectedClass$ = this.allDocumentsForSelectedClass$.pipe(
            map((documents) => documents.flatMap((doc) => doc.pages)),
            shareReplay({ refCount: true, bufferSize: 1 })
        );

        this.allDocumentsValid$ = store.select(selectAllDocumentsValid).pipe(takeUntilDestroyed(destroyRef));
        this.selectedDocuments$ = store.select(selectAllSelectedDocuments).pipe(takeUntilDestroyed(destroyRef));
        this.selectedPages$ = store.select(selectAllSelectedPages).pipe(takeUntilDestroyed(destroyRef));
        this.documentViewFilter$ = store.select(selectViewFilter).pipe(takeUntilDestroyed(destroyRef));
        this.fullScreenMode$ = store.select(selectFullScreen).pipe(takeUntilDestroyed(destroyRef));

        this.undoRedoState$ = combineLatest([
            store.select(selectCanUndo).pipe(distinctUntilChanged()),
            store.select(selectCanRedo).pipe(distinctUntilChanged()),
        ]).pipe(
            map(([canUndo, canRedo]) => ({ canUndo, canRedo })),
            takeUntilDestroyed(destroyRef)
        );

        // Update selected pages when document list filtered by class changes
        this.allDocumentsForSelectedClass$
            .pipe(
                observeOn(asapScheduler),
                map((docs) => docs.map((d) => d.id)),
                distinctUntilChanged((prev, curr) => prev?.join(',') === curr?.join(',')),
                withLatestFrom(this.selectedPages$),
                withLatestFrom(this.getSortOption())
            )
            .subscribe(([[docsInSelectedClass, selectedPages], sortOption]) => {
                const filteredSelectedPages = selectedPages.filter((p) => docsInSelectedClass.includes(p.documentId));
                if (sortOption === IdpScreenViewSortOption.Classes && filteredSelectedPages.length !== selectedPages.length) {
                    this.setSelectedPages(filteredSelectedPages.map((p) => p.id));
                }
            });
    }

    setDocumentSortOption(option: IdpScreenViewSortOption) {
        this.store.dispatch(userActions.sortOptionChange({ option }));
    }

    setSelectedPages(pageIds: string[]) {
        this.store.dispatch(userActions.pageSelect({ pageIds }));
    }

    toggleExpandDocument(documentId: string) {
        this.store.dispatch(userActions.documentExpandToggle({ documentId }));
    }

    togglePreviewedDocument(documentId?: string) {
        this.store.dispatch(userActions.documentPreviewToggle({ documentId }));
    }

    toggleDraggedDocument(documentId: string) {
        this.store.dispatch(userActions.documentDragToggle({ documentId }));
    }

    resetPageSelection() {
        this.store.dispatch(userActions.pageSelect({ pageIds: [] }));
    }

    setDocumentViewFilter(viewFilter: IdpScreenViewFilter) {
        this.store.dispatch(userActions.viewFilterChange({ filter: viewFilter }));
    }

    toggleViewFilter() {
        this.store.dispatch(userActions.viewFilterToggle());
    }

    changeFullScreen(fullScreen: boolean) {
        this.store.dispatch(userActions.changeFullScreen({ fullScreen }));
    }

    updatePagesRotation(pages: IdpPagesMetadata[], taskDataSynced: boolean) {
        this.store.dispatch(userActions.updatePagesRotation({ pages, taskDataSynced }));
    }

    setDocumentClass(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[], classId: string) {
        this.store.dispatch(userActions.documentClassChange({ docAction, canUndoAction, pages, classId }));
    }

    deletePages(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[]) {
        this.store.dispatch(userActions.pageDelete({ docAction, canUndoAction, pages }));
    }

    movePages(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[], targetDocumentId: string, targetIndex: number) {
        this.store.dispatch(userActions.pageMove({ docAction, canUndoAction, pages, targetDocumentId, targetIndex }));
    }

    movePagesAndCreate(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[], createAfterDocId: string) {
        this.store.dispatch(userActions.pageSplit({ docAction, canUndoAction, pages, createAfterDocId }));
    }

    splitDocument(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[]) {
        this.store.dispatch(userActions.pageSplit({ docAction, canUndoAction, pages }));
    }

    mergeDocuments(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[], targetDocumentId: string) {
        this.store.dispatch(userActions.pageMerge({ docAction, canUndoAction, pages, targetDocumentId }));
    }

    markResolved(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[]) {
        this.store.dispatch(userActions.documentResolve({ docAction, canUndoAction, pages }));
    }

    markRejected(docAction: IdpDocumentAction, canUndoAction: boolean, pages: IdpDocumentPage[], rejectReasonId: string, rejectNote?: string) {
        this.store.dispatch(userActions.documentReject({ docAction, canUndoAction, pages, rejectReasonId, rejectNote }));
    }

    getDocumentsForClass(classId: string) {
        return this.store.select(selectAllDocumentsForClass(classId));
    }

    getAllDocumentsGroupedByClass() {
        return this.store.select(selectDocumentsGroupedByClass);
    }

    getSortOption() {
        return this.store.select(selectSortOption);
    }

    undoAction() {
        this.store.dispatch(userActions.undoAction());
    }

    redoAction() {
        this.store.dispatch(userActions.redoAction());
    }

    copyDocumentDetailsToClipboard(documentId: string) {
        this.store.dispatch(userActions.copyDocumentDetailsToClipboard({ documentId }));
    }
}
