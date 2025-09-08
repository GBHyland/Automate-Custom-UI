/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { HxpSearchFilterBaseComponent } from './hxp-search-filter.base.component';

export class HxpSearchDocumentLocationFilterComponent extends HxpSearchFilterBaseComponent {
    static rootElement = '.hxp-document-location-search-filter-container';

    constructor(page: Page) {
        super(page, HxpSearchDocumentLocationFilterComponent.rootElement);
    }

    searchInputLocator = this.getChild('.hxp-search-filter-input input');
    searchButtonLocator = this.getChild('.hxp-search-filter-input-search');
    searchResultsListLocator = this.getChild('.hxp-document-location-search-filter-list');

    getTreeItem = (itemName: string): Locator => this.getChild('.hxp-document-location-search-filter-tree [role="treeitem"]', { hasText: itemName });
    getSearchResultsListItem = (itemName: string): Locator =>
        this.getChild('.hxp-document-location-search-filter-list-option', { hasText: itemName });
    getSearchResultsListItemTitle = (itemName: string): Locator =>
        this.getChild('.hxp-document-location-search-filter-list-option-title', { hasText: itemName });

    expandNode = (folderName: string): Promise<void> => this.getTreeItem(folderName).locator('button[aria-label^="DOCUMENT_TREE.TOGGLE"]').click();
    searchWithinFilter = async (query: string): Promise<void> => {
        await this.searchInputLocator.fill(query);
        await this.searchButtonLocator.click();
        await this.searchResultsListLocator.waitFor();
    };
}
