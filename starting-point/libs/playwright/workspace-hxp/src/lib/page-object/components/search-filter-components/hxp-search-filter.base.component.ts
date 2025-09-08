/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpSearchFilterBaseComponent extends BaseComponent {
    constructor(page: Page, rootElement: string) {
        super(page, rootElement);
    }

    clearFilterButton = this.page.locator('button.hxp-search-filter-overlay-actions-clear');
    applyFilterButton = this.page.locator('button.hxp-search-filter-overlay-actions-apply');

    getFilterTagLabel = (tagName: string): Locator => this.getChild('span[class*="-summary-list-item__label"]', { hasText: tagName });
    getFilterTagRemoveButton = (tagName: string): Locator =>
        this.getChild('[class*="-summary-list-item"]', { hasText: tagName }).locator(`button[aria-label*="Remove"]`);
}
