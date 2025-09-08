/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DropdownAutocompleteComponent } from '..';

export class HxpUserFilterMenuComponent extends BaseComponent {
    static rootElement = 'hxp-user-filter-menu';

    dropdown = new DropdownAutocompleteComponent(this.page);

    constructor(page: Page) {
        super(page, HxpUserFilterMenuComponent.rootElement);
    }

    private getUpdateButtonLocator = this.getElementByAutomationId('hxp-filter-menu-update-button');
    private getUserInputLocator = this.getElementByAutomationId('adf-people-cloud-search-input');

    async provideUserName(userName: string): Promise<void> {
        await this.getUserInputLocator.pressSequentially(userName);
        await this.dropdown.firstOptionLocator.click();
        await this.getUpdateButtonLocator.click();
    }
}
