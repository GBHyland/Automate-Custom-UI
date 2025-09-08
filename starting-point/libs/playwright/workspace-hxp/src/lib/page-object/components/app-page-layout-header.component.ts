/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';
export class AppPageLayoutHeaderComponent extends BaseComponent {
    static rootElement = '.app-page-layout-header';

    constructor(page: Page) {
        super(page, AppPageLayoutHeaderComponent.rootElement);
    }

    startProcessButton = this.getElementByAutomationId('hxp-main-action-button');
    refreshButton = this.getElementByAutomationId('app-refresh-action-button');
    refreshButtonProcessesRunning = this.getElementByAutomationId('app-refresh-action-button-processes');
}
