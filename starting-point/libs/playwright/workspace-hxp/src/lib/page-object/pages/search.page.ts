/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BasePage, DatePicker, MatPaginatorComponent } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';
import {
    HxpSearchFiltersComponent,
    HxpSearchCreatedDateFilterComponent,
    HxpSearchResultsComponent,
    HxpSearchManageColumnsComponent,
    HxpSearchDocumentCategoryFilterComponent,
    HxpSearchDocumentLocationFilterComponent,
    HxpSearchFileTypeFilterComponent,
} from '../components';

export class SearchPage extends BasePage {
    private static pageUrl = '/search';

    constructor(page: Page) {
        super(page, SearchPage.pageUrl);
    }

    searchResults = new HxpSearchResultsComponent(this.page);
    searchResultListPaginatorComponent = new MatPaginatorComponent(this.page);
    searchFilters = new HxpSearchFiltersComponent(this.page);
    createdDateFilter = new HxpSearchCreatedDateFilterComponent(this.page);
    manageColumns = new HxpSearchManageColumnsComponent(this.page);
    datePicker = new DatePicker(this.page);
    categoryFilter = new HxpSearchDocumentCategoryFilterComponent(this.page);
    locationFilter = new HxpSearchDocumentLocationFilterComponent(this.page);
    fileTypeFilter = new HxpSearchFileTypeFilterComponent(this.page);
}
