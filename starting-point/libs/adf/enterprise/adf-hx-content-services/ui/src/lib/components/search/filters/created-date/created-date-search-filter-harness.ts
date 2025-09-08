/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MatListOptionHarness } from '@angular/material/list/testing';
import { SearchFilterHarness } from '../search-filter-container/search-filter-container-harness';
import { MatMenuItemHarness } from '@angular/material/menu/testing';
import { CalendarCellHarnessFilters, MatCalendarHarness, MatDatepickerToggleHarness } from '@angular/material/datepicker/testing';

export class CreatedDateSearchFilterHarness extends SearchFilterHarness {
    getDefaultOptions = this.documentRootLocatorFactory().locatorForAll(MatListOptionHarness.with({ selector: '.hxp-created-date-filter-option' }));

    getCustomDateButton = this.documentRootLocatorFactory().locatorFor(
        MatMenuItemHarness.with({ selector: '.hxp-created-date-filter-custom-date-button' })
    );

    getCustomDateContainer = this.documentRootLocatorFactory().locatorForOptional('.hxp-custom-created-date');

    getAfterDateToggle = this.documentRootLocatorFactory().locatorForOptional(
        MatDatepickerToggleHarness.with({ selector: '[data-automation-id="hxp-after-created-date-toggle"]' })
    );

    getBeforeDateToggle = this.documentRootLocatorFactory().locatorForOptional(
        MatDatepickerToggleHarness.with({ selector: '[data-automation-id="hxp-before-created-date-toggle"]' })
    );

    getCalendar = this.documentRootLocatorFactory().locatorForOptional(MatCalendarHarness);

    async openAfterDateCalendar() {
        const afterDateToggle = await this.getAfterDateToggle();
        return afterDateToggle?.openCalendar();
    }

    async openBeforeDateCalendar() {
        const beforeDateToggle = await this.getBeforeDateToggle();
        return beforeDateToggle?.openCalendar();
    }

    async selectCalendarCell(options: CalendarCellHarnessFilters) {
        const calendar = await this.getCalendar();
        return calendar?.selectCell(options);
    }
}
