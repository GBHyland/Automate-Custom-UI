/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit, ViewChild, ViewEncapsulation, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Store } from '@ngrx/store';
import { combineLatest, Observable } from 'rxjs';
import { switchMap, withLatestFrom, map, filter, take, tap } from 'rxjs/operators';
import { DisplayModeService, FormCloudDisplayMode, ProcessFilterCloudModel, ProcessFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { AppConfigService, NotificationService } from '@alfresco/adf-core';
import { selectApplicationName, selectIfCurrentFilterCanBeRefreshed } from '../../../../store/selectors/extension.selectors';
import { setProcessManagementFilter, navigateToFilter } from '../../../../store/actions/process-management-filter.actions';
import { FilterType } from '../../../../store/states/extension.state';
import { ProcessListCloudExtComponent } from './process-list-cloud-ext.component';
import { selectProcessDefinitionsLoaderIndicator } from '../../../../store/selectors/process-definitions.selector';
import { ProcessFilterService } from '../../services/process-filters/process-filter.service';
import { Filter } from '@alfresco-dbp/shared-filters-services';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { AsyncPipe, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { PageLayoutContentComponent } from '../../../../components/page-layout/content/page-layout-content.component';
import { FiltersContainerComponent } from '@alfresco-dbp/shared-filters-smart';
import { DynamicExtensionComponent } from '@alfresco/adf-extensions';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { PageLayoutHeaderComponent } from '../../../../components/page-layout/header/page-layout-header.component';
import { PageLayoutComponent } from '../../../../components/page-layout/page-layout.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
    standalone: true,
    imports: [
        AsyncPipe,
        NgIf,
        MatButtonModule,
        PageLayoutContentComponent,
        FiltersContainerComponent,
        ProcessListCloudExtComponent,
        DynamicExtensionComponent,
        TranslatePipe,
        MatIconModule,
        PageLayoutHeaderComponent,
        PageLayoutComponent,
    ],
    selector: 'apa-process-list-cloud-container-ext',
    templateUrl: './process-list-cloud-container-ext.component.html',
    styleUrls: ['./process-list-cloud-container-ext.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ProcessListCloudContainerExtComponent implements OnInit {
    private readonly store = inject(Store);
    private readonly processFilterService = inject(ProcessFilterService);
    private readonly processFilterCloudService = inject(ProcessFilterCloudService);
    private readonly appConfigService = inject(AppConfigService);
    private readonly route = inject(ActivatedRoute);
    private readonly notificationService = inject(NotificationService);
    private readonly destroyRef = inject(DestroyRef);

    @ViewChild('apaProcessListCloudExt')
    processListExtCloudComponent: ProcessListCloudExtComponent;

    processFilter: ProcessFilterCloudModel;
    showRefreshButton = false;
    filters: Filter[] = [];
    isDefaultFilter = true;
    filtersLoading$ = this.processFilterService.filtersLoading$;

    private canListBeRefreshed: boolean;

    ngOnInit() {
        this.store.select(selectIfCurrentFilterCanBeRefreshed).subscribe((canBeRefreshed) => {
            this.canListBeRefreshed = canBeRefreshed;
        });
        this.handleQueryParamsChange();
        this.destroyRef.onDestroy(() => {
            this.resetCurrentFilterRefreshStatus();
        });
    }

    onFilterSave() {
        this.processFilterService
            .saveFilter(this.processFilter)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
                this.navigateToProcessFilter(this.processFilter.id);
            });
    }

    onFilterSaveAs(newFilterName: string) {
        this.processFilterService
            .saveFilterAs(this.processFilter, newFilterName)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe(() => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_SAVED');
                this.navigateToProcessFilter(this.processFilter.id);
            });
    }

    onFilterDelete() {
        this.processFilterService
            .deleteFilter(this.processFilter)
            .pipe(take(1), takeUntilDestroyed(this.destroyRef))
            .subscribe((appProcessFilters) => {
                this.showFilterNotification('PROCESS_CLOUD_EXTENSION.PROCESS_FILTER.FILTER_DELETED');
                this.navigateToProcessFilter(appProcessFilters[0].id);
            });
    }

    onFiltersChange(filters: Filter[]) {
        this.processListExtCloudComponent?.fetchCloudPaginationPreference();

        const processFilter = this.processFilterService.createProcessFilterCloudModel(this.processFilter, filters);

        this.setProcessFilter(processFilter);
    }

    onRefreshButtonClicked(): void {
        if (this.canListBeRefreshed) {
            this.refreshProcessList();
        } else {
            this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_UPTO_DATE');
        }
    }

    private handleQueryParamsChange(): void {
        this.route.queryParams
            .pipe(
                withLatestFrom(this.store.select(selectApplicationName)),
                switchMap(([params, appName]) => {
                    return combineLatest([this.loadFilter(appName, params), this.waitUntilProcessDefinitionsAreLoaded()]);
                }),
                tap(([processFilter]) => {
                    this.setProcessFilter(processFilter);
                    this.setupRefreshButtonStatus();
                    this.resetCurrentFilterRefreshStatus();
                    DisplayModeService.changeDisplayMode({ displayMode: FormCloudDisplayMode.inline });
                }),
                switchMap(() => {
                    return this.processFilterService.getFilters(this.processFilter);
                }),
                takeUntilDestroyed(this.destroyRef)
            )
            .subscribe((filters) => {
                this.filters = filters;
                this.isDefaultFilter = this.processFilterService.isDefaultFilter(this.processFilter);
            });
    }

    private setProcessFilter(processFilter: ProcessFilterCloudModel) {
        this.processFilter = new ProcessFilterCloudModel(processFilter);
        this.setProcessManagementFilter(processFilter);
    }

    private showFilterNotification(key: string) {
        this.notificationService.showInfo(key);
    }

    private navigateToProcessFilter(filterId: string) {
        this.store.dispatch(
            navigateToFilter({
                filterId,
            })
        );
    }

    private setProcessManagementFilter(processFilter: ProcessFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.PROCESS,
                    filter: processFilter,
                },
            })
        );
    }

    private loadFilter(appName: string, params: Params): Observable<ProcessFilterCloudModel> {
        const numberOfParams = Object.keys(params).length;
        const filterId = params['filterId'] || params['id'];

        if (numberOfParams === 0) {
            return this.getFirstProcessFilter(appName);
        } else if (numberOfParams === 1 && filterId) {
            return this.processFilterCloudService.getFilterById(appName, filterId);
        } else {
            return this.getAllProcessesFilter(appName).pipe(
                map((allProcessesModel) => {
                    return new ProcessFilterCloudModel({
                        ...allProcessesModel,
                        ...params,
                        appName,
                    });
                })
            );
        }
    }

    private waitUntilProcessDefinitionsAreLoaded(): Observable<boolean> {
        return this.store.select(selectProcessDefinitionsLoaderIndicator).pipe(filter((areDefinitionsLoaded) => areDefinitionsLoaded));
    }

    private refreshProcessList(): void {
        this.processListExtCloudComponent.reload();
        this.showFilterNotification('PROCESS_CLOUD_EXTENSION.TASK_LIST.LIST_REFRESHED');
        this.resetCurrentFilterRefreshStatus();
        this.setRefreshedFilter();
    }

    private resetCurrentFilterRefreshStatus(): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: this.processFilter.key, canBeRefreshed: false }));
    }

    private setupRefreshButtonStatus(): void {
        const allowedProcesses = [
            'ADF_CLOUD_PROCESS_FILTERS.RUNNING_PROCESSES',
            'ADF_CLOUD_PROCESS_FILTERS.COMPLETED_PROCESSES',
            'ADF_CLOUD_PROCESS_FILTERS.ALL_PROCESSES',
        ];
        const isCurrentFilterAllowed = allowedProcesses.includes(this.processFilter.name);
        const areNotificationsEnabled = this.appConfigService.get('notifications', true);
        this.showRefreshButton = areNotificationsEnabled && isCurrentFilterAllowed;
    }

    private setRefreshedFilter(): void {
        this.processFilterCloudService.refreshFilter(this.processFilter.key);
    }

    private getFirstProcessFilter(appName: string): Observable<ProcessFilterCloudModel> {
        return this.processFilterCloudService.getProcessFilters(appName).pipe(map((filters) => filters[0]));
    }

    private getAllProcessesFilter(appName: string): Observable<ProcessFilterCloudModel> {
        return this.processFilterCloudService.getProcessFilters(appName).pipe(map((filters) => filters.find((f) => f.key === 'all-processes')));
    }
}
