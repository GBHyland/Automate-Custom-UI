/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '..';

export class HxpCheckboxFilterMenuComponent extends BaseComponent {
    static rootElement = 'hxp-checkbox-filter-menu';

    constructor(page: Page) {
        super(page, HxpCheckboxFilterMenuComponent.rootElement);
    }

    private getCheckboxFilterMenuListItems = this.getChild(`.hxp-checkbox-filter-menu__list-item input[type='checkbox']`);
    private getCheckboxFilterMenuListItem = (value: string) => this.getElementByAutomationId(`hxp-checkbox-filter-menu-option-${value}`);
    private getUpdateFilterButtonLocator = this.getElementByAutomationId('hxp-filter-menu-update-button');

    async selectSingleFilterValue(value: string): Promise<void> {
        const checkboxes = await this.getCheckboxFilterMenuListItems.all();
        await Promise.all(
            checkboxes.map(async (checkbox) => {
                const isChecked = await checkbox.isChecked();
                if (isChecked) {
                    await checkbox.click();
                }
            })
        );
        await this.getCheckboxFilterMenuListItem(value).click();
        await this.getUpdateFilterButtonLocator.click();
    }
}
