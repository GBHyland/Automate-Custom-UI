/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { combineLatest, Observable, of, Subject, take } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { Directive, OnInit, AfterViewInit, OnDestroy, QueryList, Output, inject, ChangeDetectorRef, DestroyRef, ViewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ListItemComponent } from '../components/list-item/list-item.component';
import { IdpNavSelectionType } from '../models/common-models';
import { UNCLASSIFIED_CLASS_ID, REJECTED_CLASS_ID, IdpDocument } from '../models/screen-models';
import { IdpDocumentMultiselectService } from '../services/document/idp-document-multiselect.service';
import { IdpDocumentService } from '../services/document/idp-document.service';
import { DragPlaceholderMetadata, IdpDocumentDragDropService } from '../services/document/idp-drag-drop.service';
import {
    IdpKeyboardNavEvent,
    IdpKeyboardNavClickEvent,
    IdpKeyboardNavigationService,
    IdpKeyboardNavAction,
    isSameContext,
    IdpKeyboardNavActionTypeInternal,
    IdpKeyboardNavContextIdentifier,
} from '../services/document/idp-keyboard-navigation.service';
import { DocumentListComponent } from '../components/document-browser/document-list/document-list.component';

export type DocumentData = IdpDocument & { allPagesSelected: boolean };

@Directive()
export abstract class DocumentListDirective implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild(DocumentListComponent)
    private readonly documentListComponent!: DocumentListComponent;
    protected get items(): QueryList<ListItemComponent> {
        return this.documentListComponent?.items ?? new QueryList<ListItemComponent>();
    }

    @Output() collapseContainer = new Subject();

    documents$: Observable<DocumentData[]> = of([]);
    selectedDocumentsCount$: Observable<number> = of(0);
    isPageDragging$: Observable<boolean> = of(false);

    readonly documentUniquenessFn = (i: number, document: IdpDocument) => document.id;
    readonly dragPlaceholderMetadata$: Observable<DragPlaceholderMetadata>;

    classDropListId!: string;
    draggingDocuments: IdpDocument[] = [];

    protected keydownEvent$ = new Subject<IdpKeyboardNavEvent>();
    protected clickEvent$ = new Subject<IdpKeyboardNavClickEvent>();
    protected pendingMouseUpToggle: { selectionAction: IdpNavSelectionType } | undefined = undefined;

    private readonly unclassifiedDocumentName: string;
    private readonly rejectedDocumentName: string;

    protected readonly documentService = inject(IdpDocumentService);
    protected readonly keyboardNavigationService = inject(IdpKeyboardNavigationService);
    protected readonly documentMultiselectService = inject(IdpDocumentMultiselectService);
    protected readonly changeDetector = inject(ChangeDetectorRef);
    protected readonly destroyRef = inject(DestroyRef);
    protected readonly dragDropService = inject(IdpDocumentDragDropService);
    protected readonly translateService = inject(TranslateService);

    constructor() {
        this.isPageDragging$ = this.dragDropService.isDragging$.pipe(takeUntilDestroyed(this.destroyRef));

        this.keyboardNavigationService.action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action) => {
            this.onNavigationAction(action);
        });

        this.dragPlaceholderMetadata$ = this.dragDropService.dragPlaceholderMetadata$;

        this.unclassifiedDocumentName = this.translateService.instant('IDP_CLASS_VERIFICATION.DOCUMENT_LIST.UNCLASSIFIED_DOCUMENT_NAME');
        this.rejectedDocumentName = this.translateService.instant('IDP_CLASS_VERIFICATION.DOCUMENT_LIST.REJECTED_DOCUMENT_NAME');
    }

    ngOnInit(): void {
        this.initDocuments();
        this.initSelectedDocumentsCount();
    }

    ngAfterViewInit() {
        this.afterViewInitProtected();
    }

    ngOnDestroy() {
        this.onDestroyProtected();
    }

    protected onItemMouseDown(item: IdpDocument, event: MouseEvent, mode: 'toggle' | 'select') {
        this.clickEvent$.next({
            itemContext: { contextId: item.id, contextType: 'document' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });

        this.onItemListChanged(item, event, mode);
    }

    onItemMouseUp(item: DocumentData, event: MouseEvent) {
        if (this.pendingMouseUpToggle && (event.ctrlKey || event.metaKey)) {
            this.documentMultiselectService.documentSelected(item.id, this.pendingMouseUpToggle.selectionAction, true);
        }

        this.pendingMouseUpToggle = undefined;
    }

    onItemKeyDown(item: IdpDocument, event: KeyboardEvent): void {
        this.keydownEvent$.next({
            itemContext: { contextId: item.id, contextType: 'document' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });
    }

    onMouseEnter(item: IdpDocument): void {
        combineLatest([this.dragDropService.isDragging$, this.dragDropService.draggingObject$])
            .pipe(take(1))
            .subscribe(([isDragging, draggingObject]) => {
                if (!isDragging) {
                    return;
                }

                if (draggingObject?.pages) {
                    this.documentService.togglePreviewedDocument(item.id);
                }

                this.dragDropService.setDraggingTarget({ document: item });
            });
    }

    onContainerKeyDown(items: IdpDocument[], event: KeyboardEvent) {
        if (items.length > 0) {
            this.onItemKeyDown(items[0], event);
        }
    }

    toggleList(item: IdpDocument, forceOp: 'expand' | 'collapse' | 'toggle' = 'toggle') {
        if (forceOp === 'expand' && item.isExpanded) {
            return;
        }
        if (forceOp === 'collapse' && !item.isExpanded) {
            return;
        }

        item.isExpanded = !item.isExpanded;

        this.documentService.toggleExpandDocument(item.id);
    }

    onDragStarted() {
        this.documentService.selectedDocuments$.pipe(take(1)).subscribe((documents) => {
            this.draggingDocuments = documents;
            this.dragDropService.setDraggingObject({ documents: documents });
            for (const document of documents) {
                this.documentService.toggleDraggedDocument(document.id);
            }
        });
        this.dragDropService.setDraggingState(true);
    }

    onDragStopped() {
        this.draggingDocuments = [];
        this.documentService.selectedDocuments$.pipe(take(1)).subscribe((documents) => {
            for (const document of documents) {
                this.documentService.toggleDraggedDocument(document.id);
            }
        });
        this.dragDropService.setDraggingState(false);
    }

    onPageCollapseRequest(item: IdpDocument) {
        this.toggleList(item, 'collapse');
    }

    protected onItemListChanged(item: IdpDocument, event: MouseEvent | undefined, mode: 'toggle' | 'select'): void {
        event?.stopImmediatePropagation();
        event?.preventDefault();
        this.toggleList(item, mode === 'toggle' ? 'toggle' : 'expand');
    }

    protected selectAllDocuments() {
        this.documentMultiselectService.selectAll('document');
    }

    protected onNavigationAction(action: IdpKeyboardNavAction) {
        const isValidContext = action.itemContext?.contextType === 'document' && isSameContext(action.containerContext, this.keyboardNavContext);
        const item = action.data as IdpDocument;
        if (!isValidContext || !item) {
            return;
        }

        switch (action.type) {
            case 'SelectAllContextOnly': {
                this.selectAllDocuments();
                break;
            }
            case IdpKeyboardNavActionTypeInternal.Expand: {
                this.toggleList(item, 'expand');
                break;
            }
            case 'Collapse':
            case IdpKeyboardNavActionTypeInternal.Collapse: {
                if (item?.isExpanded) {
                    this.toggleList(item, 'collapse');
                } else {
                    this.collapseContainer.next({});
                }
                break;
            }
        }

        const activeItemId = action.currentActiveInfo?.id;
        if (!activeItemId) {
            return;
        }

        switch (action.selectionAction) {
            case 'none': {
                if (action.currentActiveInfo?.activeContext?.contextType === 'root') {
                    this.documentMultiselectService.clearSelection();
                    this.changeDetector.detectChanges();
                }
                break;
            }
            default: {
                this.handleSelectionNavigationAction(action, activeItemId, item);
                break;
            }
        }
    }

    protected handleSelectionNavigationAction(action: IdpKeyboardNavAction, selectedDocumentId: string, actionDocument: IdpDocument): void {
        this.pendingMouseUpToggle =
            actionDocument.isSelected === true && action.selectionAction === 'multi' ? { selectionAction: action.selectionAction } : undefined;
        this.documentMultiselectService.documentSelected(selectedDocumentId, action.selectionAction);
        this.changeDetector.detectChanges();
    }

    abstract get keyboardNavContext(): IdpKeyboardNavContextIdentifier;

    isElementContained(el: HTMLElement) {
        return el.offsetWidth >= el.scrollWidth;
    }

    formatDocumentName(document: IdpDocument): string {
        let documentClassName = this.unclassifiedDocumentName;
        if (document.class && document.class.id !== UNCLASSIFIED_CLASS_ID) {
            documentClassName =
                !!document.rejectedReasonId || document.class.id === REJECTED_CLASS_ID ? this.rejectedDocumentName : document.class.name;
        }

        return `${documentClassName} - ${document.id.slice(0, 8)}`;
    }

    onDoubleClick(item: IdpDocument): void {
        this.onCopyDocumentIdToClipboard(item.id); // add appName, correlationId
    }

    protected afterViewInitProtected() {
        this.keyboardNavigationService.registerContext({
            ...this.keyboardNavContext,
            items: this.items,
            itemType: 'document',
            keydownEvent$: this.keydownEvent$,
            clickEvent$: this.clickEvent$,
            canExpand: true,
            activateItemOnRegister: true,
            multiSelectAllowed: true,
        });
    }

    protected onDestroyProtected() {
        this.dragDropService.removeDropList(this.classDropListId);
        this.keyboardNavigationService.unregisterContext(this.keyboardNavContext);
    }

    protected abstract initDocuments(): void;
    protected abstract initSelectedDocumentsCount(): void;

    private onCopyDocumentIdToClipboard(documentId: string): void {
        this.documentService.copyDocumentDetailsToClipboard(documentId);
    }
}
