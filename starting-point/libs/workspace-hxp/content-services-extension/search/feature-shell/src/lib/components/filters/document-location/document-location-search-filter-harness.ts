/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { SearchFilterHarness } from '@alfresco/adf-hx-content-services/ui';
import { MatChipSetHarness } from '@angular/material/chips/testing';
import { MatSelectionListHarness } from '@angular/material/list/testing';

export class DocumentLocationSearchFilterHarness extends SearchFilterHarness {
    documentTree = this.documentRootLocatorFactory().locatorForOptional('hxp-workspace-document-tree');

    loadingSpinner = this.documentRootLocatorFactory().locatorForOptional('.hxp-document-location-search-filter-spinner-container');

    getResultsList = this.documentRootLocatorFactory().locatorForOptional(
        MatSelectionListHarness.with({ selector: '.hxp-document-location-search-filter-list' })
    );

    protected getFilterSummary = this.documentRootLocatorFactory().locatorForOptional(
        MatChipSetHarness.with({ selector: '.hxp-document-location-search-filter-summary-list' })
    );

    async selectItemsResultsList() {
        const selectionList = await this.getResultsList();
        return selectionList?.selectItems();
    }

    async getSummaryItems() {
        const chipList = await this.getFilterSummary();
        return chipList?.getChips();
    }

    async getResultsListSelection() {
        const selectionList = await this.getResultsList();
        return selectionList?.getItems();
    }
}
