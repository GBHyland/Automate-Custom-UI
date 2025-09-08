/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { HxpIdpPageListItemComponent } from './page-list-item.component';

export class HxpIdpDocumentListItemComponent extends BaseComponent {
    constructor(page: Page, index: number) {
        const rootElement = `[data-automation-id=idp-list-item-document__${index}]`;
        super(page, rootElement);
    }

    getPageComponent(index: number) {
        return new HxpIdpPageListItemComponent(this.page, index);
    }

    getPageCount() {
        return this.getElementByAutomationId('idp-page-name').count();
    }
}
