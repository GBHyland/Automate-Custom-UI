/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessFilterCloudModel, ProcessFiltersCloudComponent } from '@alfresco/adf-process-services-cloud';
import { Component, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { taskOrProcessFilterUpdate } from '../../../../store/actions/extension.actions';
import { navigateToProcesses, setProcessManagementFilter } from '../../../../store/actions/process-management-filter.actions';
import { selectApplicationName, selectProcessManagementFilter } from '../../../../store/selectors/extension.selectors';
import { FilterType } from '../../../../store/states/extension.state';
import { AsyncPipe } from '@angular/common';

@Component({
    standalone: true,
    imports: [AsyncPipe, ProcessFiltersCloudComponent],
    selector: 'apa-process-filters-ext',
    templateUrl: './process-filters-cloud-ext.component.html',
})
export class ProcessFiltersCloudExtComponent {
    private readonly store = inject(Store);

    appName$ = this.store.select(selectApplicationName);
    currentFilter$ = this.store.select(selectProcessManagementFilter);

    onProcessFilterClick(filter: ProcessFilterCloudModel) {
        if (filter) {
            this.setProcessManagementFilter(filter);
            this.navigateToProcesses(filter.id);
        }
    }

    onUpdatedFilter(updatedFilter: any): void {
        this.store.dispatch(taskOrProcessFilterUpdate({ filterKey: updatedFilter, canBeRefreshed: true }));
    }

    private setProcessManagementFilter(filter: ProcessFilterCloudModel) {
        this.store.dispatch(
            setProcessManagementFilter({
                payload: {
                    type: FilterType.PROCESS,
                    filter,
                },
            })
        );
    }

    private navigateToProcesses(filterId: string) {
        this.store.dispatch(
            navigateToProcesses({
                filterId,
            })
        );
    }
}
