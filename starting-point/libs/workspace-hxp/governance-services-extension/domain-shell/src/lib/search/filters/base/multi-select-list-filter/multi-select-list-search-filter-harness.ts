/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatChipSetHarness } from '@angular/material/chips/testing';
import { MatSelectionListHarness } from '@angular/material/list/testing';
import { SearchFilterHarness } from '../search-filter-container/search-filter-container-harness';

export class MultiSelectListSearchFilterHarness extends SearchFilterHarness {
    getSummary = this.documentRootLocatorFactory().locatorForOptional(
        MatChipSetHarness.with({ selector: '.hxp-governance-multi-selection-filter-summary-list' })
    );

    getNoResults = this.documentRootLocatorFactory().locatorForOptional('.hxp-governance-multi-selection-filter-no-results');

    protected getSelectionList = this.documentRootLocatorFactory().locatorForOptional(
        MatSelectionListHarness.with({ selector: '.hxp-governance-multi-selection-filter-list' })
    );

    async getSelection() {
        const selectionList = await this.getSelectionList();
        return selectionList?.getItems();
    }
}
