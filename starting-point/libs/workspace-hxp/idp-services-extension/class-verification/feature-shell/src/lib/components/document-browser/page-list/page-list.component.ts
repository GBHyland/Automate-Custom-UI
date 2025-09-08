/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ChangeDetectionStrategy,
    Component,
    Input,
    OnDestroy,
    Output,
    QueryList,
    ViewChildren,
    AfterViewInit,
    ChangeDetectorRef,
    DestroyRef,
    inject,
} from '@angular/core';
import { Observable, Subject, combineLatest } from 'rxjs';

import { IdpDocumentService } from '../../../services/document/idp-document.service';
import { map, take, tap } from 'rxjs/operators';
import { IdpDocumentMultiselectService } from '../../../services/document/idp-document-multiselect.service';
import {
    IdpKeyboardNavAction,
    IdpKeyboardNavActionTypeInternal,
    IdpKeyboardNavClickEvent,
    IdpKeyboardNavContextIdentifier,
    IdpKeyboardNavEvent,
    IdpKeyboardNavigationService,
    isSameContext,
} from '../../../services/document/idp-keyboard-navigation.service';
import { IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { CommonModule } from '@angular/common';
import { ListItemComponent } from '../../list-item/list-item.component';
import { IdpNavSelectionType } from '../../../models/common-models';
import { IdpDocumentAction, IdpDocumentPage } from '../../../models/screen-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatCardModule } from '@angular/material/card';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { IdpShortcutAction, TemplateLetDirective } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { DragPlaceholderMetadata, IdpDocumentDragDropService } from '../../../services/document/idp-drag-drop.service';

@Component({
    selector: 'hyland-idp-page-list',
    templateUrl: './page-list.component.html',
    styleUrls: ['./page-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        DragDropModule,
        ListItemComponent,
        MatBadgeModule,
        MatButtonModule,
        MatCardModule,
        MatListModule,
        MatIconModule,
        TemplateLetDirective,
    ],
})
export class PageListComponent implements AfterViewInit, OnDestroy {
    @Input() documentId = '';
    @Input() isIssue = false;
    @Output() collapseContainer = new Subject();
    @ViewChildren(ListItemComponent) items!: QueryList<ListItemComponent>;

    private pages: IdpDocumentPage[] = [];
    private keydownEvent$ = new Subject<IdpKeyboardNavEvent>();
    private clickEvent$ = new Subject<IdpKeyboardNavClickEvent>();
    private pendingMouseUpToggle: { selectionAction: IdpNavSelectionType } | undefined = undefined;

    readonly dragPlaceholderMetadata$: Observable<DragPlaceholderMetadata>;

    readonly pages$: Observable<IdpDocumentPage[]>;
    readonly selectedPages$: Observable<IdpDocumentPage[]>;

    readonly pageUniquenessFn = (i: number, page: IdpDocumentPage) => page.id;

    draggingPages: IdpDocumentPage[] = [];

    private readonly documentService = inject(IdpDocumentService);
    private readonly keyboardNavigationService = inject(IdpKeyboardNavigationService);
    private readonly documentToolbarService = inject(IdpDocumentToolbarService);
    private readonly documentMultiselectService = inject(IdpDocumentMultiselectService);
    private readonly dragDropService = inject(IdpDocumentDragDropService);
    private readonly changeDetector = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        // filter pages for selected document
        this.pages$ = combineLatest([
            this.documentService.allPages$,
            this.documentService.selectedPages$.pipe(map((pages) => pages.map((page) => page.id))),
        ]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([allPages, selectedPages]) =>
                allPages
                    .filter((page) => page.documentId === this.documentId)
                    .map((page) => ({
                        ...page,
                        isSelected: page.isSelected || selectedPages.includes(page.id),
                    }))
            ),
            tap((pages) => (this.pages = pages))
        );

        this.dragPlaceholderMetadata$ = this.dragDropService.dragPlaceholderMetadata$;

        this.selectedPages$ = this.documentService.selectedPages$.pipe(takeUntilDestroyed(this.destroyRef));

        this.keyboardNavigationService.action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action) => {
            this.onNavigationAction(action);
        });
    }

    ngAfterViewInit() {
        this.keyboardNavigationService.registerContext({
            ...this.keyboardNavContext,
            items: this.items,
            itemType: 'page',
            keydownEvent$: this.keydownEvent$,
            clickEvent$: this.clickEvent$,
            canExpand: false,
            activateItemOnRegister: false,
            multiSelectAllowed: true,
        });
    }

    ngOnDestroy() {
        this.keyboardNavigationService.unregisterContext(this.keyboardNavContext);
    }

    onItemKeyDown(item: IdpDocumentPage, event: KeyboardEvent): void {
        this.keydownEvent$.next({
            itemContext: { contextId: item.id, contextType: 'page' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });
    }

    onContainerKeyDown(items: IdpDocumentPage[], event: KeyboardEvent) {
        if (items.length > 0) {
            this.onItemKeyDown(items[0], event);
        }
    }

    onMouseEnter(item: IdpDocumentPage) {
        combineLatest([this.documentService.allDocuments$, this.dragDropService.isDragging$])
            .pipe(take(1))
            .subscribe(([allDocs, isDragging]) => {
                if (!isDragging) {
                    return;
                }

                const document = allDocs.find((d) => d.id === item.documentId);

                this.dragDropService.setDraggingTarget({ document: document });
                this.dragDropService.setDraggingTargetPage(item);
            });
    }

    onItemMouseDown(item: IdpDocumentPage, event: MouseEvent) {
        this.pendingMouseUpToggle = undefined;

        this.clickEvent$.next({
            itemContext: { contextId: item.id, contextType: 'page' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });
    }

    onItemMouseUp(item: IdpDocumentPage, event: MouseEvent) {
        if (this.pendingMouseUpToggle && (event.ctrlKey || event.metaKey)) {
            this.documentMultiselectService.pageSelected(item.id, this.pendingMouseUpToggle.selectionAction, true);
        }

        this.pendingMouseUpToggle = undefined;
    }

    onDragStarted() {
        this.selectedPages$.pipe(take(1)).subscribe((pages) => {
            this.draggingPages = pages;
            this.dragDropService.setDraggingObject({ pages: pages });
        });
        this.dragDropService.setDraggingState(true);
    }

    onDragStopped() {
        this.draggingPages = [];
        this.dragDropService.setDraggingState(false);
    }

    shouldInsertTopPlaceholder(placeholderMetaData: DragPlaceholderMetadata, currentPageIndex: number): boolean {
        return this.shouldInsertPlaceholder(placeholderMetaData, currentPageIndex) && !this.isLowerIndex(placeholderMetaData, currentPageIndex);
    }

    shouldInsertBottomPlaceholder(placeholderMetaData: DragPlaceholderMetadata, currentPageIndex: number): boolean {
        return this.shouldInsertPlaceholder(placeholderMetaData, currentPageIndex) && this.isLowerIndex(placeholderMetaData, currentPageIndex);
    }

    private shouldInsertPlaceholder(placeholderMetaData: DragPlaceholderMetadata, currentPageIndex: number): boolean {
        return (
            placeholderMetaData.isPageDragging &&
            placeholderMetaData.targetDocumentId === this.documentId &&
            placeholderMetaData.targetPageIndex === currentPageIndex
        );
    }

    private isLowerIndex(placeholderMetaData: DragPlaceholderMetadata, currentPageIndex: number): boolean {
        let lowerIndex = false;
        if (placeholderMetaData.sourceSinglePage) {
            const sourceIndex = this.pages.findIndex((page) => page.id === placeholderMetaData.sourceSinglePage?.id);
            if (sourceIndex !== -1) {
                lowerIndex = sourceIndex < currentPageIndex;
            }
        }

        return lowerIndex;
    }

    private onPageSplitAllAbove(item: IdpDocumentPage) {
        const index = this.pages.findIndex((page) => page.id === item.id);
        const items = this.pages.splice(0, index + 1);
        this.documentToolbarService.handlePageSplit(items, IdpDocumentAction.Split);
    }

    private onNavigationAction(action: IdpKeyboardNavAction) {
        const isValidContext = action.itemContext?.contextType === 'page' && isSameContext(action.containerContext, this.keyboardNavContext);
        const item = action.data as IdpDocumentPage;
        if (!isValidContext || !item) {
            return;
        }

        switch (action.type) {
            case IdpShortcutAction.SelectAllContextOnly: {
                this.documentMultiselectService.selectAll('page', this.documentId);
                break;
            }
            case IdpShortcutAction.SelectAllContextAll: {
                this.documentMultiselectService.selectAll('document');
                break;
            }
            case IdpShortcutAction.Collapse:
            case IdpKeyboardNavActionTypeInternal.Collapse: {
                this.collapseContainer.next({});
                break;
            }
            case IdpShortcutAction.PageSplitAllAbove: {
                this.onPageSplitAllAbove(item);
                break;
            }
        }

        const activeItemId = action.currentActiveInfo?.id;
        if (!activeItemId) {
            return;
        }

        switch (action.selectionAction) {
            case 'none': {
                break;
            }
            default: {
                this.pendingMouseUpToggle =
                    item.isSelected === true && action.selectionAction === 'multi' ? { selectionAction: action.selectionAction } : undefined;
                this.documentMultiselectService.pageSelected(activeItemId, action.selectionAction);
                this.changeDetector.detectChanges();
                break;
            }
        }
    }

    private get keyboardNavContext(): IdpKeyboardNavContextIdentifier {
        return {
            contextId: this.documentId,
            contextType: 'document',
        };
    }

    onDoubleClick(): void {
        this.onCopyDocumentDetailsToClipboard();
    }

    private onCopyDocumentDetailsToClipboard(): void {
        this.documentService.copyDocumentDetailsToClipboard(this.documentId);
    }
}
