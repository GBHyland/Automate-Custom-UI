/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpGovernanceSearchCutoffDateFilterComponent extends BaseComponent {
    static readonly rootElement = 'hxp-governance-cutoff-search-filter';

    constructor(page: Page) {
        super(page, HxpGovernanceSearchCutoffDateFilterComponent.rootElement);
    }

    cutoffDateFilterLocator = this.getChild('', { hasText: 'Cutoff' });
}
