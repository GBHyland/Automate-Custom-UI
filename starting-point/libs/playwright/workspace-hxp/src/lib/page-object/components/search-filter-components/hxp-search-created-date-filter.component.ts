/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { HxpSearchFilterBaseComponent } from './hxp-search-filter.base.component';

export class HxpSearchCreatedDateFilterComponent extends HxpSearchFilterBaseComponent {
    static rootElement = '.hxp-created-date-filter-container';

    constructor(page: Page) {
        super(page, HxpSearchCreatedDateFilterComponent.rootElement);
    }

    customDateButton = this.getChild('.hxp-created-date-filter-custom-date-button');

    afterDateToggle = this.getChild('[data-automation-id="hxp-after-created-date-toggle"]');
    beforeDateToggle = this.getChild('[data-automation-id="hxp-before-created-date-toggle"]');

    afterDatePickerInput = this.getChild('#hxp-after-created-date-picker-input');
    beforeDatePickerInput = this.getChild('#hxp-before-created-date-picker-input');

    getQuickFilterButton = (option: '7_DAYS' | '30_DAYS' | '6_MONTHS' | 'YEAR') => {
        return this.getChild(`#LAST_${option}`);
    };
}
