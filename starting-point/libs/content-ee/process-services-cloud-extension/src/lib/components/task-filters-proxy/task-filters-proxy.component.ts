/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { TaskFilterCloudModel, TaskFilterCloudService } from '@alfresco/adf-process-services-cloud';
import { AppConfigService } from '@alfresco/adf-core';
import { navigateToTasks } from '../../store/actions/process-management-filter.actions';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';

@Component({
    standalone: true,
    template: '',
})
export class TaskFiltersProxyComponent implements OnInit {
    constructor(private taskFilterCloudService: TaskFilterCloudService, private appConfigService: AppConfigService, private store: Store<any>) {}

    fetchAppNameFromAppConfig(): string {
        return this.appConfigService.get('alfresco-deployed-apps')[0]?.name;
    }

    ngOnInit() {
        this.navigateToFirstAvailableFilter();
    }

    private navigateToFirstAvailableFilter() {
        const appName = this.fetchAppName();
        this.taskFilterCloudService
            .getTaskListFilters(appName)
            .pipe(take(1))
            .subscribe((filters: TaskFilterCloudModel[]) => {
                const firstFilter = filters[0];
                if (firstFilter?.id) {
                    this.navigateToTaskFilter(filters[0].id);
                }
            });
    }

    private fetchAppName(): string {
        return this.appConfigService.get('alfresco-deployed-apps')[0]?.name;
    }

    private navigateToTaskFilter(filterId: string) {
        this.store.dispatch(
            navigateToTasks({
                filterId,
            })
        );
    }
}
