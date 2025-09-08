/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    TaskCloudService,
    TaskFilterCloudModel,
    IdentityUserService,
    IdentityUserModel,
    DateCloudFilterType,
    TaskStatusFilter,
    TaskFilterCloudService,
} from '@alfresco/adf-process-services-cloud';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import { cloneDeep } from 'es-toolkit/compat';
import { TranslateService } from '@ngx-translate/core';
import {
    DateFilter,
    Filter,
    CheckboxFilter,
    StringFilter,
    UserFilter,
    ProcessVariableFilter,
    ProcessVariableModelCreator,
    isProcessVariableFilter,
    createProcessVariableFilter,
    ProcessVariableConfigFactory,
    VariableByProcess,
    createAssigneeFilter,
    createCompletedByFilter,
    createCreatedDateFilter,
    createDueDateFilter,
    createPriorityFilter,
    createTaskCompletedDateFilter,
    createTaskNameFilter,
    createTaskProcessDefinitionNameFilter,
    createTaskStatusFilter,
    TaskFilterKey,
} from '@alfresco-dbp/shared-filters-services';
import { selectVariablesByProcess } from '../../../../store/selectors/process-definitions.selector';
import { Store } from '@ngrx/store';

@Injectable({ providedIn: 'root' })
export class TaskFilterService {
    private readonly taskCloudService = inject(TaskCloudService);
    private readonly taskFilterCloudService = inject(TaskFilterCloudService);
    private readonly identityUserService = inject(IdentityUserService);
    private readonly translateService = inject(TranslateService);
    private readonly store = inject(Store);
    private readonly processVariableFilterConfigFactory = inject(ProcessVariableConfigFactory);
    private readonly processVariableModelCreator = inject(ProcessVariableModelCreator);

    private readonly filtersLoadingSubject = new BehaviorSubject<boolean>(true);
    filtersLoading$ = this.filtersLoadingSubject.asObservable();

    getFilters(taskFilterCloud: TaskFilterCloudModel): Observable<Filter[]> {
        this.filtersLoadingSubject.next(true);

        return combineLatest([
            this.fetchProcessDefinitionNames(taskFilterCloud.appName),
            this.fetchUsers(taskFilterCloud.assignees),
            this.fetchUsers(taskFilterCloud.completedByUsers),
            this.store.select(selectVariablesByProcess),
        ]).pipe(
            take(1),
            switchMap(([processNames, assignees, completedByUsers, variables]) => {
                const taskFilters: Filter[] = this.createTaskFilterList(taskFilterCloud, processNames, assignees, completedByUsers, variables);

                this.translateLabels(taskFilters);

                this.filtersLoadingSubject.next(false);
                return of(taskFilters);
            })
        );
    }

    isDefaultFilter(taskFilterCloud: TaskFilterCloudModel): boolean {
        return this.taskFilterCloudService.isDefaultFilter(taskFilterCloud.name);
    }

    saveFilter(taskFilterCloud: TaskFilterCloudModel): Observable<TaskFilterCloudModel[]> {
        return this.taskFilterCloudService.updateFilter(taskFilterCloud);
    }

    saveFilterAs(taskFilterCloud: TaskFilterCloudModel, newFilterName: string): Observable<TaskFilterCloudModel[]> {
        const filterId = Math.random().toString(36).slice(2, 9);
        const filterKey = newFilterName.trim().replace(new RegExp(' ', 'g'), '-').toLowerCase();
        taskFilterCloud.name = newFilterName;
        taskFilterCloud.id = filterId;
        taskFilterCloud.key = 'custom-' + filterKey;

        return this.taskFilterCloudService.addFilter(taskFilterCloud);
    }

    deleteFilter(taskFilterCloud: TaskFilterCloudModel): Observable<TaskFilterCloudModel[]> {
        return this.taskFilterCloudService.deleteFilter(taskFilterCloud);
    }

    filterArrayToTaskFilterCloud(sourceTaskFilterCloud: TaskFilterCloudModel, filters: Filter[]): TaskFilterCloudModel {
        const taskFilterObject = cloneDeep(sourceTaskFilterCloud);
        filters.forEach((f) => {
            let value: any = null;
            switch (f.name) {
                case TaskFilterKey.TASK_NAMES: {
                    value = (f as StringFilter).value;

                    taskFilterObject[TaskFilterKey.TASK_NAMES] = value;
                    taskFilterObject['taskName'] = value?.length ? value[0] : null;

                    break;
                }
                case TaskFilterKey.STATUSES: {
                    value = (f as CheckboxFilter).value?.map((option) => option.value) as TaskStatusFilter[];

                    taskFilterObject[TaskFilterKey.STATUSES] = value;
                    taskFilterObject['status'] = value?.length ? value[0] : null;

                    break;
                }
                case TaskFilterKey.PROCESS_DEFINITION_NAMES: {
                    value = (f as CheckboxFilter).value?.map((option) => option.value) as string[];

                    taskFilterObject[TaskFilterKey.PROCESS_DEFINITION_NAMES] = value;
                    taskFilterObject['processDefinitionName'] = value?.length ? value[0] : null;

                    break;
                }
                case TaskFilterKey.ASSIGNEES: {
                    value = (f as UserFilter).value?.map((user) => user.username) as string[];

                    taskFilterObject[TaskFilterKey.ASSIGNEES] = value;
                    taskFilterObject['assignee'] = value?.length ? value[0] : null;

                    break;
                }
                case TaskFilterKey.PRIORITIES: {
                    value = (f as CheckboxFilter).value?.map((option) => option.value);

                    taskFilterObject[TaskFilterKey.PRIORITIES] = value;
                    taskFilterObject['priority'] = value?.length ? value[0] : null;

                    break;
                }
                case TaskFilterKey.DUE_DATE: {
                    taskFilterObject[TaskFilterKey.DUE_DATE] = (f as DateFilter).value?.selectedOption?.value as DateCloudFilterType;
                    taskFilterObject[TaskFilterKey.DUE_DATE_FROM] = (f as DateFilter).value?.range?.from?.toISOString() || '';
                    taskFilterObject[TaskFilterKey.DUE_DATE_TO] = (f as DateFilter).value?.range?.to?.toISOString() || '';
                    break;
                }
                case TaskFilterKey.COMPLETED_DATE: {
                    taskFilterObject[TaskFilterKey.COMPLETED_DATE] = (f as DateFilter).value?.selectedOption?.value as DateCloudFilterType;
                    taskFilterObject[TaskFilterKey.COMPLETED_DATE_FROM] = (f as DateFilter).value?.range?.from?.toISOString() || '';
                    taskFilterObject[TaskFilterKey.COMPLETED_DATE_TO] = (f as DateFilter).value?.range?.to?.toISOString() || '';
                    break;
                }
                case TaskFilterKey.CREATED_DATE: {
                    taskFilterObject[TaskFilterKey.CREATED_DATE] = (f as DateFilter).value?.selectedOption?.value as DateCloudFilterType;
                    taskFilterObject[TaskFilterKey.CREATED_DATE_FROM] = (f as DateFilter).value?.range?.from?.toISOString() || '';
                    taskFilterObject[TaskFilterKey.CREATED_DATE_TO] = (f as DateFilter).value?.range?.to?.toISOString() || '';
                    break;
                }
                case TaskFilterKey.COMPLETED_BY_USERS: {
                    value = (f as UserFilter).value?.map((user) => user.username) as string[];

                    taskFilterObject[TaskFilterKey.COMPLETED_BY_USERS] = value;
                    taskFilterObject['completedBy'] = value?.length ? value[0] : null;

                    break;
                }
                default: {
                    break;
                }
            }

            const processFilters = filters
                .filter((taskFilter) => isProcessVariableFilter(taskFilter))
                .filter((taskFilter) => taskFilter.visible === true) as ProcessVariableFilter[];

            taskFilterObject['processVariableFilters'] = this.processVariableModelCreator.createProcessVariableFilters(processFilters);
        });

        return new TaskFilterCloudModel(taskFilterObject);
    }

    private fetchUsers(usernames?: string[]): Observable<IdentityUserModel[]> {
        if (!usernames?.length) {
            return of([]);
        }

        const observables = usernames.map((username) =>
            this.identityUserService.search(username).pipe(
                take(1),
                map((users) => (users.length > 0 ? users[0] : null)),
                filter((user) => !!user)
            )
        );

        return forkJoin(observables);
    }

    private fetchProcessDefinitionNames(appName: string): Observable<string[]> {
        return this.taskCloudService
            .getProcessDefinitions(appName)
            .pipe(map((processDefinitions) => processDefinitions.map((processDefinition) => processDefinition.name)));
    }

    private translateLabels(filters: Filter[]): Filter[] {
        filters.forEach((f) => {
            f.label = this.translateService.instant(f.translationKey);
        });
        return filters;
    }

    private createTaskFilterList(
        taskFilter: TaskFilterCloudModel,
        processDefinitionNames: string[],
        assignees: IdentityUserModel[],
        completedByUsers: IdentityUserModel[],
        processesVariables: VariableByProcess[]
    ): Filter[] {
        const processVariableFilterConfigs = this.processVariableFilterConfigFactory.createConfigs(
            taskFilter.processVariableFilters ?? [],
            processesVariables
        );

        return [
            createTaskNameFilter(taskFilter.taskNames || []),
            createTaskStatusFilter(taskFilter.statuses || []),
            createTaskProcessDefinitionNameFilter(taskFilter.processDefinitionNames || [], processDefinitionNames),
            createAssigneeFilter(assignees || [], taskFilter.appName),
            createPriorityFilter(
                taskFilter.priorities || [],
                this.taskCloudService.priorities,
                this.taskCloudService.getPriorityLabel.bind(this.taskCloudService)
            ),
            createDueDateFilter(taskFilter.dueDateType, taskFilter.dueDateFrom, taskFilter.dueDateTo),
            createTaskCompletedDateFilter(taskFilter.completedDateType, taskFilter.completedFrom, taskFilter.completedTo),
            createCreatedDateFilter(taskFilter.createdDateType, taskFilter.createdFrom, taskFilter.createdTo),
            createCompletedByFilter(completedByUsers || [], taskFilter.appName),
            ...processVariableFilterConfigs.map((process) => createProcessVariableFilter(process)).filter((f) => !!f),
        ];
    }
}
