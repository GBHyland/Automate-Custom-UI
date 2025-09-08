/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map } from 'rxjs';
import { IdpDocumentPage } from '../../models/screen-models';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export interface DragPlaceholderMetadata {
    targetPageIndex: number;
    targetDocumentId?: string;
    isPageDragging: boolean;
    isDocumentDragging: boolean;
    sourceSinglePage?: IdpDocumentPage;
}

@Injectable()
export class IdpDocumentDragDropService {
    private readonly isDraggingSubject$ = new BehaviorSubject<boolean>(false);
    readonly isDragging$ = this.isDraggingSubject$.asObservable();

    private readonly draggingObjectSubject$ = new BehaviorSubject<any>({});
    readonly draggingObject$ = this.draggingObjectSubject$.asObservable();

    private readonly draggingTargetSubject$ = new BehaviorSubject<any>({});
    readonly draggingTarget$ = this.draggingTargetSubject$.asObservable();

    private readonly draggingTargetPageSubject$ = new BehaviorSubject<IdpDocumentPage | undefined>(undefined);
    readonly draggingTargetPage$ = this.draggingTargetPageSubject$.asObservable();

    readonly dragPlaceholderMetadata$: Observable<DragPlaceholderMetadata>;

    readonly lists: string[] = [];
    protected subject = new BehaviorSubject<string[]>([]);
    lists$ = this.subject.asObservable();

    constructor(destroyRef: DestroyRef) {
        this.dragPlaceholderMetadata$ = combineLatest([this.draggingObject$, this.draggingTarget$, this.draggingTargetPage$, this.isDragging$]).pipe(
            takeUntilDestroyed(destroyRef),
            map(([draggingObj, draggingTarget, draggingTargetPage, isDragging]) => {
                const isPageDragging = !!draggingObj.pages && isDragging;
                let targetPageIndex = 0;
                let isDocumentDragging = false;

                if (isDragging && draggingObj.pages && draggingTarget.document) {
                    if (draggingTargetPage) {
                        targetPageIndex = draggingTarget.document.pages.findIndex((page: IdpDocumentPage) => page.id === draggingTargetPage.id);
                    }
                } else if (isDragging && draggingObj.documents) {
                    isDocumentDragging = true;
                }

                return {
                    targetDocumentId: draggingTarget.document?.id,
                    targetPageIndex,
                    isPageDragging,
                    isDocumentDragging,
                    sourceSinglePage: draggingObj.pages && draggingObj.pages.length === 1 ? draggingObj.pages[0] : undefined,
                };
            })
        );
    }

    addDropList(listId: string): void {
        this.lists.push(listId);
        this.lists.sort((a) => (a.startsWith('document') ? -1 : 1));
        this.subject.next(this.lists);
    }

    removeDropList(listId: string): void {
        const groupIx = this.lists.indexOf(listId);
        if (groupIx === -1) {
            return;
        }

        this.lists.splice(groupIx, 1);
        this.subject.next(this.lists);
    }

    setDraggingState(isDragging: boolean) {
        this.isDraggingSubject$.next(isDragging);
    }

    setDraggingObject(object: any) {
        this.draggingObjectSubject$.next(object);
    }

    setDraggingTarget(object: any) {
        this.draggingTargetSubject$.next(object);
    }

    setDraggingTargetPage(page: IdpDocumentPage) {
        this.draggingTargetPageSubject$.next(page);
    }
}
