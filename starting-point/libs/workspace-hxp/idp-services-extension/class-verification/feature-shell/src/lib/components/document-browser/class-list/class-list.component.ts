/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    AfterViewInit,
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    OnDestroy,
    OnInit,
    QueryList,
    ViewChildren,
} from '@angular/core';
import { delay, distinctUntilChanged, map, take } from 'rxjs/operators';
import { Observable, Subject, combineLatest, of } from 'rxjs';
import {
    DocumentClassMetadata,
    IdpConfigClass,
    IdpDocument,
    IdpDocumentAction,
    IdpDocumentPage,
    REJECTED_CLASS_ID,
    UNCLASSIFIED_CLASS_ID,
} from '../../../models/screen-models';
import { IdpDocumentService } from '../../../services/document/idp-document.service';
import {
    IdpKeyboardNavAction,
    IdpKeyboardNavActionTypeInternal,
    IdpKeyboardNavClickEvent,
    IdpKeyboardNavContextIdentifier,
    IdpKeyboardNavEvent,
    IdpKeyboardNavigationService,
    isSameContext,
} from '../../../services/document/idp-keyboard-navigation.service';
import { IdpDocumentClassService } from '../../../services/document-class/idp-document-class.service';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { ListItemComponent } from '../../list-item/list-item.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { ClassListHeaderToolbarComponent } from '../header-toolbar/class-list-header-toolbar.component';
import { FloatingToolbarComponent } from '../floating-toolbar/floating-toolbar.component';
import { ClassDocumentListComponent } from '../class-document-list/class-document-list.component';
import { MatButtonModule } from '@angular/material/button';
import { IdpShortcutAction, TemplateLetDirective } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop';
import { IdpDocumentToolbarService } from '../../../services/document/idp-document-toolbar.service';
import { DragPlaceholderMetadata, IdpDocumentDragDropService } from '../../../services/document/idp-drag-drop.service';
import { IdpScreenViewSortOption } from '../../../models/common-models';
import { UnsortedDocumentListComponent } from '../unsorted-document-list/unsorted-document-list.component';

@Component({
    selector: 'hyland-idp-class-list',
    templateUrl: './class-list.component.html',
    styleUrls: ['./class-list.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: true,
    imports: [
        CommonModule,
        ClassListHeaderToolbarComponent,
        ClassDocumentListComponent,
        FloatingToolbarComponent,
        ListItemComponent,
        MatButtonModule,
        MatCardModule,
        MatDividerModule,
        MatIconModule,
        MatListModule,
        MatTooltipModule,
        DragDropModule,
        TemplateLetDirective,
        UnsortedDocumentListComponent,
    ],
})
export class ClassListComponent implements AfterViewInit, OnInit, OnDestroy {
    @ViewChildren(ListItemComponent) items!: QueryList<ListItemComponent>;

    classesData$: Observable<DocumentClassMetadata[]> = of([]);
    rejectedClass$: Observable<DocumentClassMetadata | undefined> = of(undefined);
    pages$: Observable<IdpDocumentPage[]> = of([]);
    sortOption$: Observable<IdpScreenViewSortOption> = of(IdpScreenViewSortOption.Original);
    isDragging$: Observable<boolean>;
    selectedClass?: IdpConfigClass;

    private keydownEvent$ = new Subject<IdpKeyboardNavEvent>();
    private clickEvent$ = new Subject<IdpKeyboardNavClickEvent>();

    classHoveredWithDrag?: string;
    globalDropListId!: string;
    allDropLists: string[] = [];

    readonly dragPlaceholderMetadata$: Observable<DragPlaceholderMetadata>;
    readonly classUniquenessFn = (i: number, contentType: DocumentClassMetadata) => contentType.id;
    readonly SortOption = IdpScreenViewSortOption;

    constructor(
        private readonly documentClassService: IdpDocumentClassService,
        private readonly documentService: IdpDocumentService,
        private readonly keyboardNavigationService: IdpKeyboardNavigationService,
        private readonly changeDetector: ChangeDetectorRef,
        private readonly destroyRef: DestroyRef,
        private readonly documentToolbarService: IdpDocumentToolbarService,
        private readonly dragDropService: IdpDocumentDragDropService
    ) {
        this.isDragging$ = this.dragDropService.isDragging$.pipe(takeUntilDestroyed(this.destroyRef));
        this.sortOption$ = this.documentService.getSortOption().pipe(takeUntilDestroyed(this.destroyRef));
        documentClassService.selectedClass$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selectedClass) => {
            this.selectedClass = selectedClass;
        });

        this.dragPlaceholderMetadata$ = this.dragDropService.dragPlaceholderMetadata$;
        this.globalDropListId = `global-drop-list`;
        this.dragDropService.addDropList(this.globalDropListId);

        this.dragDropService.lists$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((lists) => (this.allDropLists = lists));
    }

    ngOnInit(): void {
        this.classesData$ = this.documentClassService.documentClassMetadata$.pipe(takeUntilDestroyed(this.destroyRef));

        this.rejectedClass$ = this.classesData$.pipe(
            takeUntilDestroyed(this.destroyRef),
            map((classes) => classes.find((cl) => cl.id === REJECTED_CLASS_ID))
        );

        // select first class if selected class is not in the displayed list
        combineLatest([this.classesData$, this.documentClassService.selectedClass$.pipe(distinctUntilChanged((prev, curr) => prev?.id === curr?.id))])
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe(([displayedClasses, selectedClass]) => {
                if (displayedClasses.findIndex((cl) => cl.id === selectedClass?.id) === -1 && displayedClasses.length > 0) {
                    this.onItemListChanged(displayedClasses[0], 'select');
                }
            });

        this.keyboardNavigationService.action$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action) => {
            this.onNavigationAction(action);
        });
    }

    ngAfterViewInit() {
        this.keyboardNavigationService.registerContext({
            ...this.keyboardNavContext,
            items: this.items,
            itemType: 'class',
            keydownEvent$: this.keydownEvent$,
            clickEvent$: this.clickEvent$,
            canExpand: true,
            activateItemOnRegister: false,
            multiSelectAllowed: false,
        });

        this.selectFirstClassWithIssue();
    }

    ngOnDestroy(): void {
        this.dragDropService.removeDropList(this.globalDropListId);
        this.keyboardNavigationService.unregisterContext(this.keyboardNavContext);
    }

    onMouseEnter(item: DocumentClassMetadata, isDragging: boolean): void {
        if (!isDragging) {
            return;
        }

        this.classHoveredWithDrag = item.id;
        this.dragDropService.setDraggingTarget({ class: item });
        this.dragDropService.draggingObject$.pipe(take(1)).subscribe((draggingObj) => {
            if (draggingObj.pages) {
                this.documentClassService.togglePreviewClass(item.id);
            }
        });
    }

    onMouseLeave(): void {
        this.classHoveredWithDrag = undefined;
    }

    isHoveredWithDrag(item: DocumentClassMetadata): boolean {
        return this.classHoveredWithDrag === item.id;
    }

    onDrop(event: CdkDragDrop<any>): void {
        if (event.isPointerOverContainer) {
            combineLatest([
                this.dragDropService.draggingObject$,
                this.dragDropService.draggingTarget$,
                this.dragDropService.draggingTargetPage$,
                this.sortOption$,
            ])
                .pipe(take(1))
                .subscribe(([draggingObj, draggingTarget, draggingTargetPage, sortOption]) => {
                    if (draggingObj.pages && draggingTarget.document) {
                        let currentIndex = 0;
                        if (draggingTargetPage) {
                            currentIndex = draggingTarget.document.pages.findIndex((page: IdpDocumentPage) => page.id === draggingTargetPage.id);
                        }
                        this.documentToolbarService.handleMovePages(draggingObj.pages, draggingTarget.document.id, currentIndex);
                    } else if (draggingObj.documents && (draggingTarget.class || draggingTarget.document)) {
                        const targetClassId = this.getTargetClassId(draggingTarget);

                        if (sortOption === IdpScreenViewSortOption.Original && targetClassId !== REJECTED_CLASS_ID) {
                            this.clearDraggingState();
                            return;
                        }

                        for (const doc of draggingObj.documents) {
                            const documentClassId = this.getDraggingDocumentClassId(doc);

                            if (targetClassId !== documentClassId) {
                                if (targetClassId === REJECTED_CLASS_ID) {
                                    this.documentToolbarService.handleRejectPage(doc.pages, IdpDocumentAction.Reject);
                                } else {
                                    this.documentService.setDocumentClass(IdpDocumentAction.ChangeClass, true, doc.pages, targetClassId);
                                }
                            }
                        }
                    }

                    this.clearDraggingState();
                });
        }
    }

    onItemKeyDown(item: DocumentClassMetadata, event: KeyboardEvent): void {
        if (item.disabled) {
            return;
        }

        this.keydownEvent$.next({
            itemContext: { contextId: item.id, contextType: 'class' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });
    }

    onContainerKeyDown(items: DocumentClassMetadata[], event: KeyboardEvent) {
        if (items.length > 0) {
            this.onItemKeyDown(items[0], event);
        }
    }

    onItemClicked(item: DocumentClassMetadata, event: MouseEvent) {
        if (item.disabled) {
            return;
        }

        this.clickEvent$.next({
            itemContext: { contextId: item.id, contextType: 'class' },
            containerContext: this.keyboardNavContext,
            event,
            data: item,
        });

        this.onItemListChanged(item, 'toggle');
    }

    onDocumentCollapseRequest(item: DocumentClassMetadata) {
        this.toggleList(item, 'collapse');
    }

    toggleList(item: DocumentClassMetadata, forceOp: 'expand' | 'collapse' | 'toggle' = 'toggle') {
        if (forceOp === 'expand' && item.isExpanded) {
            return;
        }
        if (forceOp === 'collapse' && !item.isExpanded) {
            return;
        }
        if (item.isExpanded === false && !item.canExpand) {
            return;
        }

        item.isExpanded = !item.isExpanded;

        if (!item.isExpanded) {
            this.documentService.resetPageSelection();
        }

        if (this.selectedClass?.id !== item.id) {
            this.selectedClass = item;
            this.documentClassService.setSelectedClass(item.id);
        }

        this.documentClassService.toggleExpandClass(item.id);
    }

    private getTargetClassId(draggingTarget: any) {
        let classId = '';
        if (draggingTarget.class) {
            classId = draggingTarget.class.id;
        } else if (draggingTarget.document.class) {
            classId = draggingTarget.document.class.id;
        } else {
            classId = draggingTarget.document.rejectedReasonId ? REJECTED_CLASS_ID : UNCLASSIFIED_CLASS_ID;
        }

        return classId;
    }

    private getDraggingDocumentClassId(doc: IdpDocument) {
        let classId = '';
        if (doc.class) {
            classId = doc.class.id;
        } else {
            classId = doc.rejectedReasonId ? REJECTED_CLASS_ID : UNCLASSIFIED_CLASS_ID;
        }

        return classId;
    }

    private onItemListChanged(item: DocumentClassMetadata, mode: 'toggle' | 'select') {
        this.selectedClass = item;
        this.documentClassService.setSelectedClass(item.id);
        this.toggleList(item, mode === 'toggle' ? 'toggle' : 'expand');
    }

    private onNavigationAction(action: IdpKeyboardNavAction) {
        const isValidContext = action.itemContext?.contextType === 'class' && isSameContext(action.containerContext, this.keyboardNavContext);
        const item = action.data as DocumentClassMetadata;
        if (!isValidContext || !item) {
            return;
        }

        switch (action.type) {
            case IdpKeyboardNavActionTypeInternal.Expand: {
                this.onItemListChanged(item, 'select');
                break;
            }
            case IdpShortcutAction.Collapse:
            case IdpKeyboardNavActionTypeInternal.Collapse: {
                this.toggleList(item, 'collapse');
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
                this.documentClassService.setSelectedClass(activeItemId);
                this.changeDetector.detectChanges();
                break;
            }
        }
    }

    private get keyboardNavContext(): IdpKeyboardNavContextIdentifier {
        return {
            contextId: '',
            contextType: 'root',
        };
    }

    private selectFirstClassWithIssue() {
        this.classesData$.pipe(takeUntilDestroyed(this.destroyRef), delay(10), take(1)).subscribe((classesData) => {
            const classToSelect =
                classesData.find((classItem) => classItem.issuesCount > 0) ||
                classesData.find((classItem) => classItem.documentsCount > 0) ||
                classesData[0];
            if (classToSelect) {
                this.onItemListChanged(classToSelect, 'select');
            }
        });
    }

    private clearDraggingState() {
        this.dragDropService.setDraggingObject({});
        this.dragDropService.setDraggingTarget({});
        this.documentService.togglePreviewedDocument();
        this.documentClassService.togglePreviewClass();
    }
}
