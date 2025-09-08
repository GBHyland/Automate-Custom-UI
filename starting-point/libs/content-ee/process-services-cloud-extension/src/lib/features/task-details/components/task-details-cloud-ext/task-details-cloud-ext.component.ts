/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, DestroyRef, inject, Inject, OnInit, Optional, ViewChild, ViewEncapsulation } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { catchError, distinctUntilChanged, map, Observable, Subject, take, throwError } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, withLatestFrom } from 'rxjs/operators';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import {
    FilterParamsModel,
    TaskCloudService,
    TaskDetailsCloudModel,
    TaskListCloudService,
    TaskListRequestModel,
    UserTaskCloudComponent,
} from '@alfresco/adf-process-services-cloud';
import { navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import {
    CardViewUpdateService,
    ClickNotification,
    FormModel,
    FormOutcomeEvent,
    NotificationService,
    ToolbarDividerComponent,
} from '@alfresco/adf-core';
import { DialogService } from '../../../../services/dialog.service';
import { openTaskAssignmentDialog, taskCompletedRedirection } from '../../../../store/actions/task-details.actions';
import { TaskAssigneeModel } from '../../models/task-assignee.model';
import { navigateToProcessDetails } from '../../../../store/actions/process-list-cloud.actions';
import { STORE_ACTIONS_PROVIDER, StoreActions } from '../../../../services/process-services-cloud-extension-actions.provider';
import { FORM_DISPLAY_MODES } from '../../../shared/form-display-mode';
import { TaskDetailsCloudMetadataComponent } from '../task-details-cloud-metadata/task-details-cloud-metadata.component';
import { PageLayoutContentComponent } from '../../../../components/page-layout/content/page-layout-content.component';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { PrintDirective } from '../../../../directives/print/print.directive';
import { PageLayoutHeaderComponent } from '../../../../components/page-layout/header/page-layout-header.component';
import { PageLayoutComponent } from '../../../../components/page-layout/page-layout.component';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { navigateToTaskDetails } from '../../../task-list/store/actions/task-list-cloud.actions';
import { FeaturesServiceToken, IFeaturesService } from '@alfresco/adf-core/feature-flags';
import { ADF_HX_CONTENT_SERVICES_INTERNAL } from '@alfresco/adf-hx-content-services/features';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        TaskDetailsCloudMetadataComponent,
        NgIf,
        UserTaskCloudComponent,
        PageLayoutContentComponent,
        TranslatePipe,
        MatIconModule,
        MatTooltipModule,
        MatButtonModule,
        PrintDirective,
        ToolbarDividerComponent,
        PageLayoutHeaderComponent,
        PageLayoutComponent,
        AsyncPipe,
    ],
    selector: 'apa-task-details-cloud-ext',
    templateUrl: './task-details-cloud-ext.component.html',
    styleUrls: ['./task-details-cloud-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TaskDetailsCloudExtComponent implements OnInit {
    static COMPLETED_TASK = 'completed-tasks';
    @ViewChild(UserTaskCloudComponent, { static: true })
    adfUserTaskCloud: UserTaskCloudComponent;
    appName: string;
    processName: string;
    taskDetails$: Observable<TaskDetailsCloudModel>;
    currentFilter: FilterParamsModel;
    showMetadata = false;
    taskId: string;
    taskDetails: TaskDetailsCloudModel;
    displayConfigurations = FORM_DISPLAY_MODES;
    showNextTaskCheckbox = true;
    isNextTaskCheckboxChecked: boolean;

    private taskDetailSubject = new Subject<TaskDetailsCloudModel>();
    private readonly destroyRef = inject(DestroyRef);

    protected formModel$ = new Subject<FormModel>();

    private getProcessVariableValue$<T>(variable: string, fallbackValue: T): Observable<T> {
        return this.formModel$.pipe(
            map((form) => {
                const variableValue = form.getProcessVariableValue(variable);
                if (variableValue === undefined || variableValue === null) {
                    return fallbackValue;
                } else if (typeof fallbackValue === 'boolean') {
                    if (variableValue === 'true') {
                        return true as T;
                    } else if (variableValue === 'false') {
                        return false as T;
                    } else {
                        return fallbackValue;
                    }
                }
                return variableValue as T;
            }),
            distinctUntilChanged()
        );
    }

    protected showCancelButton$ = this.getProcessVariableValue$('cancelEnabled', true);
    protected showSaveButton$ = this.getProcessVariableValue$('saveEnabled', true);
    protected customCancelButtonText$ = this.getProcessVariableValue$('cancelLabel', '');
    protected customSaveButtonText$ = this.getProcessVariableValue$('saveLabel', '');
    protected customCompleteButtonText$ = this.getProcessVariableValue$('completeLabel', '');

    protected readonly applicationChromeFeatureFlag = ADF_HX_CONTENT_SERVICES_INTERNAL.CIC_WORKSPACE_SATORI_APPLICATION_CHROME;

    constructor(
        private readonly store: Store<any>,
        private readonly route: ActivatedRoute,
        public readonly dialogService: DialogService,
        private readonly cardViewUpdateService: CardViewUpdateService,
        @Optional()
        @Inject(STORE_ACTIONS_PROVIDER)
        private readonly storeActions: StoreActions,
        private readonly notificationService: NotificationService,
        private readonly router: Router,
        private readonly taskListCloudService: TaskListCloudService,
        private readonly taskCloudService: TaskCloudService,
        private readonly translateService: TranslateService,
        @Inject(FeaturesServiceToken) protected readonly featuresService: IFeaturesService
    ) {
        this.taskDetails$ = this.taskDetailSubject.asObservable();
    }

    ngOnInit(): void {
        this.setFileUploadingDialogVisibility(false);
        this.route.params.pipe(withLatestFrom(this.store.select(selectApplicationName))).subscribe(([params, appName]) => {
            this.appName = appName;
            this.processName = params['processName'];
            this.taskId = params['taskId'];
        });
        this.store
            .select(selectProcessManagementFilter)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((filter: FilterParamsModel) => {
                this.currentFilter = filter;
            });
        this.taskDetails$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((taskDetail) => (this.taskDetails = taskDetail));
        this.cardViewUpdateService.itemClicked$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(this.clickTaskDetails.bind(this));

        this.destroyRef.onDestroy(() => {
            this.setFileUploadingDialogVisibility(true);
        });
    }

    onCompleteTaskForm(openNextTask?: boolean) {
        this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_COMPLETED');
        if (this.showNextTaskCheckbox && (openNextTask || this.isNextTaskCheckboxChecked)) {
            this.openNextTask();
        } else {
            this.store.dispatch(taskCompletedRedirection({ taskId: this.taskId }));
        }
    }

    onTaskDetailsLoaded(taskDetails: TaskDetailsCloudModel) {
        this.taskDetailSubject.next(taskDetails);
    }

    onFormSaved() {
        this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_SAVED');
    }

    onExecuteOutcome({ outcome }: FormOutcomeEvent) {
        if (!outcome.isSystem) {
            this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.TASK_FORM.FORM_ACTION', undefined, { outcome: outcome.name });
        }
    }

    navigateToSelectedFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId: filterId,
            })
        );
    }

    onCancelForm() {
        this.navigateBackToTaskList();
    }

    onFilterClick() {
        this.store.dispatch(
            navigateToFilter({
                filterId: this.currentFilter.id,
            })
        );
    }

    onFormContentClicked({ nodeId }) {
        let pluginRoute = `task-details-cloud/${this.taskId}`;
        if (this.processName) {
            pluginRoute = `task-details-cloud/${this.taskId}/${this.processName}`;
        }

        void this.router.navigate([
            pluginRoute,
            {
                outlets: {
                    viewer: ['preview', nodeId],
                },
            },
        ]);
    }

    onError({ message: error }: Error) {
        let errorPayload;
        try {
            errorPayload = JSON.parse(error);
        } catch {}

        this.handleErrorMessage(errorPayload || error);
    }

    onFullScreen() {
        if (this.adfUserTaskCloud) {
            this.adfUserTaskCloud.switchToDisplayMode('fullScreen');
        }
    }

    handleErrorMessage(errorPayload: unknown) {
        const duplicationSubstring = 'Duplicate message subscription';
        const unauthorizedSubstring = 'Operation not permitted for';
        if (errorPayload?.['status'] === 409 && errorPayload?.['message']?.includes(duplicationSubstring)) {
            return this.notificationService.showError('PROCESS_CLOUD_EXTENSION.TASK_FORM.DUPLICATE_CORRELATION_KEY');
        } else if (errorPayload?.['entry']?.code === 403 && errorPayload?.['entry']?.message?.includes(unauthorizedSubstring)) {
            this.onCancelForm();
            return this.notificationService.showError('PROCESS_CLOUD_EXTENSION.TASK_FORM.UNAUTHORIZED');
        } else if (errorPayload?.['errors'] && Array.isArray(errorPayload?.['errors'])) {
            const errorMessages = errorPayload?.['errors'].map((errorDetails) => errorDetails?.message);
            return this.notificationService.showError(errorMessages.join(', '));
        } else {
            const errorMessage = this.extractErrorMessage(errorPayload);
            return this.notificationService.showError(errorMessage);
        }
    }

    private extractErrorMessage(errorPayload: unknown): string {
        let parsedMessage;

        try {
            parsedMessage = JSON.parse(errorPayload?.['message']);
        } catch {
            parsedMessage = errorPayload?.['message'];
        }

        const extractedMessage = this.getMessageFromEvent(parsedMessage);

        return extractedMessage || parsedMessage || errorPayload?.['entry']?.message || errorPayload;
    }

    private getMessageFromEvent(body: any): string {
        return body?.entry?.message ?? body?.entry?.entry?.message ?? '';
    }

    private navigateBackToTaskList() {
        void this.router.navigateByUrl(`/task-list-cloud?filterId=${this.currentFilter?.id}`);
    }

    private clickTaskDetails(clickNotification: ClickNotification) {
        if (clickNotification.target.key === 'assignee') {
            this.openDialog(clickNotification.target.value);
        }
        if (clickNotification.target.key === 'processInstanceId') {
            this.navigateToProcessDetails(clickNotification.target.value);
        }
    }

    private openDialog(assignee: string) {
        this.store.dispatch(
            openTaskAssignmentDialog(<TaskAssigneeModel>{
                taskId: this.taskId,
                appName: this.appName,
                assignee: assignee,
            })
        );
    }

    private navigateToProcessDetails(processInstanceId: string) {
        this.store.dispatch(
            navigateToProcessDetails({
                processInstanceId,
            })
        );
    }

    private setFileUploadingDialogVisibility(visibility: boolean) {
        if (this.storeActions) {
            const uploadDialogVisibilityAction = visibility
                ? this.storeActions.getOnDestroyAction(visibility)
                : this.storeActions.getOnInitAction(visibility);
            this.store.dispatch(uploadDialogVisibilityAction);
        }
    }

    onNextTaskCheckboxCheckedChanged(event: MatCheckboxChange) {
        this.isNextTaskCheckboxChecked = event.checked;
    }

    private openNextTask() {
        const requestAssignedNode: TaskListRequestModel = {
            appName: this.appName,
            status: ['ASSIGNED'],
            pagination: { maxItems: 2 },
            sorting: { orderBy: 'createdDate', direction: 'ASC' },
        } as TaskListRequestModel;

        const requestCreatedNode: TaskListRequestModel = {
            appName: this.appName,
            status: ['CREATED'],
            pagination: { maxItems: 2 },
            sorting: { orderBy: 'createdDate', direction: 'ASC' },
        } as TaskListRequestModel;

        this.taskListCloudService.fetchTaskList(requestAssignedNode).subscribe((assignedTaskList) => {
            const nextAssignedTask = this.getNextTask(assignedTaskList);
            if (nextAssignedTask) {
                this.store.dispatch(navigateToTaskDetails({ taskId: nextAssignedTask.id }));
            } else {
                this.taskListCloudService.fetchTaskList(requestCreatedNode).subscribe((createdTaskList) => {
                    const nextCreatedTask = this.getNextTask(createdTaskList);
                    if (nextCreatedTask) {
                        this.tryToClaimNextTask(nextCreatedTask).subscribe((claimedTask) =>
                            this.store.dispatch(navigateToTaskDetails({ taskId: claimedTask.id }))
                        );
                    } else {
                        // ToDo. Disabled till Websocket implementation is done epic: https://hyland.atlassian.net/browse/AAE-34417
                        // this.dialogService.openNextUserTaskWaitingScreen();
                        this.notificationService.showInfo('PROCESS_CLOUD_EXTENSION.SNACKBAR.NO_NEXT_TASK_AVAILABLE');
                        void this.router.navigateByUrl(`/task-list-cloud?filterId=${this.currentFilter.id}`);
                    }
                });
            }
        });
    }

    private getNextTask(taskList: { list: { entries: TaskDetailsCloudModel[] } }): TaskDetailsCloudModel | undefined {
        const tasks = taskList?.list?.entries;
        return Array.isArray(tasks) && tasks.length > 0 ? tasks.find((t) => t.id !== this.taskId) : undefined;
    }

    private tryToClaimNextTask(nextTask: TaskDetailsCloudModel): Observable<TaskDetailsCloudModel> {
        return this.taskCloudService.getTaskById(nextTask.appName, nextTask.id).pipe(
            switchMap((task) => {
                nextTask.permissions = task.permissions;

                if (!this.taskCloudService.canClaimTask(nextTask)) {
                    this.notificationService.showError('PROCESS_CLOUD_EXTENSION.ERROR.TASK_CANNOT_BE_CLAIMED');
                    void this.router.navigateByUrl(`/task-list-cloud?filterId=${this.currentFilter.id}`);
                    return throwError(() => new Error('PROCESS_CLOUD_EXTENSION.ERROR.TASK_CANNOT_BE_CLAIMED'));
                }

                return this.claimTaskAndNavigate(nextTask);
            }),
            catchError((error) => {
                this.notificationService.showError('PROCESS_CLOUD_EXTENSION.ERROR.UNEXPECTED_ERROR');
                return throwError(() => error);
            })
        );
    }

    private claimTaskAndNavigate(task: TaskDetailsCloudModel): Observable<TaskDetailsCloudModel> {
        return this.taskCloudService.claimTask(task.appName, task.id, task.assignee).pipe(
            take(1),
            map(() => {
                this.notificationService.showInfo(
                    this.translateService.instant('NOTIFICATIONS.TASK_CLAIMED', {
                        taskName: task.appName,
                    })
                );
                this.store.dispatch(navigateToTaskDetails({ taskId: task.id }));
                return task;
            }),
            catchError(() => {
                this.notificationService.showError('PROCESS_CLOUD_EXTENSION.ERROR.TASK_CANNOT_BE_CLAIMED');
                return throwError(() => new Error('PROCESS_CLOUD_EXTENSION.ERROR.TASK_CANNOT_BE_CLAIMED'));
            }),
            takeUntilDestroyed(this.destroyRef)
        );
    }
}
