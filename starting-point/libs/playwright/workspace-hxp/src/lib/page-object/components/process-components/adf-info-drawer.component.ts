/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { Page } from '@playwright/test';

export class AdfInfoDrawer extends BaseComponent {
    private static rootElement = 'adf-info-drawer';

    constructor(page: Page, rootElement = AdfInfoDrawer.rootElement) {
        super(page, rootElement);
    }

    getTabByTitleLocator = (title: string) => this.getChild('[role="tablist"] [role="tab"]', { hasText: title });
    getInputByTitleLocator = (title: string) => this.getChild(`input[title="${title}"]`);

    dueDateValueLocator = this.getElementByAutomationId('card-datetime-value-dueDate');
}
