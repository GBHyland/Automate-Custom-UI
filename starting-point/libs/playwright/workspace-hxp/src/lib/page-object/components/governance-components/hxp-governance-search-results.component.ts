/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DropdownListComponent } from '@alfresco-dbp/playwright/shared';

export class HxpGovernanceSearchResultsComponent extends BaseComponent {
    static readonly rootElement = 'hxp-governance-search-results';

    constructor(page: Page) {
        super(page, HxpGovernanceSearchResultsComponent.rootElement);
    }

    private readonly dropdown = new DropdownListComponent(this.page, '.cdk-overlay-container');

    searchButtonLocator = this.getChild('#hxp-governance-search-results-search-button');
    resetButtonLocator = this.getChild('#hxp-governance-search-results-reset-button');

    recordListLocator = this.getChild('div.hxp-record-list');
    searchResultsContainerLocator = this.getChild('.hxp-governance-search-results-container');
    searchResultsCountLocator = this.getChild('.hxp-governance-search-results-count');

    deleteActionLocator = this.getChild('[aria-label="Delete Action"]');
    selectAllButtonLocator = this.getChild('.hxp-toggle-select-all-button');
    selectionCountLocator = this.getChild('.hxp-governance-search-results-selected-count');

    paginationButtonLocator = this.getChild('.hxp-governance-table-paginator [role="combobox"]');

    recordListRowsLocator = this.getChild('.hxp-record-list-row');
    noSearchResultsLabel = this.getChild('.hxp-governance-search-results-no-results_label');
    tableSkeletonLoader = this.getChild('hxp-table-skeleton-loader');
    searchInitialLabel = this.getChild('.hxp-governance-search-results-initial-state_label');

    async changePageSize(pageSize: string) {
        await this.paginationButtonLocator.click();
        await this.dropdown.getOptionLocator(pageSize).click();
    }
}
