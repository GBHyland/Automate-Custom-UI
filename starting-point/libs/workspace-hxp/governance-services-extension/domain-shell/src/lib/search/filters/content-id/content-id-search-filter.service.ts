/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { SearchFilterService } from '../../models/search-filter-service.interface';
import { ContentIdSearchFilterData } from './content-id-search-filter.data';

@Injectable()
export class ContentIdSearchFilterService implements SearchFilterService {
    public toQueryParams(data: ContentIdSearchFilterData): Record<string, any> {
        if (!data?.values?.length) {
            return {};
        }
        return { contentId: data.values[0].value };
    }
}
