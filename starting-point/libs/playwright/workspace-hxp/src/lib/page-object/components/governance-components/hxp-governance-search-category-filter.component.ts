/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpGovernanceSearchCategoryFilterComponent extends BaseComponent {
    static readonly rootElement = 'hxp-governance-search-category-filter';

    constructor(page: Page) {
        super(page, HxpGovernanceSearchCategoryFilterComponent.rootElement);
    }

    categoryFilterLocator = this.getChild('', { hasText: 'Category' });
}
