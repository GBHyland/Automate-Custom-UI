/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { HxpSearchFilterBaseComponent } from './hxp-search-filter.base.component';

export class HxpSearchFileTypeFilterComponent extends HxpSearchFilterBaseComponent {
    static rootElement = '.hxp-file-type-search-filter-container';

    constructor(page: Page) {
        super(page, HxpSearchFileTypeFilterComponent.rootElement);
    }

    searchInputLocator = this.getChild('.hxp-search-filter-input input');
    searchButtonLocator = this.getChild('.hxp-search-filter-input-search-icon');

    getFileMimeTypeParent = (labelName: string): Locator => this.getChild('.hxp-mime-type-parent-label', { hasText: labelName });
    getFileMimeTypeTreeItem = (itemName: string): Locator => this.getChild('.hxp-mime-type-description-title', { hasText: itemName });
    searchWithinFilter = async (query: string): Promise<void> => this.searchInputLocator.pressSequentially(query);
}
