/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import {
    HxpGovernanceSearchResultsComponent,
    HxpGovernanceSearchDataSourceFilterComponent,
    HxpGovernanceSearchCategoryFilterComponent,
    HxpGovernanceSearchCutoffDateFilterComponent,
    HxpGovernanceSearchDispositionDateFilterComponent,
    HxpGovernanceSearchStatusFilterComponent,
    HxpGovernanceSearchModifierFilterComponent,
    HxpGovernanceSearchCreatorFilterComponent,
    HxpGovernanceSearchContentIdFilterComponent,
    HxpGovernanceMultiSelectionFilterComponent,
    HxpGovernanceSearchFilterOverlayComponent,
    HxpRecordListComponent,
    HxpGovernanceSearchRecordNameFilterComponent,
    HxpGovernanceSearchResultsActionsComponent,
    HxpRecordPropertiesSidebarComponent,
    HxpDatepickerActionsContainerComponent,
} from '../components/governance-components';
import { HomePage } from './';

export class GovernancePage extends HomePage {
    private static readonly pageUrl = `/governance`;

    constructor(page: Page) {
        super(page, GovernancePage.pageUrl);
    }

    searchResults = new HxpGovernanceSearchResultsComponent(this.page);
    dataSourceSearchFilter = new HxpGovernanceSearchDataSourceFilterComponent(this.page);
    categoryFilter = new HxpGovernanceSearchCategoryFilterComponent(this.page);
    cutoffDateFilter = new HxpGovernanceSearchCutoffDateFilterComponent(this.page);
    dispositionDateFilter = new HxpGovernanceSearchDispositionDateFilterComponent(this.page);
    statusFilter = new HxpGovernanceSearchStatusFilterComponent(this.page);
    modifierFilter = new HxpGovernanceSearchModifierFilterComponent(this.page);
    creatorFilter = new HxpGovernanceSearchCreatorFilterComponent(this.page);
    contentIdFilter = new HxpGovernanceSearchContentIdFilterComponent(this.page);
    multiSelectionFilter = new HxpGovernanceMultiSelectionFilterComponent(this.page);
    overlayActions = new HxpGovernanceSearchFilterOverlayComponent(this.page);
    recordList = new HxpRecordListComponent(this.page);
    recordNameFilter = new HxpGovernanceSearchRecordNameFilterComponent(this.page);
    searchResultsActions = new HxpGovernanceSearchResultsActionsComponent(this.page);
    recordPropertiesSidebar = new HxpRecordPropertiesSidebarComponent(this.page);
    datePickerActions = new HxpDatepickerActionsContainerComponent(this.page);
}
