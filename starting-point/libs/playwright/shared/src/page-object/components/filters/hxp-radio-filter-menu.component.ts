/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '..';

export class HxpRadioFilterMenuComponent extends BaseComponent {
    static rootElement = 'hxp-radio-filter-menu';

    constructor(page: Page) {
        super(page, HxpRadioFilterMenuComponent.rootElement);
    }

    getRadioFilterOptionLocator = (value: string) => this.getElementByAutomationId(`hxp-radio-filter-menu-list-item-${value}`);
    getUpdateFilterButtonLocator = this.getElementByAutomationId('hxp-filter-menu-update-button');
}
