/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

const filters = {
    createdDate: 'hxp-search-created-date-filter',
    documentCategory: 'hxp-search-document-category-filter',
    documentLocation: 'hxp-document-location-search-filter',
    fileType: 'hxp-file-type-search-filter',
};

export class HxpSearchFiltersComponent extends BaseComponent {
    static rootElement = '.hxp-search-filters';

    constructor(page: Page) {
        super(page, HxpSearchFiltersComponent.rootElement);
    }

    resetFiltersButton = this.getChild('[aria-label="Reset"]');

    getFilterChipButton = (filterName: keyof typeof filters): Locator => this.getChild(`${filters[filterName]} .hxp-search-filter-chip`);
    getFilterChipLabel = (filterName: keyof typeof filters): Locator => this.getChild(`${filters[filterName]} .hxp-search-filter-chip-label`);
}
