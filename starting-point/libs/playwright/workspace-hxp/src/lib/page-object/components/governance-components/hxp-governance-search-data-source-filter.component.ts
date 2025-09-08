/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpGovernanceSearchDataSourceFilterComponent extends BaseComponent {
    static readonly rootElement = 'hxp-governance-search-data-source-filter';

    constructor(page: Page) {
        super(page, HxpGovernanceSearchDataSourceFilterComponent.rootElement);
    }

    dataSourceFilterLocator = this.getChild('', { hasText: 'Data Source' });
}
