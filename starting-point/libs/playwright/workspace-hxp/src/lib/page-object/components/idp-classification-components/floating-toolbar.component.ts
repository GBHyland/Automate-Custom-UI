/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpFloaterToolbarComponent extends BaseComponent {
    static rootElement = '#footerToolbar';

    constructor(page: Page) {
        super(page, HxpIdpFloaterToolbarComponent.rootElement);
    }

    rejectButton = this.getElementByAutomationId('idp-footer-toolbar-warning_amber');
    changeClassButton = this.getElementByAutomationId('idp-footer-toolbar-sync_alt');
    deleteButton = this.getElementByAutomationId('idp-footer-toolbar-delete');
    splitButton = this.getElementByAutomationId('idp-footer-toolbar-call_split');
    mergeButton = this.getElementByAutomationId('idp-footer-toolbar-call_merge');
}
