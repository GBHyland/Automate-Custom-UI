/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, NotificationService } from '@alfresco/adf-core';
import { DisplayModeService, FormCloudDisplayMode, TaskFilterCloudModel, TaskFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { Component, DestroyRef, inject, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { navigateToFilter, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { selectApplicationName, selectIfCurrentFilterCanBeRefreshed } from '../../../../store/selectors/extension.selectors';
import { switchMap, map, filter, take, withLatestFrom, tap } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';
import { FilterType } from '../../../../store/states/extension.state';
import { TaskListCloudExtComponent } from './task-list-cloud-ext.component';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { Filter } from '@alfresco-dbp/shared-filters-services';
import { TaskFilterService } from '../../services/task-filters/task-filter.service';
import { AsyncPipe, NgIf } from '@angular/common';
import { FiltersContainerComponent } from '@alfresco-dbp/shared-filters-smart';
import { DynamicExtensionComponent } from '@alfresco/adf-extensions';
import { PageLayoutContentComponent } from '../../../../components/page-layout/content/page-layout-content.component';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import { PageLayoutHeaderComponent } from '../../../../components/page-layout/header/page-layout-header.component';
import { PageLayoutComponent } from '../../../../components/page-layout/page-layout.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        AsyncPipe,
        TaskListCloudExtComponent,
        FiltersContainerComponent,
        DynamicExtensionComponent,
        PageLayoutContentComponent,
        NgIf,
        MatIconModule,
        TranslatePipe,
        PageLayoutHeaderComponent,
        PageLayoutComponent,
        MatButtonModule,
        MatDatepickerModule,
    ],
    selector: 'apa-task-list-cloud-container-ext',
    templateUrl: './task-list-cloud-container-ext.component.html',
    styleUrls: ['./task-list-cloud-container-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class TaskListCloudContainerExtComponent implements OnInit {
    private readonly store = inject(Store);
    private readonly taskFilterService = inject(TaskFilterService);
    private readonly taskFilterCloudService = inject(TaskFilterCloudService);
    private readonly route = inject(ActivatedRoute);
    private readonly appConfig = inject(AppConfigService);
    private readonly notificationService = inject(NotificationService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('apaTaskListCloudExt')
    taskListExtCloudComponent: TaskListCloudExtComponent;

    appName: string;
    taskFilter: TaskFilterCloudModel;

    enableNotifications = false;

    filters: Filter[] = [];
    isDefaultFilter = true;
    filtersLoading$ = this.taskFilterService.filtersLoading$;
    canListBeRefreshed: boolean;

    ngOnInit() {
        this.store.select(selectIfCurrentFilterCanBeRefreshed).subscribe((canBeRefreshed) => {
            this.canListBeRefreshed = canBeRefreshed;
        });
        this.enableNotifications = this.appConfig.get('notifications', true);
        this.handleQueryParamsChange();

        this.destroyRef.onDestroy(() => {
            this.resetCurrentFilterRefreshStatus();
        });
    }

    onRefreshButtonClicked(): void {
        if (this.canListBeRefreshed) {
            this.refreshTaskList();
        } else {
            this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_UPTO_DATE');
        }
    }

    onFilterSave() {
        this.taskFilterService
            .saveFilter(this.taskFilter)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
                this.navigateToTaskFilter(this.taskFilter.id);
            });
    }

    onFilterSaveAs(newFilterName: string) {
        this.taskFilterService
            .saveFilterAs(this.taskFilter, newFilterName)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_SAVED');
                this.navigateToTaskFilter(this.taskFilter.id);
            });
    }

    onFilterDelete() {
        this.taskFilterService
            .deleteFilter(this.taskFilter)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((appTaskFilters) => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_FILTER.FILTER_DELETED');
                this.navigateToTaskFilter(appTaskFilters[0].id);
            });
    }

    onFiltersChange(filters: Filter[]) {
        this.taskListExtCloudComponent?.fetchCloudPaginationPreference();

        const taskFilter = this.taskFilterService.filterArrayToTaskFilterCloud(this.taskFilter, filters);
        this.setTaskFilter(taskFilter);
    }

    private handleQueryParamsChange(): void {
        this.route.queryParams
            .pipe(
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([params, appName]) => {
                    this.appName = appName;
                    return combineLatest([this.loadFilter(appName, params), this.waitUntilProcessDefinitionsAreLoaded()]);
                }),
                tap(([taskFilter]) => {
                    this.setTaskFilter(taskFilter);
                    this.resetCurrentFilterRefreshStatus();
                    DisplayModeService.changeDisplayMode({ displayMode: FormCloudDisplayMode.inline });
                }),
                switchMap(() => {
                    return this.taskFilterService.getFilters(this.taskFilter);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((filters) => {
                this.filters = filters;
                this.isDefaultFilter = this.taskFilterService.isDefaultFilter(this.taskFilter);
            });
    }

    private refreshTaskList(): void {
        this.taskListExtCloudComponent.reload();
        this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
        this.resetCurrentFilterRefreshStatus();
        this.setRefreshedFilter();
    }

    private setTaskFilter(taskFilter: TaskFilterCloudModel) {
        this.taskFilter = new TaskFilterCloudModel(taskFilter);
        this.setProcessManagementFilter(taskFilter);
    }

    private loadFilter(appName: string, params: Params): Observable<TaskFilterCloudModel> {
        const numberOfParams = Object.keys(params).length;
        const filterId = params['filterId'] || params['id'];

        if (numberOfParams === 0) {
            return this.getFirstTaskFilter(appName);
        } else if (numberOfParams === 1 && filterId) {
            return this.taskFilterCloudService.getTaskFilterById(appName, filterId);
        } else {
            return this.getMyTasksFilter(appName).pipe(
                map((myTasksModel) => {
                    return new TaskFilterCloudModel({
                        ...myTasksModel,
                        ...params,
                        appName,
                    });
                })
            );
        }
    }

    private getFirstTaskFilter(appName: string): Observable<TaskFilterCloudModel> {
        return this.taskFilterCloudService.getTaskListFilters(appName).pipe(map((filters) => filters[0]));
    }

    private getMyTasksFilter(appName: string): Observable<TaskFilterCloudModel> {
        return this.taskFilterCloudService.getTaskListFilters(appName).pipe(map((filters) => filters.find((f) => f.key === 'my-tasks')));
    }

    private showFilterNotification(key: string) {
        this.notificationService.showInfo(key);
    }

    private navigateToTaskFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId: filterId,
            })
        );
    }

    private setProcessManagementFilter(taskFilter: TaskFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.TASK,
                    filter: taskFilter,
                },
            })
        );
    }

    private waitUntilProcessDefinitionsAreLoaded(): Observable<boolean> {
        return this.store.select(selectProcessDefinitionsLoaderIndicator).pipe(filter((areDefinitionsLoaded) => !!areDefinitionsLoaded));
    }

    private resetCurrentFilterRefreshStatus() {
        this.store.dispatch(
            taskOrProcessFilterUpdate({
                filterKey: this.taskFilter.key,
                canBeRefreshed: false,
            })
        );
    }

    private setRefreshedFilter() {
        this.taskFilterCloudService.refreshFilter(this.taskFilter.key);
    }
}
