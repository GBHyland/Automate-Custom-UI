/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { HxpSearchFilterBaseComponent } from './hxp-search-filter.base.component';

export class HxpSearchDocumentCategoryFilterComponent extends HxpSearchFilterBaseComponent {
    static rootElement = '.hxp-document-category-filter-container';

    constructor(page: Page) {
        super(page, HxpSearchDocumentCategoryFilterComponent.rootElement);
    }

    getCategoryCheckbox = (docCategory: string) => this.getChild().getByLabel(docCategory);
}
