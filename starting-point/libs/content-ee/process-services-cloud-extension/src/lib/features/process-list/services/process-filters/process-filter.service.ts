/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    ProcessCloudService,
    ProcessFilterCloudModel,
    IdentityUserService,
    IdentityUserModel,
    ApplicationVersionModel,
    DateCloudFilterType,
    ProcessFilterCloudService,
} from '@alfresco/adf-process-services-cloud';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, take } from 'rxjs/operators';
import {
    CheckboxFilter,
    DateFilter,
    Filter,
    ProcessVariableFilter,
    UserFilter,
    createCompletedDateFilter,
    createStatusFilter,
    createAppVersionFilter,
    createStartedByFilter,
    createSuspendedDateFilter,
    createStartedDateFilter,
    ProcessFilterKey,
    isProcessVariableFilter,
    ProcessVariableModelCreator,
    createProcessVariableFilter,
    ProcessFilterCloudModelExtension,
    ProcessVariableConfigFactory,
    VariableByProcess,
    createProcessDefinitionNameFilter,
    StringFilter,
    createProcessNameFilter,
} from '@alfresco-dbp/shared-filters-services';
import { cloneDeep } from 'es-toolkit/compat';
import { TranslateService } from '@ngx-translate/core';
import { Store } from '@ngrx/store';
import { selectVariablesByProcess } from '../../../../store/selectors/process-definitions.selector';

@Injectable({ providedIn: 'root' })
export class ProcessFilterService {
    private readonly processCloudService = inject(ProcessCloudService);
    private readonly processFilterCloudService = inject(ProcessFilterCloudService);
    private readonly identityUserService = inject(IdentityUserService);
    private readonly translateService = inject(TranslateService);
    private readonly store = inject(Store);
    private readonly processVariableFilterConfigFactory = inject(ProcessVariableConfigFactory);
    private readonly processVariableModelCreator = inject(ProcessVariableModelCreator);

    private readonly filtersLoadingSubject = new BehaviorSubject<boolean>(true);
    filtersLoading$ = this.filtersLoadingSubject.asObservable();

    getFilters(processFilterCloud: ProcessFilterCloudModel): Observable<Filter[]> {
        this.filtersLoadingSubject.next(true);

        return combineLatest([
            this.fetchProcessDefinitionNames(processFilterCloud.appName),
            this.fetchApplicationVersions(processFilterCloud.appName),
            this.fetchUsers(processFilterCloud.initiators),
            this.store.select(selectVariablesByProcess),
        ]).pipe(
            take(1),
            switchMap(([processNames, appVersions, initiators, variables]) => {
                const processFilters: Filter[] = this.createProcessFiltersList(processFilterCloud, processNames, appVersions, initiators, variables);

                this.translateLabels(processFilters);

                this.filtersLoadingSubject.next(false);
                return of(processFilters);
            })
        );
    }

    isDefaultFilter(processFilterCloud: ProcessFilterCloudModel): boolean {
        return this.processFilterCloudService.isDefaultFilter(processFilterCloud.name);
    }

    saveFilter(processFilterCloud: ProcessFilterCloudModel): Observable<ProcessFilterCloudModel[]> {
        return this.processFilterCloudService.updateFilter(processFilterCloud);
    }

    saveFilterAs(processFilterCloud: ProcessFilterCloudModel, newFilterName: string): Observable<ProcessFilterCloudModel[]> {
        const filterId = Math.random().toString(36).substring(2, 9);
        const filterKey = newFilterName.trim().replace(new RegExp(' ', 'g'), '-').toLowerCase();
        processFilterCloud.name = newFilterName;
        processFilterCloud.id = filterId;
        processFilterCloud.key = 'custom-' + filterKey;

        return this.processFilterCloudService.addFilter(processFilterCloud);
    }

    deleteFilter(processFilterCloud: ProcessFilterCloudModel): Observable<ProcessFilterCloudModel[]> {
        return this.processFilterCloudService.deleteFilter(processFilterCloud);
    }

    createProcessFilterCloudModel(sourceProcessFilterCloud: ProcessFilterCloudModel, filters: Filter[]): ProcessFilterCloudModelExtension {
        const filterValues: ProcessFilterCloudModelExtension = cloneDeep(sourceProcessFilterCloud);

        filters.forEach((f) => {
            let value: any = null;
            switch (f.name) {
                case ProcessFilterKey.STATUSES: {
                    value = (f as CheckboxFilter).value?.map((option) => option.value);

                    filterValues[ProcessFilterKey.STATUSES] = value;
                    filterValues['status'] = value?.length ? value[0] : null;

                    break;
                }
                case ProcessFilterKey.APP_VERSIONS: {
                    value = (f as CheckboxFilter).value?.map((option) => option.value);

                    filterValues[ProcessFilterKey.APP_VERSIONS] = value;
                    filterValues['appVersion'] = value?.length ? parseInt(value[0] || '', 10) : null;
                    break;
                }
                case ProcessFilterKey.PROCESS_DEFINITION_NAMES: {
                    value = (f as CheckboxFilter).value?.map((option) => option.value);

                    filterValues[ProcessFilterKey.PROCESS_DEFINITION_NAMES] = value;
                    filterValues['processDefinitionName'] = value?.length ? value[0] : null;

                    break;
                }
                case ProcessFilterKey.PROCESS_NAMES: {
                    value = (f as StringFilter).value;

                    filterValues[ProcessFilterKey.PROCESS_NAMES] = value;
                    filterValues['processName'] = value?.length ? value[0] : null;

                    break;
                }
                case ProcessFilterKey.STARTED_BY_USERS: {
                    value = (f as UserFilter).value?.map((user) => user.username) as string[];

                    filterValues[ProcessFilterKey.STARTED_BY_USERS] = value;
                    filterValues['initiator'] = value?.length ? value[0] : null;

                    break;
                }
                case ProcessFilterKey.SUSPENDED_DATE: {
                    filterValues[ProcessFilterKey.SUSPENDED_DATE] = (f as DateFilter).value?.selectedOption?.value as DateCloudFilterType;
                    filterValues[ProcessFilterKey.SUSPENDED_DATE_FROM] = (f as DateFilter).value?.range?.from?.toISOString() || '';
                    filterValues[ProcessFilterKey.SUSPENDED_DATE_TO] = (f as DateFilter).value?.range?.to?.toISOString() || '';
                    break;
                }
                case ProcessFilterKey.COMPLETED_DATE: {
                    filterValues[ProcessFilterKey.COMPLETED_DATE] = (f as DateFilter).value?.selectedOption?.value as DateCloudFilterType;
                    filterValues[ProcessFilterKey.COMPLETED_DATE_FROM] = (f as DateFilter).value?.range?.from?.toISOString() || '';
                    filterValues[ProcessFilterKey.COMPLETED_DATE_TO] = (f as DateFilter).value?.range?.to?.toISOString() || '';
                    break;
                }
                case ProcessFilterKey.STARTED_DATE: {
                    filterValues[ProcessFilterKey.STARTED_DATE] = (f as DateFilter).value?.selectedOption?.value as DateCloudFilterType;
                    filterValues[ProcessFilterKey.STARTED_DATE_FROM] = (f as DateFilter).value?.range?.from?.toISOString() || '';
                    filterValues[ProcessFilterKey.STARTED_DATE_TO] = (f as DateFilter).value?.range?.to?.toISOString() || '';
                    break;
                }
                default: {
                    break;
                }
            }
        });

        const processFilters = filters.filter((f) => isProcessVariableFilter(f)).filter((f) => f.visible === true) as ProcessVariableFilter[];

        filterValues['processVariableFilters'] = this.processVariableModelCreator.createProcessVariableFilters(processFilters);

        return new ProcessFilterCloudModel(filterValues);
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

    private fetchApplicationVersions(appName: string): Observable<string[]> {
        return this.processCloudService
            .getApplicationVersions(appName)
            .pipe(map((appVersions: ApplicationVersionModel[]) => appVersions.map((appVersion) => appVersion.entry.version)));
    }

    private fetchProcessDefinitionNames(appName: string): Observable<string[]> {
        return this.processCloudService
            .getProcessDefinitions(appName)
            .pipe(map((processDefinitions) => processDefinitions.map((processDefinition) => processDefinition.name)));
    }

    private translateLabels(filters: Filter[]): Filter[] {
        filters.forEach((f) => {
            f.label = this.translateService.instant(f.translationKey);
        });
        return filters;
    }

    private createProcessFiltersList(
        processFilter: ProcessFilterCloudModel,
        processDefinitionNames: string[],
        appVersions: string[],
        startedByUsers: IdentityUserModel[],
        processesVariables: VariableByProcess[]
    ): Filter[] {
        const processVariableFilterConfigs = this.processVariableFilterConfigFactory.createConfigs(
            processFilter.processVariableFilters ?? [],
            processesVariables
        );

        return [
            createAppVersionFilter(processFilter.appVersions || [], appVersions),
            createStatusFilter(processFilter.statuses || []),
            createProcessDefinitionNameFilter(processFilter.processDefinitionNames || [], processDefinitionNames),
            createProcessNameFilter(processFilter.processNames || []),
            createStartedByFilter(startedByUsers, processFilter.appName),
            createSuspendedDateFilter(processFilter.suspendedDateType, processFilter.suspendedFrom, processFilter.suspendedTo),
            createCompletedDateFilter(processFilter.completedDateType, processFilter.completedFrom, processFilter.completedTo),
            createStartedDateFilter(processFilter.startedDateType, processFilter.startFrom, processFilter.startTo),
            ...processVariableFilterConfigs.map((process) => createProcessVariableFilter(process)).filter((f) => !!f),
        ];
    }
}
