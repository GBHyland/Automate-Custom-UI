/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ComponentHarness } from '@angular/cdk/testing';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatIconHarness } from '@angular/material/icon/testing';

export class SearchFilterHarness extends ComponentHarness {
    static hostSelector = '.hxp-governance-search-filter';

    getLabel = this.locatorForOptional('.hxp-governance-search-filter-chip-label');

    getExpandIcon = this.locatorForOptional(MatIconHarness.with({ selector: '.hxp-governance-search-filter-chip-icon' }));

    getBadge = this.locatorForOptional('.hxp-governance-search-filter-chip-badge');

    getApplyButton = this.documentRootLocatorFactory().locatorForOptional(
        MatButtonHarness.with({ selector: '.hxp-governance-search-filter-overlay-actions-apply' })
    );

    getClearButton = this.documentRootLocatorFactory().locatorForOptional(
        MatButtonHarness.with({ selector: '.hxp-governance-search-filter-overlay-actions-clear' })
    );

    getOverlayBackdrop = this.documentRootLocatorFactory().locatorForOptional('.cdk-overlay-backdrop');

    protected getChip = this.locatorForOptional('.hxp-governance-search-filter-chip');

    protected getOverlayContainer = this.documentRootLocatorFactory().locatorForOptional('.hxp-governance-search-filter-overlay');

    async isOpen() {
        return !!(await this.getOverlayContainer());
    }

    async open() {
        const chip = await this.getChip();
        return chip ? chip.click() : undefined;
    }
}
