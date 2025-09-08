/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '..';

export class HxpStringFilterMenuComponent extends BaseComponent {
    static rootElement = 'hxp-string-filter-menu';

    constructor(page: Page) {
        super(page, HxpStringFilterMenuComponent.rootElement);
    }

    private getInputForStringFilterLocator = this.getElementByAutomationId('hxp-string-filter-menu-input');
    private getUpdateFilterButtonLocator = this.getElementByAutomationId('hxp-filter-menu-update-button');

    async provideTestFilterValue(value: string): Promise<void> {
        await this.getInputForStringFilterLocator.fill(value);
        await this.getUpdateFilterButtonLocator.click();
    }
}
