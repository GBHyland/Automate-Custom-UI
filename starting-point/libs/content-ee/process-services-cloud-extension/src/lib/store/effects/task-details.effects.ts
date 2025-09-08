/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { IdentityUserModel, TaskCloudService } from '@alfresco/adf-process-services-cloud';
import { Location } from '@angular/common';
import {
    openTaskAssignmentDialog,
    assignTask,
    taskAssignmentSuccess,
    taskAssignmentFailure,
    startFormCompletedRedirection,
    taskCompletedRedirection,
} from '../actions/task-details.actions';
import { DialogService } from '../../services/dialog.service';
import { TaskAssigneeModel } from '../../features/task-details/models/task-assignee.model';
import { NotificationService } from '@alfresco/adf-core';
import { TaskRedirectionService } from '../../services/task-redirection.service';

@Injectable()
export class TaskDetailsEffects {
    openTaskAssignmentDialog$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(openTaskAssignmentDialog),
                tap((settings) => this.openDialog(settings))
            ),
        { dispatch: false }
    );

    assignTask$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(assignTask),
                tap((res) => {
                    this.assign(res);
                })
            ),
        { dispatch: false }
    );

    taskAssignmentSuccess$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(taskAssignmentSuccess),
                map(() => this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.SUCCESS'))
            ),
        { dispatch: false }
    );

    taskAssignmentFailure$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(taskAssignmentFailure),
                map(() => this.notificationService.showError('PROCESS_CLOUD_EXTENSION.TASK_DETAILS.ASSIGNEE.FAILED'))
            ),
        { dispatch: false }
    );

    startFormRedirection$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(startFormCompletedRedirection),
                tap((process) => {
                    this.taskRedirectionService.redirectForStartProcess(process.appName, process.processDefinitionName, process.redirectParameter);
                })
            ),
        { dispatch: false }
    );

    taskCompletedRedirection$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(taskCompletedRedirection),
                tap((task) => {
                    this.taskRedirectionService.redirectForTask(task.taskId);
                })
            ),
        { dispatch: false }
    );

    constructor(
        private readonly actions$: Actions,
        private readonly store: Store<any>,
        private readonly dialogService: DialogService,
        private readonly taskCloudService: TaskCloudService,
        private readonly location: Location,
        private readonly notificationService: NotificationService,
        private readonly taskRedirectionService: TaskRedirectionService
    ) {}

    private openDialog(settings: TaskAssigneeModel) {
        this.dialogService
            .openTaskAssignmentDialog(settings)
            .afterClosed()
            .subscribe((newAssignee: IdentityUserModel) => {
                if (newAssignee && newAssignee.username) {
                    const payload = <TaskAssigneeModel>{ taskId: settings.taskId, appName: settings.appName, assignee: newAssignee.username };
                    this.store.dispatch(assignTask(payload));
                }
            });
    }

    private assign(payload: TaskAssigneeModel) {
        this.taskCloudService.assign(payload.appName, payload.taskId, payload.assignee).subscribe(
            () => {
                this.location.back();
                this.store.dispatch(taskAssignmentSuccess());
            },
            (error) => {
                this.store.dispatch(taskAssignmentFailure(error));
            }
        );
    }
}
