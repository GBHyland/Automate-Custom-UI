/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class TaskHeaderComponent extends BaseComponent {
    private static rootElement = '.app-content-header';

    constructor(page: Page, rootElement = TaskHeaderComponent.rootElement) {
        super(page, rootElement);
    }

    infoDrawerIconLocator = this.getChild('[data-automation-id="toggle-info-drawer-icon"]');
}
