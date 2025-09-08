/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { GovernanceConfigurationService } from '../../../config/governance-config.service';
import { AsyncPipe } from '@angular/common';

@Pipe({
    name: 'recordCategoryLabel',
    pure: false,
    standalone: true,
})
export class RecordCategoryLabelPipe implements PipeTransform {
    private configService = inject(GovernanceConfigurationService);
    private asyncPipe = inject(AsyncPipe);

    transform(categoryId: string): string {
        return categoryId
            ? this.asyncPipe.transform(this.configService.getConfig())?.categories.find((cat) => cat.id === categoryId)?.name || ''
            : '';
    }
}
