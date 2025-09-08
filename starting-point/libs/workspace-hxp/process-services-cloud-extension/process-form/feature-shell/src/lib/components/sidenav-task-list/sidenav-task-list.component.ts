/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FilterParamsModel, TaskFilterCloudModel, TaskFiltersCloudComponent } from '@alfresco/adf-process-services-cloud';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { TASKS_ROUTE } from '../../constants/extensions.const';
import { taskOrProcessFilterUpdate } from '../../store/process-service-cloud.actions';

@Component({
    standalone: true,
    imports: [TaskFiltersCloudComponent],
    selector: 'hxp-sidenav-task-list',
    templateUrl: './sidenav-task-list.component.html',
})
export class SidenavTaskListComponent {
    private readonly router = inject(Router);
    private readonly store = inject(Store);

    @Input() appName = '';
    @Input() currentFilter: FilterParamsModel = {};

    onTaskFilterClick(filter: TaskFilterCloudModel) {
        if (!filter.id) {
            return;
        }
        void this.router.navigate([TASKS_ROUTE], {
            queryParams: {
                filterId: filter.id,
            },
        });
    }

    onUpdatedFilter(updatedFilter: any): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: updatedFilter, canBeRefreshed: true }));
    }
}
