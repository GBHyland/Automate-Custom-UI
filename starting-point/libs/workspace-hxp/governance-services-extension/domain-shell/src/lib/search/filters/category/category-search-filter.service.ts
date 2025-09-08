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
import { Category, FilePlan, GovernanceConfigModel } from '../../../config/governance-config.type';

@Injectable({
    providedIn: 'root',
})
export class CategorySearchFilterService {
    private configService = inject(GovernanceConfigurationService);

    getCategories(): Observable<{ label: string; value: string; tooltip: string }[]> {
        return this.configService.getConfig().pipe(
            map((config: GovernanceConfigModel) => {
                const categories: { label: string; value: string; tooltip: string }[] = [];
                const categoryMap = new Map<string, Category>();
                for (const cat of config.categories) {
                    categoryMap.set(cat.id, cat);
                }
                const filePlanMap = new Map<string, FilePlan>();
                for (const fp of config.filePlans) {
                    filePlanMap.set(fp.id, fp);
                }
                for (const cat of config.categories) {
                    // Build the path segments from the category up to the root
                    const segments: string[] = [];
                    let currentCat: Category | undefined = cat;
                    while (currentCat) {
                        segments.unshift(currentCat.name);
                        currentCat = currentCat.parentId ? categoryMap.get(currentCat.parentId) : undefined;
                    }
                    // Prepend file plan name if available
                    let filePlanName = '';
                    if (cat.filePlanId) {
                        const filePlan = filePlanMap.get(cat.filePlanId);
                        if (filePlan) {
                            filePlanName = filePlan.name;
                        }
                    }
                    if (filePlanName) {
                        segments.unshift(filePlanName);
                    }
                    // Build label and tooltip
                    const label =
                        segments.length <= 2
                            ? segments.map((seg) => this.truncateSegment(seg, 7)).join('/')
                            : `${this.truncateSegment(segments[0], 7)}/.../${this.truncateSegment(segments.at(-1) ?? '', 7)}`;
                    const rawPath = segments.join('/');
                    categories.push({
                        label,
                        value: cat.id,
                        tooltip: rawPath,
                    });
                }
                return categories;
            })
        );
    }

    toQueryParams(data: MultiSelectListSearchFilterData): any {
        return {
            categoryId: data.values.map((item) => item.value),
        };
    }

    /**
     * Truncate a text segment to the specified max length, adding an ellipsis if truncated.
     */
    private truncateSegment(text: string, maxLength: number): string {
        if (text.length <= maxLength) {
            return text;
        }
        // Reserve one character for the ellipsis
        const sliceLength = Math.max(0, maxLength - 1);
        return text.slice(0, sliceLength) + '…';
    }
}
