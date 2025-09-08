/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class StartProcessFooterComponent extends BaseComponent {
    private static rootElement = '.adf-start-process-cloud-actions';

    constructor(page: Page) {
        super(page, StartProcessFooterComponent.rootElement);
    }

    startProcessButton = this.getElementByAutomationId('btn-start');
    cancelProcessButton = this.getChild('#cancel_process');
}
