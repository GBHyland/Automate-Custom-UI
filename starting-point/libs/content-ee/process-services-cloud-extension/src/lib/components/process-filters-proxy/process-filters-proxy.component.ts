/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { AppConfigService } from '@alfresco/adf-core';
import { navigateToProcesses } from '../../store/actions/process-management-filter.actions';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators';
import { ProcessFilterCloudModel, ProcessFilterCloudService } from '@alfresco/adf-process-services-cloud';

@Component({
    template: '',
    standalone: true,
})
export class ProcessFiltersProxyComponent implements OnInit {
    constructor(
        private processFilterCloudService: ProcessFilterCloudService,
        private appConfigService: AppConfigService,
        private store: Store<any>
    ) {}

    ngOnInit() {
        this.navigateToFirstAvailableFilter();
    }

    private navigateToFirstAvailableFilter() {
        const appName = this.fetchAppName();
        this.processFilterCloudService
            .getProcessFilters(appName)
            .pipe(take(1))
            .subscribe((filters: ProcessFilterCloudModel[]) => {
                const firstFilter = filters[0];
                if (firstFilter?.id) {
                    this.navigateToProcessFilter(firstFilter.id);
                }
            });
    }

    private fetchAppName(): string {
        return this.appConfigService.get('alfresco-deployed-apps')[0]?.name;
    }

    private navigateToProcessFilter(filterId: string) {
        this.store.dispatch(
            navigateToProcesses({
                filterId,
            })
        );
    }
}
