/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { SearchFilterService } from '@alfresco/adf-hx-content-services/services';
import { DocumentCategorySearchFilterData } from './document-category-search-filter.data';

@Injectable()
export class DocumentCategorySearchFilterService implements SearchFilterService {
    public toHXQL(data: DocumentCategorySearchFilterData): string {
        return data?.values?.length > 0 ? `sys_primaryType IN (${data.values.map((i) => `'${i.value}'`).join(',')})` : '';
    }
}
