/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';

export class DropdownComponent extends BaseComponent {
    private static rootElement = '.adf-dropdown-widget';
    constructor(page: Page) {
        super(page, DropdownComponent.rootElement);
    }

    executorDropdownLocator = this.getChild('#executorDropdown');
    dropdownOptionsLocator = this.page.locator('[role="option"]');

    async selectOptionById(optionId: string): Promise<void> {
        await this.executorDropdownLocator.click();
        await this.page.locator(`#${optionId}`).click();
    }

    async selectOptionByText(optionText: string): Promise<void> {
        await this.executorDropdownLocator.click();
        await this.page.locator(`text=${optionText}`).click();
    }
}
