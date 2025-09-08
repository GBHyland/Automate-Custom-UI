/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpGovernanceSearchFilterOverlayComponent extends BaseComponent {
    static readonly rootElement = '.hxp-governance-search-filter-overlay';

    constructor(page: Page) {
        super(page, HxpGovernanceSearchFilterOverlayComponent.rootElement);
    }

    applyButton = this.getChild('.hxp-governance-search-filter-overlay-actions .hxp-governance-search-filter-overlay-actions-apply');
    clearAllButton = this.getChild('.hxp-governance-search-filter-overlay-actions .hxp-governance-search-filter-overlay-actions-clear');
    recordNameInputLocator = this.getChild(
        '.hxp-governance-record-name-search-filter-container .hxp-governance-record-name-search-filter-input input'
    );
}
