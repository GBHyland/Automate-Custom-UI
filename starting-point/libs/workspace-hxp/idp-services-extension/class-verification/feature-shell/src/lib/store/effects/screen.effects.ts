/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { systemActions, userActions } from '../actions/class-verification.actions';
import { catchError, concatMap, filter, forkJoin, map, of, switchMap, tap } from 'rxjs';
import { ApiDocument, ClassVerificationInput } from '../../models/contracts/class-verification-models';
import { NotificationService } from '@alfresco/adf-core';
import { filterContentFileReference, ProcessTaskBackendService } from '@hxp/workspace-hxp/idp-services-extension/shared';
import { IdpTaskData } from '../../models/screen-models';
import { selectTaskInfo } from '../selectors/screen.selectors';
import { Store } from '@ngrx/store';
import { concatLatestFrom } from '@ngrx/operators';
import { IdpDocumentHxpImportService } from '../../services/document-import/idp-document-hxp-import.service';
import { Clipboard } from '@angular/cdk/clipboard';

@Injectable()
export class ScreenEffects {
    private readonly actions$ = inject(Actions);
    private readonly processBackendService = inject(ProcessTaskBackendService);
    private readonly notificationService = inject(NotificationService);
    private readonly store = inject(Store);
    private readonly clipboard = inject(Clipboard);

    initializeScreenEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenInitialize),
            switchMap(({ taskContext }) => {
                return taskContext.canClaimTask
                    ? of(systemActions.taskClaim({ taskContext }))
                    : this.processBackendService.getTaskAssignee$(taskContext.appName, taskContext.taskId).pipe(
                          map((assignee) => {
                              return assignee
                                  ? systemActions.screenLoad({ taskContext })
                                  : systemActions.screenInitializeError({
                                        error: 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.SCREEN_INIT_ERROR_NOT_CLAIMABLE',
                                    });
                          }),
                          catchError(() =>
                              of(
                                  systemActions.screenInitializeError({
                                      error: 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.SCREEN_INIT_ERROR_ASSIGNEE',
                                  })
                              )
                          )
                      );
            })
        )
    );

    initializeScreenErrorNotificationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenInitializeError),
            map(({ error }) => {
                const message = typeof error === 'string' ? error : 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.SCREEN_INIT_ERROR';
                return systemActions.notificationShow({ severity: 'error', message });
            })
        )
    );

    initializeScreenErrorCancelTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenInitializeError),
            map(() => systemActions.taskActionSuccess({ action: 'Cancel' }))
        )
    );

    loadScreenEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoad),
            concatMap(({ taskContext }) => {
                return forkJoin([
                    this.processBackendService.getTaskInputData$<ClassVerificationInput>(taskContext.appName, taskContext.taskId),
                    this.processBackendService.getIdpConfiguration$(taskContext.appName),
                    this.processBackendService.getTaskAssignee$(taskContext.appName, taskContext.taskId),
                ]).pipe(
                    map(([taskInput, idpConfiguration, assignee]) => {
                        let contents = taskInput.batchState.contentFileReferences || [];
                        if (contents.length === 0) {
                            contents = taskInput.contents || [];
                            if (contents.length === 0) {
                                throw new Error('IDP_CLASS_VERIFICATION.NOTIFICATIONS.SCREEN_LOAD_ERROR_CONTENT_FILE_REFS');
                            }
                        }

                        const isDocumentValid = (document: ApiDocument) => !document.markAsDeleted && !!document.pages && document.pages.length > 0;
                        if (!taskInput.batchState?.documents.some((document) => isDocumentValid(document))) {
                            throw new Error('IDP_CLASS_VERIFICATION.NOTIFICATIONS.SCREEN_LOAD_ERROR_DOCUMENT_STRUCTURE');
                        }

                        const contentFileReferences = contents.map((file) => filterContentFileReference(file));

                        const taskData: IdpTaskData = {
                            ...taskInput,
                            configuration: idpConfiguration.classification,
                            sys_task_assignee: assignee,
                            batchState: {
                                ...taskInput.batchState,
                                contentFileReferences,
                            },
                            targetFolder: taskInput.targetFolder ? this.parseTargetFolder(taskInput.targetFolder) : undefined,
                        };
                        return systemActions.screenLoadSuccess({ taskData, taskContext });
                    }),
                    catchError((error) => of(systemActions.screenLoadError({ error })))
                );
            })
        )
    );

    screenLoadErrorNotificationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadError),
            map(({ error }) => {
                console.error('Screen Load error', error.message);
                return systemActions.notificationShow({ severity: 'error', message: error.message });
            })
        )
    );

    screenLoadErrorTaskCancelEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.screenLoadError),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Cancel' });
            })
        )
    );

    saveTaskPrepareDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.taskSave),
            map(() => {
                return systemActions.taskPrepareUpdate({ taskAction: 'Save' });
            })
        )
    );

    completeTaskPrepareDataEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.taskComplete),
            map(({ openNextTask }) => {
                return systemActions.taskPrepareUpdate({ taskAction: 'Complete', openNextTask });
            })
        )
    );

    taskPrepareDataErrorEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdateError),
            map(({ error }) => {
                return systemActions.taskActionError({ error });
            })
        )
    );

    taskActionEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskPrepareUpdateSuccess),
            concatLatestFrom(() => this.store.select(selectTaskInfo)),
            concatMap(([{ taskAction, taskData, openNextTask }, taskContext]) => {
                if (!taskData) {
                    return of(systemActions.taskActionError({ error: new Error('No task data available') }));
                }

                switch (taskAction) {
                    case 'Save': {
                        return this.processBackendService
                            .saveTaskData$(taskContext.appName, taskContext.taskId, {
                                batchState: taskData.batchState,
                                sys_task_assignee: taskData.sys_task_assignee,
                            })
                            .pipe(
                                map((success) =>
                                    success
                                        ? systemActions.taskActionSuccess({ action: 'Save' })
                                        : systemActions.taskActionError({ action: 'Save', error: 'Failed to save task' })
                                ),
                                catchError((error) => of(systemActions.taskActionError({ action: 'Save', error })))
                            );
                    }
                    case 'Complete': {
                        return this.processBackendService
                            .completeTask$(taskContext.appName, taskContext.taskId, {
                                batchState: taskData.batchState,
                                sys_task_assignee: taskData.sys_task_assignee,
                            })
                            .pipe(
                                map((success) =>
                                    success
                                        ? systemActions.taskActionSuccess({ action: 'Complete', openNextTask })
                                        : systemActions.taskActionError({ action: 'Complete', error: 'Failed to complete task' })
                                ),
                                catchError((error) => of(systemActions.taskActionError({ action: 'Complete', error })))
                            );
                    }
                    default: {
                        return of(systemActions.taskActionError({ error: new Error('Unknown task action') }));
                    }
                }
            })
        )
    );

    cancelTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.taskCancel),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Cancel' });
            })
        )
    );

    taskActionErrorNotificationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskActionError),
            map(({ error, action }) => {
                console.error('Task action error', typeof error === 'string' ? error : error.message);
                let message = '';
                switch (action) {
                    case 'Claim': {
                        message = 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_CLAIM_ERROR';
                        break;
                    }
                    case 'Unclaim': {
                        message = 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_UNCLAIM_ERROR';
                        break;
                    }
                    case 'Save': {
                        message = 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_SAVE_ERROR';
                        break;
                    }
                    case 'Complete': {
                        message = 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_COMPLETE_ERROR';
                        break;
                    }
                    default: {
                        message = 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.TASK_ACTION_ERROR';
                        break;
                    }
                }
                return systemActions.notificationShow({ severity: 'error', message });
            })
        )
    );

    notificationEffect$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(systemActions.notificationShow),
                tap(({ severity, message, messageArgs }) => {
                    switch (severity) {
                        case 'error': {
                            this.notificationService.showError(message, undefined, messageArgs);
                            break;
                        }
                        case 'warn': {
                            this.notificationService.showWarning(message, undefined, messageArgs);
                            break;
                        }
                        default: {
                            this.notificationService.showInfo(message, undefined, messageArgs);
                            break;
                        }
                    }
                })
            ),
        { dispatch: false }
    );

    claimTaskEffect$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(systemActions.taskClaim),
            concatMap(({ taskContext }) => {
                if (!taskContext.appName || !taskContext.taskId) {
                    const error = taskContext.appName ? 'Task Id is empty' : 'App Name is empty';
                    return of(systemActions.taskActionError({ error, action: 'Claim' }));
                }

                return this.processBackendService.claimTask$(taskContext.appName, taskContext.taskId).pipe(
                    switchMap((success) => {
                        return success
                            ? this.processBackendService.getTaskClaimProperties$(taskContext.appName, taskContext.taskId).pipe(
                                  map((result) => {
                                      return result.success
                                          ? systemActions.taskClaimSuccess({
                                                taskContext: {
                                                    ...taskContext,
                                                    canClaimTask: !!result.canClaimTask,
                                                    canUnclaimTask: !!result.canUnclaimTask,
                                                },
                                            })
                                          : systemActions.taskActionError({
                                                error: 'Failed to retrieve task claim properties',
                                                action: 'Claim',
                                            });
                                  }),
                                  catchError((error) => of(systemActions.taskActionError({ error, action: 'Claim' })))
                              )
                            : of(systemActions.taskActionError({ error: 'Failed to claim task', action: 'Claim' }));
                    }),
                    catchError((error) => of(systemActions.taskActionError({ error, action: 'Claim' })))
                );
            })
        );
    });

    taskClaimSuccessLoadScreenEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskClaimSuccess),
            map(({ taskContext }) => {
                return systemActions.screenLoad({ taskContext });
            })
        )
    );

    taskActionClaimSuccessEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskClaimSuccess),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Claim' });
            })
        )
    );

    taskClaimErrorCancelTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskActionError),
            filter(({ action }) => action === 'Claim'),
            map(() => {
                return systemActions.taskActionSuccess({ action: 'Cancel' });
            })
        )
    );

    unclaimTaskEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.taskUnclaim),
            concatLatestFrom(() => this.store.select(selectTaskInfo)),
            concatMap(([, taskContext]) => {
                if (!taskContext.appName || !taskContext.taskId) {
                    const error = taskContext.appName ? 'Task Id is empty' : 'App Name is empty';
                    return of(systemActions.taskActionError({ error, action: 'Unclaim' }));
                }

                return this.processBackendService.unclaimTask$(taskContext.appName, taskContext.taskId).pipe(
                    map((success) => {
                        return success
                            ? systemActions.taskActionSuccess({ action: 'Unclaim' })
                            : systemActions.taskActionError({ error: 'Failed to unclaim the task', action: 'Unclaim' });
                    }),
                    catchError((error) => of(systemActions.taskActionError({ error, action: 'Unclaim' })))
                );
            })
        )
    );

    copyDocumentDetailsToClipboardEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(userActions.copyDocumentDetailsToClipboard),
            concatLatestFrom(() => this.store.select(selectTaskInfo)),
            tap(([{ documentId }, taskContext]) => {
                this.clipboard.copy(`${documentId}\n\r${taskContext.appName}\n\r${taskContext.rootProcessInstanceId}`);
            }),
            map(([{ documentId }]) => {
                return systemActions.copyDocumentDetailsToClipboardSuccess({ documentId });
            })
        )
    );

    copyDocumentDetailsToClipboardNotificationEffect$ = createEffect(() =>
        this.actions$.pipe(
            ofType(systemActions.copyDocumentDetailsToClipboardSuccess),
            concatLatestFrom(() => this.store.select(selectTaskInfo)),
            map(([{ documentId }, taskContext]) => {
                return systemActions.notificationShow({
                    severity: 'info',
                    message: 'IDP_CLASS_VERIFICATION.NOTIFICATIONS.COPY_DOCUMENT_DETAILS_TO_CLIPBOARD_SUCCESS',
                    messageArgs: { documentId, appName: taskContext.appName, rootProcessInstanceId: taskContext.rootProcessInstanceId },
                });
            })
        )
    );

    private parseTargetFolder(targetFolder: string): string {
        targetFolder = targetFolder.trim();
        targetFolder = targetFolder.replace(/\\/g, IdpDocumentHxpImportService.PATH_SEPARATOR);

        if (!targetFolder.startsWith(IdpDocumentHxpImportService.PATH_SEPARATOR)) {
            targetFolder = `${IdpDocumentHxpImportService.PATH_SEPARATOR}${targetFolder}`;
        }

        return targetFolder;
    }
}
