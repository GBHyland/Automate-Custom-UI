/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/playwright/shared';
import { HxpSearchResultsHeaderComponent } from './hxp-search-results-header.component';

export class HxpSearchInputComponent extends BaseComponent {
    static rootElement = '.hxp-search-input';

    constructor(page: Page) {
        super(page, HxpSearchInputComponent.rootElement);
    }

    header = new HxpSearchResultsHeaderComponent(this.page);

    searchDropdownLocator = this.getChild(materialLocators.Form.field);
    searchInputLocator = this.getChild(materialLocators.Input.class);

    search = async (fileNamePrefix: string) => {
        await this.searchInputLocator.fill(fileNamePrefix);
        await this.header.searchButtonLocator.click();
    };
}
