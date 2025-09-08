/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';

@Pipe({
    name: 'recordDataSourceLabel',
    pure: false,
    standalone: true,
})
export class RecordDataSourceLabelPipe implements PipeTransform {
    private asyncPipe = inject(AsyncPipe);

    constructor(private governanceConfigService: GovernanceConfigurationService) {}

    transform(dataSourceId: string): string {
        return dataSourceId
            ? this.asyncPipe.transform(this.governanceConfigService.getConfig())?.dataSources.find((dataSource) => dataSourceId === dataSource.id)
                  ?.name || ''
            : '';
    }
}
