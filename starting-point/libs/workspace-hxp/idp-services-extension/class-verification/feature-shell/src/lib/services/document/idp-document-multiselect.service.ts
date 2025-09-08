/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { IdpDocumentClassService } from '../document-class/idp-document-class.service';
import { distinctUntilChanged, map, take, withLatestFrom } from 'rxjs/operators';
import { IdpDocumentService } from './idp-document.service';
import { BehaviorSubject } from 'rxjs';
import { IdpNavSelectionType, IdpScreenViewSortOption } from '../../models/common-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

interface Selection {
    pageId: string;
    isAnchor?: boolean;
}

@Injectable()
export class IdpDocumentMultiselectService {
    private readonly bufferedPageSelectionSubject$ = new BehaviorSubject<Selection[]>([]);
    private readonly bufferedPageSelection$ = this.bufferedPageSelectionSubject$.asObservable();

    private lastSelections: string[] = [];
    private sortOption: IdpScreenViewSortOption = IdpScreenViewSortOption.Original;

    private readonly documentService: IdpDocumentService = inject(IdpDocumentService);
    private readonly classificationService: IdpDocumentClassService = inject(IdpDocumentClassService);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);

    constructor() {
        this.classificationService.selectedClass$.pipe(distinctUntilChanged((prev, curr) => prev?.id === curr?.id)).subscribe(() => {
            if (this.sortOption !== IdpScreenViewSortOption.Original) {
                this.resetSelection();
            }
        });

        this.bufferedPageSelection$.subscribe((selectionInfo) => {
            const pageIds = selectionInfo.map((info) => info.pageId);
            this.documentService.setSelectedPages(pageIds);
        });

        this.documentService
            .getSortOption()
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((option) => (this.sortOption = option));
    }

    documentSelected(documentId: string, mode: IdpNavSelectionType, toggle = false) {
        if (mode === 'multiRange') {
            this.selectPagesBetween(documentId, 'document');
        } else {
            this.documentService.allDocuments$.pipe(take(1)).subscribe((documents) => {
                const document = documents.find((doc) => doc.id === documentId);
                if (!document) {
                    return;
                }

                const pageIds = document.pages.map((page) => page.id);
                const selection: Selection[] = pageIds.map((pageId) => ({ pageId }));
                this.setBufferedSelection(selection, mode === 'multi', toggle ? 'single' : 'none');
            });
        }
    }

    pageSelected(pageId: string, mode: IdpNavSelectionType, toggle = false) {
        if (mode === 'multiRange') {
            this.selectPagesBetween(pageId, 'page');
        } else {
            this.setBufferedSelection({ pageId }, mode === 'multi', toggle ? 'single' : 'none');
        }
    }

    selectAll(type: 'document' | 'page', documentId?: string) {
        if (type === 'page' && !documentId) {
            throw new Error('Document id is required when selecting all pages');
        }

        this.documentService.allDocumentsForSelectedClass$.pipe(take(1)).subscribe((documents) => {
            if (type === 'document') {
                const pageIds = documents.flatMap((doc) => doc.pages.map((page) => page.id));
                const selection: Selection[] = pageIds.map((pageId) => ({ pageId }));
                this.setBufferedSelection(selection, false);
            } else {
                const document = documents.find((doc) => doc.id === documentId);
                if (!document) {
                    return;
                }

                const pageIds = document.pages.map((page) => page.id);
                const selection: Selection[] = pageIds.map((pageId) => ({ pageId }));
                this.setBufferedSelection(selection, false);
            }
        });
    }

    clearSelection() {
        this.resetSelection();
    }

    private selectPagesBetween(selectedId: string, type: 'document' | 'page') {
        const selectedDocumentId = type === 'document' ? selectedId : undefined;
        let selectedPages = type === 'page' ? [selectedId] : [];

        const documentsSource =
            this.sortOption === IdpScreenViewSortOption.Original
                ? this.getDocumentsForUnsortedList()
                : this.documentService.allDocumentsForSelectedClass$;

        documentsSource.pipe(take(1), withLatestFrom(this.bufferedPageSelection$)).subscribe(([documents, selectedPageInfo]) => {
            let anchorPages = selectedPageInfo.filter((p) => p.isAnchor).map((p) => p.pageId);
            if (anchorPages.length === 0) {
                // If no anchor page found, consider the last selected pages as anchor
                anchorPages = [...this.lastSelections];
            }

            if (anchorPages.length === 0) {
                return;
            }

            const newSelection: Selection[] = [];

            let mode: 'none' | 'capturing' | 'complete' = 'none';
            let anchorPagesToProcess = anchorPages.length;
            let selectedPagesToProcess = selectedPages.length;
            let closeCaptureOn: 'anchor' | 'selected' | 'none' = 'none';
            for (const document of documents) {
                if (mode === 'complete' || document.pages.length === 0) {
                    continue;
                }

                if (document.id === selectedDocumentId) {
                    // Consider all pages of this document as selected.
                    selectedPages = document.pages.map((page) => page.id);
                    selectedPagesToProcess = selectedPages.length;
                }

                for (const page of document.pages) {
                    if (mode === 'complete') {
                        continue;
                    }

                    let isAnchor = false;
                    let isSelected = false;

                    if (anchorPages.includes(page.id)) {
                        isAnchor = true;
                        anchorPagesToProcess--;

                        if (mode === 'none') {
                            mode = 'capturing';
                            closeCaptureOn = 'selected';
                        } else if (mode === 'capturing' && anchorPagesToProcess === 0 && closeCaptureOn === 'anchor') {
                            mode = 'complete';
                        }
                    }

                    if (selectedPages.includes(page.id)) {
                        isSelected = true;
                        selectedPagesToProcess--;

                        if (mode === 'none') {
                            mode = 'capturing';
                            closeCaptureOn = 'anchor';
                        } else if (mode === 'capturing' && selectedPagesToProcess === 0 && closeCaptureOn === 'selected') {
                            mode = 'complete';
                        }
                    }

                    if (mode === 'capturing' || isSelected || isAnchor) {
                        newSelection.push({ pageId: page.id, isAnchor });
                    }
                }
            }

            this.setBufferedSelection(newSelection, false);
        });
    }

    private resetSelection() {
        this.setBufferedSelection([], false);
    }

    private getDocumentsForUnsortedList() {
        return this.documentService.selectedDocuments$.pipe(
            take(1),
            withLatestFrom(this.documentService.allDocuments$),
            map(([selectedDocs, allDocs]) => {
                if (selectedDocs.length > 0 && selectedDocs[0].rejectedReasonId) {
                    return allDocs.filter((doc) => !!doc.rejectedReasonId);
                }

                return allDocs.filter((doc) => !doc.rejectedReasonId);
            })
        );
    }

    private setBufferedSelection(selection: Selection[] | Selection, append: boolean, toggleMode: 'single' | 'group' | 'none' = 'none') {
        const newSelection = Array.isArray(selection) ? selection : [selection];
        this.lastSelections = newSelection.map((info) => info.pageId);
        let updatedSelections: Selection[] = [];
        this.bufferedPageSelection$.pipe(take(1)).subscribe((currentSelections) => {
            updatedSelections = [...(currentSelections || [])];
        });

        if (append) {
            switch (toggleMode) {
                case 'none': {
                    updatedSelections.push(...newSelection.filter((info) => !this.isIncludedInSelection(updatedSelections, info)));
                    break;
                }
                case 'single': {
                    for (const newSel of newSelection) {
                        const index = updatedSelections.findIndex((p) => p.pageId === newSel.pageId);
                        if (index === -1) {
                            updatedSelections.push(newSel);
                        } else {
                            updatedSelections.splice(index, 1);
                        }
                    }

                    break;
                }
                case 'group': {
                    const allPagesAlreadySelected = newSelection.every((info) => this.isIncludedInSelection(updatedSelections, info));
                    const addAll = !allPagesAlreadySelected;
                    if (addAll) {
                        updatedSelections.push(...newSelection.filter((info) => !this.isIncludedInSelection(updatedSelections, info)));
                    } else {
                        updatedSelections = updatedSelections.filter((info) => !this.isIncludedInSelection(newSelection, info));
                    }

                    break;
                }
                // No default
            }
        } else {
            if (toggleMode === 'none') {
                updatedSelections = newSelection;
            } else {
                const allPagesAlreadySelected =
                    updatedSelections.length === newSelection.length &&
                    newSelection.every((info) => this.isIncludedInSelection(updatedSelections, info));
                updatedSelections = allPagesAlreadySelected ? [] : newSelection;
            }
        }

        this.bufferedPageSelectionSubject$.next(updatedSelections);
    }

    private isIncludedInSelection(collection: Selection[], info: Selection) {
        return collection.some((selected) => selected.pageId === info.pageId);
    }
}
