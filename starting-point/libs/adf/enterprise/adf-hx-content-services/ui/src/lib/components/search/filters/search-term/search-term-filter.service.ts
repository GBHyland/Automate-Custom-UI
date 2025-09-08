/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { SearchTermFilterData } from './search-term-filter.data';
import { SearchFilterService } from '@alfresco/adf-hx-content-services/services';

@Injectable()
export class SearchTermFilterService implements SearchFilterService {
    public toHXQL(data: SearchTermFilterData): string {
        return data?.values?.length > 0 ? `sys_fulltext = '${data.values[0].term}*'` : '';
    }
}
