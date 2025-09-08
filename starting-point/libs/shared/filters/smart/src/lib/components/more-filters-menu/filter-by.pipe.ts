/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Filter } from '@alfresco-dbp/shared-filters-services';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filterBy',
    standalone: true,
})
export class FilterByPipe implements PipeTransform {
    transform(filters: Filter[], searchPhrase: string | null): Filter[] {
        if (!searchPhrase) {
            return filters;
        }

        return filters.filter((filter) => filter.label.toLowerCase().includes(searchPhrase.toLowerCase()));
    }
}
