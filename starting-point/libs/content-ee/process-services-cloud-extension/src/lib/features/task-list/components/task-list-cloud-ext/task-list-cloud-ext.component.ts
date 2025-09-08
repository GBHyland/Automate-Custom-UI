/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Router } from '@angular/router';
import { Component, OnInit, ViewChild, Input, OnChanges, inject, DestroyRef } from '@angular/core';
import { TaskFilterCloudModel, TaskListCloudSortingModel, TaskListCloudComponent } from '@alfresco/adf-process-services-cloud';
import { DataColumnComponent, DataColumnListComponent, PaginationComponent, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { Pagination } from '@alfresco/js-api';
import { Store } from '@ngrx/store';
import { map } from 'rxjs/operators';
import { Subject, Observable } from 'rxjs';
import { navigateToTaskDetails } from '../../store/actions/task-list-cloud.actions';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';
import { processHistoryActionMenuModel, taskDetailsActionMenuModel, TaskListActionType } from './task-list-cloud-ext-action.model';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { DynamicColumnComponent } from '@alfresco/adf-extensions';
import { ScrollContainerComponent } from '../../../../components/scroll-container/scroll-container.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        AsyncPipe,
        PaginationComponent,
        DataColumnComponent,
        NgIf,
        DynamicColumnComponent,
        DataColumnListComponent,
        NgForOf,
        TaskListCloudComponent,
        ScrollContainerComponent,
    ],
    selector: 'apa-task-list-cloud-ext',
    templateUrl: './task-list-cloud-ext.component.html',
    styleUrls: ['./task-list-cloud-ext.component.scss'],
    host: { class: 'apa-task-list-cloud-ext' },
})
export class TaskListCloudExtComponent implements OnInit, OnChanges {
    private readonly destroyRef = inject(DestroyRef);
    private readonly extensions = inject(ProcessServicesCloudExtensionService);
    private readonly userPreferenceService = inject(UserPreferencesService);
    private readonly store = inject(Store);
    private readonly router = inject(Router);

    @ViewChild(TaskListCloudComponent)
    taskListCloudComponent: TaskListCloudComponent;

    @Input()
    currentFilter: TaskFilterCloudModel;

    paginationPageSize = 10;
    supportedPageSizes$: Observable<any[]>;
    sortArray: TaskListCloudSortingModel[] = [];
    defaultPagination: Pagination = new Pagination({
        skipCount: 0,
        maxItems: 25,
    });
    columns$: Observable<ExtensionColumnPreset[]>;
    isResizingEnabled = false;
    private performAction$ = new Subject<any>();

    ngOnInit() {
        this.fetchCloudPaginationPreference();
        this.setSorting();
        this.performContextActions();
        this.columns$ = this.extensions.getTasksColumns('default');
        this.isResizingEnabled = this.extensions.isColumnResizingEnabled('features.taskList.presets.column-resizing');
    }

    ngOnChanges(): void {
        this.setSorting();
    }

    onChangePageSize(event: Pagination): void {
        this.userPreferenceService.paginationSize = event.maxItems;
    }

    onShowRowContextMenu(event: any) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: taskDetailsActionMenuModel,
                subject: this.performAction$,
            },
            {
                data: event.value.row['obj'],
                model: processHistoryActionMenuModel,
                subject: this.performAction$,
            },
        ];
    }

    navigateToTaskDetails(taskId: string) {
        this.store.dispatch(navigateToTaskDetails({ taskId }));
    }

    navigateToProcessHistory(processInstanceId: string) {
        void this.router.navigateByUrl(`/process-details-cloud?processInstanceId=${processInstanceId}`);
    }

    isSortingChanged(): boolean {
        return this.sortArray[0]?.orderBy !== this.currentFilter?.sort || this.sortArray[0]?.direction !== this.currentFilter?.order;
    }

    fetchCloudPaginationPreference() {
        this.supportedPageSizes$ = this.userPreferenceService.select(UserPreferenceValues.SupportedPageSizes).pipe(
            map((supportedPageSizes) => {
                if (typeof supportedPageSizes === 'string') {
                    return JSON.parse(supportedPageSizes);
                }
                return supportedPageSizes;
            })
        );

        if (this.taskListCloudComponent) {
            this.defaultPagination.maxItems = this.taskListCloudComponent.size;
            this.taskListCloudComponent.resetPagination();
        }
    }

    reload() {
        this.taskListCloudComponent.reload();
    }

    private setSorting() {
        if (!this.currentFilter) {
            return;
        }

        if (this.isSortingChanged()) {
            this.sortArray = [
                new TaskListCloudSortingModel({
                    orderBy: this.currentFilter?.sort,
                    direction: this.currentFilter?.order,
                }),
            ];
        }
    }

    private performContextActions() {
        this.performAction$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action: any) => {
            switch (action.model.key) {
                case TaskListActionType.TASK_DETAILS: {
                    this.navigateToTaskDetails(action.data.id);
                    break;
                }
                case TaskListActionType.PROCESS_HISTORY: {
                    this.navigateToProcessHistory(action.data.processInstanceId);
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }
}
