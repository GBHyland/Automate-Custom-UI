/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DropdownListComponent, materialLocators } from '..';

export class HxpNumberFilterMenuComponent extends BaseComponent {
    static rootElement = 'hxp-number-filter-menu';
    dropdown = new DropdownListComponent(this.page, materialLocators.Select.panel.class);

    constructor(page: Page) {
        super(page, HxpNumberFilterMenuComponent.rootElement);
    }

    private getOperatorSelectLocator = this.getElementByAutomationId('hxp-number-filter-menu-operator-select');
    private getValueInputLocator = this.getElementByAutomationId('hxp-number-filter-menu-input-single');
    private getUpdateButtonLocator = this.getElementByAutomationId('hxp-filter-menu-update-button');

    async provideNumberValue(operator: string, value: string): Promise<void> {
        await this.getOperatorSelectLocator.click();
        await this.dropdown.getOptionLocator(operator).click();
        await this.getValueInputLocator.fill(value);
        await this.getUpdateButtonLocator.click();
    }
}
