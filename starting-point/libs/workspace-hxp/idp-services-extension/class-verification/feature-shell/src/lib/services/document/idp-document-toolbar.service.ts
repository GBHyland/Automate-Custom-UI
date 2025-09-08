/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable, Injector } from '@angular/core';
import { IdpDocumentService } from './idp-document.service';
import { Observable, Subject, combineLatest, merge } from 'rxjs';
import { IdpDocument, IdpDocumentPage, REJECTED_CLASS_ID, UNCLASSIFIED_CLASS_ID, IdpDocumentAction } from '../../models/screen-models';
import { distinctUntilChanged, map, shareReplay, switchMap, take, withLatestFrom } from 'rxjs/operators';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { IdpDocumentClassService } from '../document-class/idp-document-class.service';
import { openChangeClassListDialog } from '../../dialogs/change-class-dialog/change-class.dialog.extension';
import { ConfirmationDialogComponent, ConfirmButtonColor } from '../../dialogs/confirmation-dialog/confirmation.dialog';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
    IdentifierData,
    IdpShortcutAction,
    IdpShortcutService,
    RejectDocumentDialogComponent,
} from '@hxp/workspace-hxp/idp-services-extension/shared';

export interface IdpDocumentActionToolBarItems {
    label: string;
    icon: string;
    action: IdpDocumentAction;
    disabled: boolean;
    onClick$: Subject<void>;
    renderType: 'static' | 'dynamic';
    displayOn: 'header' | 'footer' | 'viewer';
    displayOrder: number;
    showDividerBefore: boolean;
    shortcutAction?: IdpShortcutAction;
}

export interface IdpDocumentToolBarItemClickAction {
    action: IdpDocumentAction;
    pages: IdpDocumentPage[];
    documents: IdpDocument[];
}

const DOCUMENT_TOOLBAR_ACTION_ITEMS: IdpDocumentActionToolBarItems[] = [
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.UNDO',
        icon: 'undo',
        disabled: true,
        action: IdpDocumentAction.Undo,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'header',
        displayOrder: 1,
        showDividerBefore: false,
        shortcutAction: IdpShortcutAction.Undo,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.REDO',
        icon: 'redo',
        disabled: true,
        action: IdpDocumentAction.Redo,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'header',
        displayOrder: 2,
        showDividerBefore: false,
        shortcutAction: IdpShortcutAction.Redo,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.REJECT',
        icon: 'warning_amber',
        disabled: true,
        action: IdpDocumentAction.Reject,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'footer',
        displayOrder: 3,
        showDividerBefore: false,
        shortcutAction: IdpShortcutAction.DocumentReject,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.CHANGE_CLASS',
        icon: 'sync_alt',
        disabled: false,
        action: IdpDocumentAction.ChangeClass,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'footer',
        displayOrder: 4,
        showDividerBefore: true,
        shortcutAction: IdpShortcutAction.ChangeClass,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.SPLIT',
        icon: 'call_split',
        disabled: true,
        action: IdpDocumentAction.Split,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'footer',
        displayOrder: 5,
        showDividerBefore: false,
        shortcutAction: IdpShortcutAction.PageSplit,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.MERGE',
        icon: 'call_merge',
        disabled: true,
        action: IdpDocumentAction.Merge,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'footer',
        displayOrder: 6,
        showDividerBefore: false,
        shortcutAction: IdpShortcutAction.PageMerge,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.DELETE',
        icon: 'delete',
        disabled: true,
        action: IdpDocumentAction.Delete,
        onClick$: new Subject<void>(),
        renderType: 'dynamic',
        displayOn: 'footer',
        displayOrder: 7,
        showDividerBefore: false,
        shortcutAction: IdpShortcutAction.PageDelete,
    },
    {
        label: 'IDP_CLASS_VERIFICATION.DOCUMENT_TOOLBAR.MARK_RESOLVED',
        icon: '',
        disabled: true,
        action: IdpDocumentAction.Resolve,
        onClick$: new Subject<void>(),
        renderType: 'static',
        displayOn: 'viewer',
        displayOrder: 8,
        showDividerBefore: false,
    },
];

@Injectable()
export class IdpDocumentToolbarService {
    readonly documentToolBarItems$: Observable<IdpDocumentActionToolBarItems[]>;
    readonly toolBarItemClicked$: Observable<IdpDocumentToolBarItemClickAction>;

    constructor(
        private readonly dialogService: MatDialog,
        private readonly documentService: IdpDocumentService,
        private readonly shortcutService: IdpShortcutService,
        private readonly injector: Injector,
        classificationService: IdpDocumentClassService,
        destroyRef: DestroyRef
    ) {
        this.documentToolBarItems$ = combineLatest([
            documentService.selectedPages$.pipe(distinctUntilChanged()),
            documentService.allDocuments$.pipe(distinctUntilChanged()),
            documentService.undoRedoState$,
            classificationService.selectedClass$.pipe(distinctUntilChanged()),
        ]).pipe(
            takeUntilDestroyed(destroyRef),
            map(([pages, allDocuments, { canUndo, canRedo }, selectedClass]) => {
                const uniqueDocuments = [...new Set(pages.map((p) => p.documentId))];

                const allSelectedContextDocuments = allDocuments.filter((doc) => uniqueDocuments.includes(doc.id));

                return DOCUMENT_TOOLBAR_ACTION_ITEMS.map((item) => {
                    let enabled = true;
                    switch (item.action) {
                        case IdpDocumentAction.Undo: {
                            enabled = canUndo;
                            break;
                        }
                        case IdpDocumentAction.Redo: {
                            enabled = canRedo;
                            break;
                        }
                        case IdpDocumentAction.ChangeClass: {
                            enabled = uniqueDocuments.length > 0;
                            break;
                        }
                        case IdpDocumentAction.Split: {
                            const totalPagesInDoc = allDocuments.find((doc) => doc.id === uniqueDocuments[0])?.pages?.length ?? 0;
                            enabled = pages.length > 0 && uniqueDocuments.length === 1 && pages.length < totalPagesInDoc;
                            break;
                        }
                        case IdpDocumentAction.Merge: {
                            enabled = pages.length > 1 && uniqueDocuments.length > 1;
                            break;
                        }
                        case IdpDocumentAction.Delete: {
                            enabled = pages.length > 0;
                            break;
                        }
                        case IdpDocumentAction.Reject: {
                            const isCurrentClassNotRejected = selectedClass?.id !== REJECTED_CLASS_ID;
                            const isAtLeastOneDocumentSelected = allSelectedContextDocuments.length > 0;
                            enabled = isAtLeastOneDocumentSelected && isCurrentClassNotRejected;
                            break;
                        }
                        case IdpDocumentAction.Resolve: {
                            // Don't want to allow resolve if the Document is Unclassified
                            enabled =
                                pages.length > 0 &&
                                allSelectedContextDocuments.every((d) => d.hasIssue) &&
                                selectedClass?.id !== UNCLASSIFIED_CLASS_ID;
                            break;
                        }
                    }
                    return { ...item, disabled: !enabled };
                }).sort((a, b) => a.displayOrder - b.displayOrder);
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.toolBarItemClicked$ = this.documentToolBarItems$.pipe(
            switchMap((toolBarItems) => {
                const actions$ = toolBarItems.map((item) =>
                    item.onClick$.pipe(
                        withLatestFrom(documentService.selectedPages$),
                        withLatestFrom(documentService.allDocumentsForSelectedClass$),
                        map(([[, pages], allDocuments]) => ({ action: item.action, pages, documents: allDocuments }))
                    )
                );
                return merge(...actions$);
            })
        );

        this.toolBarItemClicked$.pipe(takeUntilDestroyed(destroyRef)).subscribe((clickedItem) => {
            if (clickedItem.action === IdpDocumentAction.Undo) {
                documentService.undoAction();
                return;
            } else if (clickedItem.action === IdpDocumentAction.Redo) {
                documentService.redoAction();
                return;
            }

            if (!clickedItem || clickedItem.pages.length === 0) {
                return;
            }

            const uniqueDocuments = [...new Set(clickedItem.pages.map((p) => p.documentId))];
            const totalPagesInDoc = clickedItem.documents.find((doc) => doc.id === uniqueDocuments[0])?.pages?.length ?? 0;

            const actionHandlers: Record<string, () => void> = {
                [IdpDocumentAction.ChangeClass]: () => {
                    const uniqueClassIds = [...new Set(clickedItem.documents.map((d) => d.class?.id).filter((id): id is string => id !== undefined))];
                    this.openChangeClassDialog(clickedItem.pages, clickedItem.action, uniqueClassIds);
                },
                [IdpDocumentAction.Delete]: () => this.deletePages(clickedItem.pages, clickedItem.action),
                [IdpDocumentAction.Split]: () => {
                    if (clickedItem.pages.length > 0 && uniqueDocuments.length === 1 && clickedItem.pages.length < totalPagesInDoc) {
                        this.handlePageSplit(clickedItem.pages, clickedItem.action);
                    }
                },
                [IdpDocumentAction.Merge]: () => {
                    if (clickedItem.pages.length > 1 && uniqueDocuments.length > 1) {
                        this.handlePageMerge(clickedItem.pages, clickedItem.action);
                    }
                },
                [IdpDocumentAction.Reject]: () => {
                    const unrejectedDocuments = clickedItem.documents.filter((doc) => !doc.rejectedReasonId);
                    if (uniqueDocuments.length > 0 && unrejectedDocuments.length > 0) {
                        const pages = clickedItem.pages.filter((page) => unrejectedDocuments.some((doc) => doc.id === page.documentId));
                        this.handleRejectPage(pages, clickedItem.action);
                    }
                },
                [IdpDocumentAction.Resolve]: () => this.handleResolvePage(clickedItem.pages, clickedItem.action),
            };

            const actionHandler = actionHandlers[clickedItem.action];
            if (actionHandler) {
                actionHandler();
            }
        });
    }

    openChangeClassDialog(pages: IdpDocumentPage[], action: IdpDocumentAction, uniqueClassIds: string[]) {
        if (this.dialogService.openDialogs.length > 0) {
            return;
        }

        const dialogData = {
            currentClassId: uniqueClassIds.length === 1 ? uniqueClassIds[0] : undefined,
        };

        openChangeClassListDialog(
            this.dialogService,
            dialogData,
            (selectedItem: IdentifierData) => {
                this.documentService.setDocumentClass(action, true, pages, selectedItem.id);
            },
            { injector: this.injector }
        );
    }

    deletePages(pages: IdpDocumentPage[], action: IdpDocumentAction) {
        if (this.dialogService.openDialogs.length > 0) {
            return;
        }

        const dialogData = {
            settings: {
                dialogHeader: 'IDP_CLASS_VERIFICATION.DELETE_CONFIRMATION_DIALOG.TITLE',
                confirmLabel: 'IDP_CLASS_VERIFICATION.DELETE_CONFIRMATION_DIALOG.DELETE_BUTTON',
                confirmButtonColor: ConfirmButtonColor.Warn,
                cancelLabel: 'IDP_CLASS_VERIFICATION.DELETE_CONFIRMATION_DIALOG.CANCEL_BUTTON',
                content: 'IDP_CLASS_VERIFICATION.DELETE_CONFIRMATION_DIALOG.DESCRIPTION',
            },
        };

        const dialogRef = this.dialogService.open(ConfirmationDialogComponent, { data: dialogData, width: 'auto', autoFocus: 'first-tabbable' });
        dialogRef.afterClosed().subscribe((isConfirm) => {
            if (isConfirm) {
                this.documentService.deletePages(action, true, pages);
            }
        });
    }

    handlePageSplit(pages: IdpDocumentPage[], action: IdpDocumentAction) {
        this.documentService.splitDocument(action, true, pages);
    }

    handlePageMerge(pages: IdpDocumentPage[], action: IdpDocumentAction) {
        this.documentService.mergeDocuments(action, true, pages, pages[0].documentId);
    }

    handleMovePageAndCreateNewDoc(pages: IdpDocumentPage[], createAfterDocId: string) {
        this.documentService.movePagesAndCreate(IdpDocumentAction.MovePageAndCreate, true, pages, createAfterDocId);
    }

    handleMovePages(pages: IdpDocumentPage[], targetDocumentId: string, targetIndex: number) {
        this.documentService.movePages(IdpDocumentAction.MovePage, true, pages, targetDocumentId, targetIndex);
    }

    handleResolvePage(pages: IdpDocumentPage[], action: IdpDocumentAction) {
        this.documentService.markResolved(action, true, pages);
    }

    handleRejectPage(pages: IdpDocumentPage[], action: IdpDocumentAction) {
        if (this.dialogService.openDialogs.length > 0) {
            return;
        }

        const dialogConfig: MatDialogConfig = {
            injector: this.injector,
            width: '40%',
            height: '80%',
            autoFocus: '.idp-filterable-selection-list__search-field-input',
            restoreFocus: true,
        };
        const dialogRef = this.dialogService.open(RejectDocumentDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe((result) => {
            if (result?.rejectReason) {
                this.documentService.markRejected(action, true, pages, result.rejectReason.id, result.rejectNote);
            }
        });
    }

    handleShortcutAction(event: KeyboardEvent) {
        if (!event) {
            return false;
        }

        const shortcut = this.shortcutService.getShortcutForEvent(event);
        if (!shortcut) {
            return false;
        }

        if (this.dialogService.openDialogs.length > 0) {
            return false;
        }

        const toolbarItem = DOCUMENT_TOOLBAR_ACTION_ITEMS.find((item) => item.shortcutAction === shortcut.action);
        let handled = toolbarItem !== undefined;
        toolbarItem?.onClick$.next();

        // Other non-toolbar shortcuts
        if (
            !handled && // View filter change shortcut
            shortcut.action === IdpShortcutAction.IssueOnlyFilter
        ) {
            this.documentService.fullScreenMode$.pipe(take(1)).subscribe((isFullScreen) => {
                if (!isFullScreen) {
                    this.documentService.toggleViewFilter();
                }
            });

            handled = true;
        }

        return handled;
    }
}
