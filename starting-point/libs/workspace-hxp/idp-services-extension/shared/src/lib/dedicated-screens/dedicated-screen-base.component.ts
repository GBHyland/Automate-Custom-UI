/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DestroyRef, Directive, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { BehaviorSubject, filter, map } from 'rxjs';
import { TaskContext } from '../models/api-models/task-context';
import { IDP } from '@features';
import { IdpContextTaskBaseService } from '../services/context-task/context-task-base.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserTaskCustomUi } from '@alfresco/adf-process-services-cloud';

@Directive()
export abstract class IdpDedicatedScreenBaseComponent implements OnChanges, OnInit, Partial<UserTaskCustomUi> {
    @Input() taskId = '';
    @Input() appName = '';
    @Input() rootProcessInstanceId = '';
    @Input() taskName: string | undefined = '';
    @Input() canClaimTask = false;
    @Input() canUnclaimTask = false;

    @Output() taskSaved = new EventEmitter();
    @Output() taskCompleted = new EventEmitter();
    @Output() cancelTask = new EventEmitter();
    @Output() claimTask = new EventEmitter<any>();
    @Output() unclaimTask = new EventEmitter<any>();

    idpFeatureFlag = IDP.PROMPT_BASED_CONFIG;

    private inputDataUpdate$ = new BehaviorSubject<Partial<TaskContext>>({});

    private readonly contextService = inject(IdpContextTaskBaseService);
    private readonly destroyRef = inject(DestroyRef);

    constructor() {
        this.inputDataUpdate$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                filter((data) => this.isValidTaskContext(data)),
                map((data) => data as TaskContext)
            )
            .subscribe((taskContext) => {
                this.contextService.initialize(taskContext);
            });

        this.contextService.taskAction$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((a) => {
            switch (a.action) {
                case 'Save': {
                    this.taskSaved.emit();
                    break;
                }
                case 'Complete': {
                    this.taskCompleted.emit(a.openNextTask);
                    break;
                }
                case 'Cancel': {
                    this.cancelTask.emit();
                    break;
                }
                case 'Unclaim': {
                    this.unclaimTask.emit();
                    break;
                }
            }
        });

        this.contextService.taskInfo$
            .pipe(
                takeUntilDestroyed(this.destroyRef),
                filter((taskInfo) => this.canClaimTask !== taskInfo.canClaimTask || this.canUnclaimTask !== taskInfo.canUnclaimTask)
            )
            .subscribe((taskInfo) => {
                this.canClaimTask = taskInfo.canClaimTask;
                this.canUnclaimTask = taskInfo.canUnclaimTask;
            });
    }

    ngOnInit(): void {
        this.contextService.destroy();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (
            Object.values(changes).some((c) => c.firstChange) &&
            (changes['taskId'] ||
                changes['appName'] ||
                changes['rootProcessInstanceId'] ||
                changes['taskName'] ||
                changes['canClaimTask'] ||
                changes['canUnclaimTask'])
        ) {
            this.inputDataUpdate$.next({
                appName: this.appName,
                taskId: this.taskId,
                taskName: this.taskName ?? '',
                rootProcessInstanceId: this.rootProcessInstanceId,
                canClaimTask: this.canClaimTask,
                canUnclaimTask: this.canUnclaimTask,
            });
        }
    }

    private isValidTaskContext(taskContext: Partial<TaskContext>): boolean {
        return !!taskContext.appName && !!taskContext.taskId && !!taskContext.rootProcessInstanceId;
    }
}
