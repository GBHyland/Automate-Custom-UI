/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable, inject } from '@angular/core';
import { SearchFilterService } from '../../models/search-filter-service.interface';
import { SearchFilterData } from '../../models/search-filter.data';
import { DateSearchFilterService } from '../base/date-filter/date-search-filter.service';

@Injectable()
export class CutoffSearchFilterService implements SearchFilterService {
    private dateService = inject(DateSearchFilterService);

    toQueryParams(data: SearchFilterData): Record<string, any> {
        return this.dateService.toQueryParams(data, 'cutoffDate');
    }
}
