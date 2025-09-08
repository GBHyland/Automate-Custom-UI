/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, inject, Injectable } from '@angular/core';
import { Observable, combineLatest, merge } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Store } from '@ngrx/store';
import { selectCanComplete, selectCanSave, selectRejectReasons, selectScreenReady, selectTaskInfo } from '../../store/selectors/screen.selectors';
import { IdpContextTaskBaseService, IdpTaskActions, RejectReason, TaskContext } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { TranslateService } from '@ngx-translate/core';
import { systemActions, userActions } from '../../store/actions/field-verification.actions';
import { selectDocument } from '../../store/selectors/document.selectors';
import { selectFieldsWithIssue } from '../../store/selectors/document-field.selectors';
import { IdpTaskInfo } from '../../models/screen-models';
import { Actions, ofType } from '@ngrx/effects';

@Injectable()
export class FieldVerificationContextTaskService extends IdpContextTaskBaseService {
    override readonly taskInfo$: Observable<IdpTaskInfo>;
    override readonly taskAction$: Observable<{ action: IdpTaskActions; openNextTask?: boolean }>;
    override readonly screenReady$: Observable<boolean>;
    override readonly taskCanSave$: Observable<boolean>;
    override readonly taskCanComplete$: Observable<boolean>;
    override readonly taskCanUnclaim$: Observable<boolean>;
    override readonly rejectReasons$: Observable<RejectReason[]>;

    private readonly store = inject(Store);
    private readonly destroyRef = inject(DestroyRef);
    private readonly translateService = inject(TranslateService);
    private readonly actions$ = inject(Actions);

    constructor() {
        super();

        this.taskInfo$ = combineLatest([
            this.store.select(selectTaskInfo),
            this.store.select(selectDocument),
            this.store.select(selectFieldsWithIssue),
        ]).pipe(
            takeUntilDestroyed(this.destroyRef),
            map(([taskInfo, document, fieldsWithIssue]) => {
                return {
                    taskId: taskInfo.taskId,
                    taskName: taskInfo.taskName,
                    taskType: taskInfo.taskName,
                    canClaimTask: taskInfo.canClaimTask,
                    canUnclaimTask: taskInfo.canUnclaimTask,
                    issuesToResolve: fieldsWithIssue.length,
                    taskLabel: 'EXTRACTION.VERIFICATION.TASK_HEADER.TITLE',
                    props: [
                        {
                            label: 'EXTRACTION.VERIFICATION.TASK_HEADER.TASK_NAME',
                            value: taskInfo.taskName.trim() || this.translateService.instant('EXTRACTION.VERIFICATION.TASK_HEADER.TASK_NAME_VALUE'),
                        },
                        { label: 'EXTRACTION.VERIFICATION.TASK_HEADER.CONTENT_TYPE', value: document.class.name },
                        { label: 'EXTRACTION.VERIFICATION.TASK_HEADER.TOTAL_PAGES', value: document.pages.length },
                    ],
                };
            }),
            shareReplay({ bufferSize: 1, refCount: true })
        );

        this.taskAction$ = merge(
            this.actions$.pipe(
                ofType(systemActions.taskActionSuccess),
                map((a) => {
                    return { action: a.action, openNextTask: a.openNextTask };
                })
            ),
            this.actions$.pipe(
                ofType(systemActions.taskActionError),
                map(() => {
                    return { action: 'Error' as const, openNextTask: false };
                })
            )
        );

        this.screenReady$ = this.store.select(selectScreenReady).pipe(distinctUntilChanged());
        this.taskCanSave$ = this.store.select(selectCanSave).pipe(distinctUntilChanged());
        this.taskCanComplete$ = this.store.select(selectCanComplete).pipe(distinctUntilChanged());
        this.taskCanUnclaim$ = this.store.select(selectCanComplete).pipe(distinctUntilChanged());

        this.rejectReasons$ = this.store.select(selectRejectReasons);
    }

    override initialize(taskContext: TaskContext): void {
        this.store.dispatch(systemActions.screenInitialize({ taskContext }));
    }

    override destroy(): void {
        this.store.dispatch(systemActions.screenUnload());
    }

    override saveTask(): void {
        this.store.dispatch(userActions.taskSave());
    }

    override completeTask(openNextTask?: boolean): void {
        this.store.dispatch(userActions.taskComplete({ openNextTask }));
    }

    override cancelTask(): void {
        this.store.dispatch(userActions.taskCancel());
    }

    override claimTask(taskContext: TaskContext): void {
        this.store.dispatch(systemActions.taskClaim({ taskContext }));
    }

    override unclaimTask(): void {
        this.store.dispatch(systemActions.taskUnclaim());
    }
}
