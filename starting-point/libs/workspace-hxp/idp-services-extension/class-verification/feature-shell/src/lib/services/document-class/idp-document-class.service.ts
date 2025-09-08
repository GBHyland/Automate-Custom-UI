/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { DocumentClassMetadata, IdpConfigClass } from '../../models/screen-models';
import { ClassVerificationRootState } from '../../store/states/root.state';
import { selectAllDocumentClasses, selectClassMetadata, selectSelectedDocumentClass } from '../../store/selectors/document.selectors';
import { Store } from '@ngrx/store';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { userActions } from '../../store/actions/class-verification.actions';
import { selectViewFilter } from '../../store/selectors/screen.selectors';
import { IdpScreenViewFilter } from '../../models/common-models';

@Injectable()
export class IdpDocumentClassService {
    readonly selectedClass$: Observable<IdpConfigClass | undefined>;
    readonly allClasses$: Observable<IdpConfigClass[]>;
    readonly documentClassMetadata$: Observable<DocumentClassMetadata[]>;

    private readonly store: Store<ClassVerificationRootState> = inject(Store<ClassVerificationRootState>);
    private readonly destroyRef: DestroyRef = inject(DestroyRef);

    constructor() {
        this.allClasses$ = this.store.select(selectAllDocumentClasses).pipe(takeUntilDestroyed(this.destroyRef));
        this.selectedClass$ = this.store.select(selectSelectedDocumentClass).pipe(
            takeUntilDestroyed(this.destroyRef),
            distinctUntilChanged((prev, curr) => prev?.id === curr?.id)
        );

        this.documentClassMetadata$ = combineLatest([
            this.store.select(selectClassMetadata).pipe(takeUntilDestroyed(this.destroyRef)),
            this.store.select(selectViewFilter),
        ]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([docClassMetadata, viewFilter]) => {
                const sortedClassData = docClassMetadata.sort((a, b) => {
                    if (a.isSpecialClass || b.isSpecialClass) {
                        return a.isSpecialClass === b.isSpecialClass ? 0 : a.isSpecialClass ? -1 : 1;
                    }
                    if (a.documentsCount !== b.documentsCount) {
                        return b.documentsCount - a.documentsCount;
                    }
                    return 0;
                });

                return viewFilter === IdpScreenViewFilter.OnlyIssues
                    ? sortedClassData.filter((classItem) => classItem.issuesCount > 0)
                    : sortedClassData;
            })
        );

        // Reset Selection when class changes
        this.selectedClass$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.store.dispatch(userActions.pageSelect({ pageIds: [] }));
        });
    }

    setSelectedClass(classId: string): void {
        this.store.dispatch(userActions.classSelect({ classId }));
    }

    toggleExpandClass(classId: string): void {
        this.store.dispatch(userActions.classExpandToggle({ classId }));
    }

    togglePreviewClass(classId?: string): void {
        this.store.dispatch(userActions.classPreviewToggle({ classId }));
    }
}
