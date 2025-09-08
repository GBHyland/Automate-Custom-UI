/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FocusKeyManager } from '@angular/cdk/a11y';
import { DestroyRef, Injectable, OnDestroy, QueryList } from '@angular/core';
import { ListItemComponent } from '../../components/list-item/list-item.component';
import { BehaviorSubject, Observable, Subject, asapScheduler, merge, of } from 'rxjs';
import { distinctUntilChanged, filter, map, switchMap, takeUntil, withLatestFrom } from 'rxjs/operators';
import { IdpNavSelectionType } from '../../models/common-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { selectDocumentActionCompleteEvent } from '../../store/selectors/document.selectors';
import { Store } from '@ngrx/store';
import { ClassVerificationRootState } from '../../store/states/root.state';
import { IdpDocumentService } from './idp-document.service';
import { IdpDocumentAction, REJECTED_CLASS_ID, UNSORTED_DOCUMENT_LIST_ID } from '../../models/screen-models';
import { IdpShortcutAction, IdpShortcutService } from '@hxp/workspace-hxp/idp-services-extension/shared';

export type IdpKeyboardNavContextType = 'class' | 'document' | 'page' | 'root';

export interface IdpKeyboardNavContextIdentifier {
    contextType: IdpKeyboardNavContextType;
    contextId: string;
}

export interface IdpKeyboardNavContextState {
    activeItemIndex?: number;
}

export type IdpKeyboardNavContextData = IdpKeyboardNavContextIdentifier &
    IdpKeyboardNavContextState & {
        items: QueryList<ListItemComponent>;
        itemType: IdpKeyboardNavContextType;
        keydownEvent$: Observable<IdpKeyboardNavEvent>;
        clickEvent$: Observable<IdpKeyboardNavClickEvent>;
        canExpand: boolean;
        activateItemOnRegister: boolean;
        multiSelectAllowed: boolean;
    };

export enum IdpKeyboardNavActionTypeInternal {
    ActiveItemChanged = 'ActiveItemChanged',
    Expand = 'Expand',
    Collapse = 'Collapse',
}

export type IdpKeyboardNavActionType = IdpShortcutAction | IdpKeyboardNavActionTypeInternal;

export interface IdpKeyboardNavEvent {
    itemContext: IdpKeyboardNavContextIdentifier;
    event: KeyboardEvent;
    containerContext: IdpKeyboardNavContextIdentifier;
    data: unknown;
}

export type IdpKeyboardNavClickEvent = Omit<IdpKeyboardNavEvent, 'event'> & { event: MouseEvent };

export type IdpKeyboardNavAction = Omit<IdpKeyboardNavEvent, 'event'> & {
    type: IdpKeyboardNavActionType;
    currentActiveInfo: { id: string; activeContext: IdpKeyboardNavContextIdentifier | undefined };
    selectionAction: IdpNavSelectionType;
    event: KeyboardEvent | undefined;
};

export function isSameContext(context1: IdpKeyboardNavContextIdentifier | undefined, context2: IdpKeyboardNavContextIdentifier | undefined) {
    return context1?.contextId === context2?.contextId && context1?.contextType === context2?.contextType;
}

interface IdpKeyboardNavPendingContextSwitchJob {
    context: IdpKeyboardNavContextIdentifier;
    activateItemContextId?: string;
}

interface EventInfo {
    source: 'keyboard' | 'mouse';
    event: KeyboardEvent | MouseEvent;
}

@Injectable()
export class IdpKeyboardNavigationService implements OnDestroy {
    private readonly actionSubject$ = new Subject<IdpKeyboardNavAction>();
    readonly action$ = this.actionSubject$.asObservable();

    private keyManager?: FocusKeyManager<ListItemComponent>;
    private readonly contextStack: IdpKeyboardNavContextData[] = [];
    private activeContext?: IdpKeyboardNavContextData;
    private readonly registerSignal$ = new Subject<IdpKeyboardNavContextData>();
    private readonly unRegisterSignal$ = new Subject<IdpKeyboardNavContextIdentifier>();
    private readonly pendingContextSwitch$ = new BehaviorSubject<IdpKeyboardNavPendingContextSwitchJob | undefined>(undefined);
    private readonly forceTriggerActiveIndexChange$ = new Subject<void>();
    private activeKeyManagerSubscription$?: Subject<void>;
    private lastProcessedEvent?: EventInfo = undefined;
    private readonly multiSelectActions = [
        IdpShortcutAction.NavigateSelectDown,
        IdpShortcutAction.NavigateSelectUp,
        IdpShortcutAction.SelectAllUntilFirstContextOnly,
        IdpShortcutAction.SelectAllUntilLastContextOnly,
        IdpShortcutAction.SelectAllUntilFirstContextAll,
        IdpShortcutAction.SelectAllUntilLastContextAll,
    ];

    constructor(
        private readonly shortcutService: IdpShortcutService,
        readonly documentService: IdpDocumentService,
        private readonly destroyRef: DestroyRef,
        store: Store<ClassVerificationRootState>
    ) {
        store
            .select(selectDocumentActionCompleteEvent)
            .pipe(
                filter((docEvent) => !!docEvent),
                takeUntilDestroyed(this.destroyRef),
                withLatestFrom(this.documentService.allDocuments$)
            )
            .subscribe(([docEvent, allDocuments]) => {
                let newContext: IdpKeyboardNavContextIdentifier | undefined;
                let fallbackContext: IdpKeyboardNavContextIdentifier | undefined;

                switch (docEvent?.action) {
                    case IdpDocumentAction.Merge:
                    case IdpDocumentAction.Split:
                    case IdpDocumentAction.MovePageAndCreate:
                    case IdpDocumentAction.MovePage: {
                        const page = docEvent.pages[0];
                        if (page) {
                            newContext = { contextType: 'page', contextId: page.id };
                            fallbackContext = { contextType: 'document', contextId: page.documentId };
                        }
                        break;
                    }
                    case IdpDocumentAction.ChangeClass:
                    case IdpDocumentAction.Delete: {
                        if (allDocuments.length === 0) {
                            this.switchToRootContext('current');
                        } else {
                            let document = allDocuments.find((d) => d.id === docEvent.documents[0]);
                            let page;
                            if (document) {
                                // For change class this path will never follow
                                const activeItemIndex =
                                    this.activeContext?.activeItemIndex ?? 0 > document.pages.length - 1
                                        ? document.pages.length - 1
                                        : this.activeContext?.activeItemIndex;
                                page = document.pages[activeItemIndex ?? 0];
                            } else {
                                const activeItemIndex =
                                    this.activeContext?.activeItemIndex ?? 0 > allDocuments.length - 1
                                        ? allDocuments.length - 1
                                        : this.activeContext?.activeItemIndex;
                                document = allDocuments[activeItemIndex ?? 0];
                            }

                            newContext = { contextType: 'page', contextId: page?.id || document.pages[0]?.id };
                            fallbackContext = { contextType: 'document', contextId: document.id };
                        }
                        break;
                    }
                }

                asapScheduler.schedule(() => newContext && this.setActiveItemContext(newContext, fallbackContext));
            });

        this.pendingContextSwitch$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                switchMap((pendingContextSwitch) => {
                    const isContextAvailable = this.contextStack.some((c) => isSameContext(c, pendingContextSwitch?.context));
                    if (isContextAvailable) {
                        return of({ ...pendingContextSwitch, resolvePending: true });
                    }

                    // If the context is not available, wait for the context to be registered
                    return this.registerSignal$.pipe(
                        filter((c) => {
                            return c.activateItemOnRegister || pendingContextSwitch !== undefined;
                        }),
                        map((c) => ({
                            context: c,
                            activateItemContextId: undefined,
                            resolvePending: isSameContext(c, pendingContextSwitch?.context),
                        }))
                    );
                })
            )
            .subscribe({
                next: (data) => {
                    if (data && data.context) {
                        this.switchContext(data.context, data.activateItemContextId);
                    }
                    if (data?.resolvePending) {
                        // eslint-disable-next-line unicorn/no-useless-undefined
                        asapScheduler.schedule(() => this.pendingContextSwitch$.next(undefined));
                    }
                },
                error: (error) => console.error('Error in pending context switch', error),
            });
    }

    ngOnDestroy() {
        this.activeKeyManagerSubscription$?.next();
        this.activeKeyManagerSubscription$?.complete();
    }

    registerContext(context: IdpKeyboardNavContextData) {
        this.contextStack.push(context);

        this.registerSignal$.next(context);

        this.subscribeUntilUnregister(context.keydownEvent$, context, this.onKeydown.bind(this));
        this.subscribeUntilUnregister(context.clickEvent$, context, this.onItemClick.bind(this));
    }

    unregisterContext(context: IdpKeyboardNavContextIdentifier) {
        const index = this.contextStack.findIndex((c) => isSameContext(c, context));
        if (index > -1) {
            if (isSameContext(this.activeContext, context)) {
                this.switchToContainerContext(context);
            }

            this.contextStack.splice(index, 1);
        }

        this.unRegisterSignal$.next(context);
    }

    setActiveItemContext(context: IdpKeyboardNavContextIdentifier, fallbackContext: IdpKeyboardNavContextIdentifier | undefined) {
        let targetContextId = context.contextId;
        let targetContext = this.findParentContext(context, false);
        if (!targetContext && fallbackContext) {
            targetContext = this.findParentContext(fallbackContext, true);
            targetContextId = fallbackContext?.contextId;
        }

        if (targetContext) {
            if (!this.keyManager || !isSameContext(targetContext, this.activeContext)) {
                this.switchContext(targetContext, targetContextId);
            } else {
                const index = targetContext.items.toArray().findIndex((i) => i.id === targetContextId);
                if (index > -1) {
                    targetContext.activeItemIndex = index;
                    this.keyManager?.setActiveItem(index);
                }
            }
            this.forceTriggerActiveIndexChange$.next();
        }
    }

    private switchContext(context: IdpKeyboardNavContextIdentifier, activateItemContextId?: string, postSwitchNav?: 'first' | 'last') {
        if (activateItemContextId && postSwitchNav) {
            throw new Error('activateItemContextId and postSwitchNav cannot be used together');
        }

        if (isSameContext(this.activeContext, context)) {
            return;
        }

        // save the current active item index before switching context
        if (this.keyManager && this.activeContext) {
            // relying on activeContext and item within the contextStack to be the same reference
            this.activeContext.activeItemIndex = this.keyManager.activeItemIndex ?? 0;
        }

        const newContext = this.contextStack.find((c) => isSameContext(c, context));

        if (newContext) {
            if (activateItemContextId) {
                let prevCandidateIndex = -1;
                let activeCandidateIndex = -1;
                let considerNextNonDisabledItemAsCandidate = false;
                for (const [index, item] of newContext.items.toArray().entries()) {
                    if (activeCandidateIndex !== -1) {
                        continue;
                    }

                    // Store the previous non-disabled item index as a candidate
                    if (index > 0 && !item.disabled) {
                        prevCandidateIndex = index;
                    }

                    // If item to activate is found to be disabled, consider the next non-disabled item as a candidate
                    if (considerNextNonDisabledItemAsCandidate && !item.disabled) {
                        activeCandidateIndex = index;
                        continue;
                    }

                    // Item to activate, accept only if not disabled
                    if (item.id === activateItemContextId) {
                        if (item.disabled) {
                            considerNextNonDisabledItemAsCandidate = true;
                        } else {
                            activeCandidateIndex = index;
                        }
                    }
                }

                activeCandidateIndex = activeCandidateIndex > -1 ? activeCandidateIndex : prevCandidateIndex;
                if (activeCandidateIndex > -1) {
                    newContext.activeItemIndex = activeCandidateIndex;
                }
            } else if (postSwitchNav) {
                newContext.activeItemIndex = postSwitchNav === 'first' ? 0 : newContext.items.length - 1;
            }
            this.setActiveContext(newContext);
        } else {
            this.resetContext();
            console.error('Navigation context not registered properly.', context.contextType, context.contextId);
        }
    }

    private onKeydown(ev: IdpKeyboardNavEvent) {
        if (ev.event?.defaultPrevented) {
            return;
        }

        this.lastProcessedEvent = undefined;

        const shortcut = this.shortcutService.getShortcutForEvent(ev.event);
        if (!shortcut) {
            return;
        }
        ev.event.preventDefault();

        if (
            !this.keyManager ||
            !this.activeContext ||
            !isSameContext(ev.containerContext, this.activeContext) ||
            this.activeContext?.itemType !== ev.itemContext.contextType
        ) {
            this.switchContext(ev.containerContext);
        }

        if (!this.keyManager || !this.activeContext) {
            return;
        }

        this.lastProcessedEvent = { source: 'keyboard', event: ev.event };
        let action: IdpKeyboardNavActionType = shortcut.action;

        // Handle special navigation actions
        if (shortcut.category === 'navigation' || shortcut.category === 'navigation_and_selection') {
            switch (shortcut.action) {
                case IdpShortcutAction.NavigateFirstContextOnly:
                case IdpShortcutAction.SelectAllUntilFirstContextOnly: {
                    this.keyManager.setFirstItemActive();
                    break;
                }
                case IdpShortcutAction.NavigateLastContextOnly:
                case IdpShortcutAction.SelectAllUntilLastContextOnly: {
                    this.keyManager.setLastItemActive();
                    break;
                }
                case IdpShortcutAction.NavigateNextClass: {
                    this.switchToRootContext('next');
                    break;
                }
                case IdpShortcutAction.NavigatePrevClass: {
                    this.switchToRootContext('prev');
                    break;
                }
                case IdpShortcutAction.Toggle: {
                    const toggleAction = this.determineToggleAction(ev.itemContext);
                    if (toggleAction) {
                        action = toggleAction;
                    }
                    break;
                }
                case IdpShortcutAction.NavigateUp: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'prev');
                    break;
                }
                case IdpShortcutAction.NavigateDown: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'next');
                    break;
                }
                case IdpShortcutAction.NavigateSelectUp: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'prev', true);
                    break;
                }
                case IdpShortcutAction.NavigateSelectDown: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'next', true);
                    break;
                }
                case IdpShortcutAction.NavigateFirstContextAll: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'first');
                    break;
                }
                case IdpShortcutAction.NavigateLastContextAll: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'last');
                    break;
                }
                case IdpShortcutAction.SelectAllUntilFirstContextAll: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'first', true);
                    break;
                }
                case IdpShortcutAction.SelectAllUntilLastContextAll: {
                    this.checkSiblingItemStateAndSwitchContext(ev.containerContext, ev.itemContext, 'last', true);
                    break;
                }
                default: {
                    this.keyManager.onKeydown(ev.event);
                    break;
                }
            }
        }

        this.emitAction(ev, action, 'none');
    }

    private isContextExpanded(
        containerContext: IdpKeyboardNavContextIdentifier | IdpKeyboardNavContextData,
        itemContext: IdpKeyboardNavContextIdentifier
    ) {
        const context = 'canExpand' in containerContext ? containerContext : this.contextStack.find((c) => isSameContext(c, containerContext));
        if (!context || !context.canExpand) {
            return false;
        }

        // if any context registered with item context, consider it as expanded, otherwise collapsed.
        return this.contextStack.some((c) => isSameContext(c, itemContext));
    }

    private determineToggleAction(itemContext: IdpKeyboardNavContextIdentifier): IdpKeyboardNavActionTypeInternal | undefined {
        if (!this.activeContext) {
            return undefined;
        }

        const isExpanded = this.isContextExpanded(this.activeContext, itemContext);
        return isExpanded ? IdpKeyboardNavActionTypeInternal.Collapse : IdpKeyboardNavActionTypeInternal.Expand;
    }

    checkSiblingItemStateAndSwitchContext(
        containerContext: IdpKeyboardNavContextIdentifier,
        itemContext: IdpKeyboardNavContextIdentifier,
        direction: 'prev' | 'next' | 'first' | 'last',
        considerSelectionBoundary = false
    ) {
        if (itemContext.contextId === REJECTED_CLASS_ID && (direction === 'next' || direction === 'prev')) {
            const unsortedCtx = this.contextStack.find((ctx) => ctx.contextId === UNSORTED_DOCUMENT_LIST_ID);
            if (unsortedCtx) {
                this.switchContext(unsortedCtx, undefined, direction === 'next' ? 'first' : 'last');
                return;
            }
        }

        const containerContextData = this.contextStack.find((c) => isSameContext(c, containerContext));
        if (!containerContextData || !this.keyManager) {
            return;
        }

        if (direction === 'first') {
            this.switchToParentContext(containerContext, 'first', considerSelectionBoundary);
            return;
        }

        if (direction === 'last') {
            this.switchToParentContext(containerContext, 'last', considerSelectionBoundary);
            return;
        }

        if (direction === 'prev') {
            // If already at the first item, switch to parent context
            if (this.keyManager.activeItemIndex === 0) {
                this.switchToParentContext(containerContext, 'current', considerSelectionBoundary);
                return;
            }

            const prevSiblingIndex = (this.keyManager.activeItemIndex || 0) - 1;
            const prevSiblingItem = containerContextData.items.toArray()[prevSiblingIndex];
            if (prevSiblingIndex < 0 || !prevSiblingItem) {
                return;
            }

            itemContext = {
                contextId: prevSiblingItem.id,
                contextType: containerContextData.itemType,
            };
        }

        const hasMoreThanOneItemAndExpanded =
            this.isContextExpanded(containerContextData, itemContext) &&
            (this.contextStack.find((c) => isSameContext(c, itemContext))?.items.length || 0) > 1;
        if (hasMoreThanOneItemAndExpanded) {
            this.switchContext(itemContext, undefined, direction === 'prev' ? 'last' : 'first');
        } else {
            if (direction === 'prev') {
                this.keyManager?.setPreviousItemActive();
            } else if (direction === 'next') {
                if (this.keyManager.activeItemIndex === containerContextData.items.length - 1) {
                    this.switchToParentContext(containerContext, 'next', considerSelectionBoundary);
                    return;
                }
                this.keyManager?.setNextItemActive();
            }
        }
    }

    private switchToParentContext(
        containerContext: IdpKeyboardNavContextIdentifier,
        postSwitchNav: 'next' | 'prev' | 'current' | 'first' | 'last',
        restrictSwitchOverSelectionBoundary = false
    ) {
        const parentContext = this.findParentContext(containerContext, true);

        if (restrictSwitchOverSelectionBoundary && !parentContext?.multiSelectAllowed) {
            if (postSwitchNav === 'next') {
                this.keyManager?.setNextItemActive();
            }
            if (postSwitchNav === 'prev') {
                this.keyManager?.setPreviousItemActive();
            }
            if (postSwitchNav === 'first') {
                this.keyManager?.setFirstItemActive();
            }
            if (postSwitchNav === 'last') {
                this.keyManager?.setLastItemActive();
            }
            return;
        }

        if (parentContext) {
            this.switchContext(parentContext, containerContext.contextId);
            asapScheduler.schedule(() => {
                if (postSwitchNav === 'next') {
                    if (this.activeContext && this.keyManager?.activeItemIndex === this.activeContext.items.length - 1) {
                        this.switchToParentContext(this.activeContext, 'next', restrictSwitchOverSelectionBoundary);
                    } else {
                        this.keyManager?.setNextItemActive();
                    }
                }

                if (postSwitchNav === 'prev') {
                    this.keyManager?.setPreviousItemActive();
                }

                if (postSwitchNav === 'first') {
                    this.keyManager?.setFirstItemActive();
                }

                if (postSwitchNav === 'last') {
                    this.keyManager?.setLastItemActive();
                }

                this.forceTriggerActiveIndexChange$.next();
            });
        }
    }

    private emitAction(ev: IdpKeyboardNavEvent, shortcutAction: IdpKeyboardNavActionType, selectionAction: IdpNavSelectionType) {
        this.actionSubject$.next({
            ...ev,
            type: shortcutAction,
            currentActiveInfo: {
                id: this.keyManager?.activeItem?.id ?? '',
                activeContext: this.activeContext
                    ? { contextId: this.activeContext.contextId, contextType: this.activeContext.contextType }
                    : undefined,
            },
            selectionAction,
        });
    }

    private onItemClick(ev: IdpKeyboardNavClickEvent) {
        if (ev.event?.defaultPrevented) {
            return;
        }

        this.lastProcessedEvent = { source: 'mouse', event: ev.event };

        // change active index for the corresponding context
        if (this.activeContext && isSameContext(ev.containerContext, this.activeContext)) {
            const index = this.activeContext.items.toArray().findIndex((i) => i.id === ev.itemContext.contextId);
            if (index > -1) {
                this.activeContext.activeItemIndex = index;
                if (this.keyManager?.activeItemIndex === index && this.clickedOnActiveElement(ev)) {
                    this.forceTriggerActiveIndexChange$.next();
                } else {
                    this.keyManager?.setActiveItem(index);
                }
            }
        } else {
            this.switchContext(ev.containerContext, ev.itemContext.contextId);
        }
    }

    private clickedOnActiveElement(ev: IdpKeyboardNavClickEvent): boolean {
        return ev.itemContext.contextId === this.keyManager?.activeItem?.id;
    }

    private onItemListChange(items: QueryList<ListItemComponent>, context: IdpKeyboardNavContextData) {
        if (
            isSameContext(this.activeContext, context) && // Handle the case where current context has no navigable items
            items.length === 0
        ) {
            this.switchToContainerContext(context);
            this.forceTriggerActiveIndexChange$.next();
        }
    }

    private subscribeUntilUnregister<T>(source: Observable<T>, context: IdpKeyboardNavContextIdentifier, subscribeNextFn: (value: T) => void) {
        return source
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                takeUntil(this.unRegisterSignal$.pipe(filter((c) => c.contextId === context.contextId && c.contextType === context.contextType)))
            )
            .subscribe(subscribeNextFn);
    }

    private switchToRootContext(postSwitchNav: 'next' | 'prev' | 'current') {
        const rootContext = this.contextStack.find((c) => c.contextType === 'root');
        if (rootContext) {
            if (!isSameContext(this.activeContext, rootContext)) {
                let parentContext = this.activeContext ? { ...this.activeContext } : undefined;
                let depth = 0;
                while (parentContext && parentContext.contextType !== rootContext.itemType && depth < 5) {
                    depth++;
                    parentContext = this.contextStack.find(
                        (c) => c.itemType === parentContext?.contextType && c.items.some((i) => i.id === parentContext?.contextId)
                    );
                }

                this.switchContext(rootContext, parentContext?.contextId);
            }

            if (postSwitchNav === 'next') {
                this.keyManager?.setNextItemActive();
            } else if (postSwitchNav === 'prev') {
                this.keyManager?.setPreviousItemActive();
            }
        }
    }

    private switchToContainerContext(context: IdpKeyboardNavContextIdentifier) {
        const containerContext = this.findParentContext(context, true);
        if (containerContext) {
            this.switchContext(containerContext, context.contextId);
        } else {
            this.switchToRootContext('current');
        }
    }

    private resetContext() {
        this.activeKeyManagerSubscription$?.next();
        this.activeKeyManagerSubscription$?.complete();
        this.activeKeyManagerSubscription$ = undefined;
        this.activeContext = undefined;
        this.keyManager = undefined;
    }

    private findParentContext(context: IdpKeyboardNavContextIdentifier, selectFirstOfTypeIfNotFound: boolean) {
        const matchingParentContexts = this.contextStack.filter((c) => c.itemType === context.contextType);
        const parentContext =
            matchingParentContexts.find((c) => c.items.some((i) => i.id === context.contextId)) ||
            (selectFirstOfTypeIfNotFound ? matchingParentContexts[0] : undefined);
        return parentContext;
    }

    private setActiveContext(context: IdpKeyboardNavContextData) {
        this.activeContext = context;
        this.initKeyManager(context);
    }

    private initKeyManager(context: IdpKeyboardNavContextData) {
        this.keyManager = this.createKeyManager(context.items);

        // Add Listeners
        this.activeKeyManagerSubscription$?.next();
        this.activeKeyManagerSubscription$?.complete();
        this.activeKeyManagerSubscription$ = new Subject<void>();

        // Listen to tab out event
        this.keyManager.tabOut.pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.activeKeyManagerSubscription$)).subscribe(() => {
            this.resetContext();
        });

        // listen to active item change event
        merge(this.keyManager.change, this.forceTriggerActiveIndexChange$)
            .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.activeKeyManagerSubscription$))
            .subscribe(() => {
                const activeItem = this.keyManager?.activeItem;
                if (!activeItem) {
                    return;
                }

                const keyboardEvent = this.lastProcessedEvent?.source === 'keyboard' ? (this.lastProcessedEvent.event as KeyboardEvent) : undefined;

                const action: IdpKeyboardNavAction = {
                    itemContext: {
                        contextId: activeItem.id,
                        contextType: context.itemType,
                    },
                    containerContext: context,
                    type: IdpKeyboardNavActionTypeInternal.ActiveItemChanged,
                    event: keyboardEvent,
                    currentActiveInfo: {
                        id: this.keyManager?.activeItem?.id ?? '',
                        activeContext: this.activeContext
                            ? { contextId: this.activeContext.contextId, contextType: this.activeContext.contextType }
                            : undefined,
                    },
                    data: this.keyManager?.activeItem,
                    selectionAction: this.resolveSelectionAction(this.lastProcessedEvent, 'single'),
                };

                this.actionSubject$.next(action);
            });

        // listen to item list change event
        context.items.changes
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                distinctUntilChanged((prev: QueryList<ListItemComponent>, curr: QueryList<ListItemComponent>) => prev?.length === curr?.length),
                takeUntil(this.activeKeyManagerSubscription$)
            )
            .subscribe((items) => {
                this.onItemListChange(items, context);
            });

        // set active item index if available
        if (context.activeItemIndex !== undefined && context.activeItemIndex > -1) {
            this.keyManager.setActiveItem(context.activeItemIndex);
        } else {
            this.keyManager.setFirstItemActive();
        }
    }

    private createKeyManager(items: QueryList<ListItemComponent>) {
        return new FocusKeyManager<ListItemComponent>(items).withHomeAndEnd(true);
    }

    private resolveSelectionAction(eventInfo: EventInfo | undefined, defaultSelectionAction: IdpNavSelectionType = 'none'): IdpNavSelectionType {
        if (eventInfo?.source === 'keyboard') {
            const ev = eventInfo.event as KeyboardEvent;
            const shortcut = this.shortcutService.getShortcutForEvent(ev);

            if (!shortcut?.action) {
                return defaultSelectionAction;
            }
            if (this.multiSelectActions.includes(shortcut.action)) {
                return 'multiRange';
            }
            if (shortcut.category === 'navigation') {
                return 'single';
            }
        }

        if (eventInfo?.source === 'mouse') {
            const ev = eventInfo.event as MouseEvent;
            if (ev.ctrlKey || ev.metaKey) {
                return 'multi';
            }
            if (ev.shiftKey) {
                return 'multiRange';
            }
            return 'single';
        }

        return defaultSelectionAction;
    }
}
