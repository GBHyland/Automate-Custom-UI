/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BasePage } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';
import { ApplicationCapacity, HxpHeader, SatPlatformNavPanelComponent } from '../components';

export class StudioAdminMainPage extends BasePage {
    private static pageUrl = '';

    hxpHeader = new HxpHeader(this.page);
    satPlatformNavPanel = new SatPlatformNavPanelComponent(this.page);
    applicationCapacity = new ApplicationCapacity(this.page);

    constructor(page: Page) {
        super(page, StudioAdminMainPage.pageUrl);
    }
}
