/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '..';

export class HxpMoreFiltersComponent extends BaseComponent {
    static rootElement = 'hxp-more-filters-menu';

    constructor(page: Page) {
        super(page, HxpMoreFiltersComponent.rootElement);
    }

    private getUpdateButtonLocator = this.getElementByAutomationId('hxp-more-filters-menu-update-button');
    private getFilterNameFromList = (filterName: string) =>
        this.getChild('.hxp-more-filters-menu__list-item', { hasText: new RegExp(`^\\s*${filterName}\\s*$`) });

    async selectFilterName(filterName: string): Promise<void> {
        const checked = await this.getFilterNameFromList(filterName).locator('input[type="checkbox"]').isChecked();
        if (checked) {
            await this.getUpdateButtonLocator.click();
        } else {
            await this.getFilterNameFromList(filterName).click();
            await this.getUpdateButtonLocator.click();
        }
    }
}
