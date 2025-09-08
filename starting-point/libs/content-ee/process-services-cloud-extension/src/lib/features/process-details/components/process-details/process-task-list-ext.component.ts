/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { DataColumnComponent, DataColumnListComponent, PaginationComponent, UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import {
    ProcessInstanceCloud,
    ProcessTaskListCloudService,
    TaskListCloudComponent,
    TASK_LIST_CLOUD_TOKEN,
} from '@alfresco/adf-process-services-cloud';
import { Pagination } from '@alfresco/js-api';
import { Component, DestroyRef, inject, Input, OnInit, ViewChild } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ProcessServicesCloudExtensionService } from '../../../../services/process-services-cloud-extension.service';
import { ExtensionColumnPreset } from '../../../../models/extension-column-preset.interface';
import { navigateToTaskDetails } from '../../../task-list/store/actions/task-list-cloud.actions';
import { Store } from '@ngrx/store';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { DynamicColumnComponent } from '@alfresco/adf-extensions';
import { ScrollContainerComponent } from '../../../../components/scroll-container/scroll-container.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        PaginationComponent,
        NgIf,
        AsyncPipe,
        DataColumnComponent,
        DynamicColumnComponent,
        NgForOf,
        DataColumnListComponent,
        TaskListCloudComponent,
        ScrollContainerComponent,
    ],
    selector: 'apa-process-task-list-ext',
    templateUrl: './process-task-list-ext.component.html',
    styleUrls: ['./process-task-list-ext.component.scss'],
    host: { class: 'apa-process-task-list-ext' },
    providers: [{ provide: TASK_LIST_CLOUD_TOKEN, useClass: ProcessTaskListCloudService }],
})
export class ProcessTaskListExtComponent implements OnInit {
    static TASK_FILTER_PROPERTY_KEYS = 'adf-edit-task-filter';
    public static ACTION_SAVE_AS = 'saveAs';
    public static ACTION_DELETE = 'delete';

    @ViewChild('processTaskList')
    taskListCloudComponent: TaskListCloudComponent;

    @Input()
    processInstance: ProcessInstanceCloud;

    paginationPageSize = 10;
    supportedPageSizes$: Observable<any[]>;
    defaultPagination: Pagination = new Pagination({
        skipCount: 0,
        maxItems: 25,
    });
    columns$: Observable<ExtensionColumnPreset[]>;
    isResizingEnabled = false;
    private performAction$ = new Subject<any>();
    private readonly destroyRef = inject(DestroyRef);

    constructor(
        private extensions: ProcessServicesCloudExtensionService,
        private store: Store<any>,
        private userPreferenceService: UserPreferencesService
    ) {}

    ngOnInit() {
        this.fetchCloudPaginationPreference();
        this.performContextActions();
        this.columns$ = this.extensions.getTasksColumns('process-instance-task-list');
        this.isResizingEnabled = this.extensions.isColumnResizingEnabled('features.taskList.presets.process-instance-task-list-column-resizing');
    }

    onChangePageSize(event: Pagination): void {
        this.userPreferenceService.paginationSize = event.maxItems;
    }

    onShowRowContextMenu(event: any) {
        event.value.actions = [
            {
                data: event.value.row['obj'],
                model: {
                    key: 'task-details',
                    icon: 'open_in_new',
                    title: 'PROCESS_CLOUD_EXTENSION.TASK_LIST.ACTIONS.TASK_DETAILS',
                    visible: true,
                },
                subject: this.performAction$,
            },
        ];
    }

    navigateToTaskDetails(taskId: string) {
        this.store.dispatch(
            navigateToTaskDetails({
                taskId,
                processName: this.processInstance.name,
            })
        );
    }

    private performContextActions() {
        this.performAction$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((action: any) => {
            this.navigateToTaskDetails(action.data.id);
        });
    }

    private fetchCloudPaginationPreference() {
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
}
