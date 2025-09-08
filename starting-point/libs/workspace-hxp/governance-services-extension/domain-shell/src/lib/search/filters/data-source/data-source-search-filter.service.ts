/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { MultiSelectListSearchFilterData } from '../base/multi-select-list-filter/multi-select-list-search-filter.data';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { DataSource } from '../../../config/governance-config.type';

@Injectable({
    providedIn: 'root',
})
export class DataSourceSearchFilterService {
    private configService = inject(GovernanceConfigurationService);

    getDataSources(): Observable<{ label: string; value: string; icon?: string }[]> {
        return this.configService.getConfig().pipe(
            map((config) => {
                const dataSources = config.dataSources.map((dataSource: DataSource) => ({
                    label: dataSource.name,
                    value: dataSource.id,
                    icon: 'internal_repository',
                }));
                return dataSources;
            })
        );
    }

    toQueryParams(data: MultiSelectListSearchFilterData): any {
        return {
            eds: data.values.map((item) => item.value),
        };
    }
}
