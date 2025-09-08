/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DatePicker } from '@alfresco-dbp/playwright/shared';

export class HxpRecordPropertiesSidebarComponent extends BaseComponent {
    static readonly rootElement = 'hxp-record-properties-sidebar';
    datePicker = new DatePicker(this.page);

    constructor(page: Page) {
        super(page, HxpRecordPropertiesSidebarComponent.rootElement);
    }

    recordTitleLocator = this.getChild('.hxp-sidebar-header .hxp-sidebar-header-title');
    recordPropertiesHeaderLocator = this.getChild('.hxp-sidebar-section-header');
    editButton = this.getChild('.hxp-sidebar-section-controls .hxp-edit-button');
    calenderIcon = this.getChild('[aria-label="Open calendar"]');
    saveButton = this.getChild('.hxp-record-save-btn-label');
    hxpPropertyLocator = this.getChild('.hxp-sidebar-properties .hxp-property');
}
