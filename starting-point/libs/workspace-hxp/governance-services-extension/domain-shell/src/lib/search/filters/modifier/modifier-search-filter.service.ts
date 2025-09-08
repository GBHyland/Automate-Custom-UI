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
import { GovernanceUserService } from '../../../config/governance-user.service';

@Injectable({
    providedIn: 'root',
})
export class ModifierSearchFilterService {
    private userService = inject(GovernanceUserService);

    getModifiers(): Observable<{ label: string; value: string; id: string }[]> {
        return this.userService.getUsers().pipe(
            map((users) => {
                return users.map((user) => ({
                    label: user.username,
                    value: user.id,
                    id: user.id,
                }));
            })
        );
    }

    toQueryParams(data: MultiSelectListSearchFilterData): any {
        return {
            modifier: data.values.map((item) => item.value),
        };
    }
}
