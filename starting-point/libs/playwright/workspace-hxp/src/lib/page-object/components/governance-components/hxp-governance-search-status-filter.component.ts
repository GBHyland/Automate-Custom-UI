/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpGovernanceSearchStatusFilterComponent extends BaseComponent {
    static readonly rootElement = 'hxp-governance-search-status-filter';

    constructor(page: Page) {
        super(page, HxpGovernanceSearchStatusFilterComponent.rootElement);
    }

    statusFilterLocator = this.getChild('', { hasText: 'Status' });
}
