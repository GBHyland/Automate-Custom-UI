/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpConfirmDialogComponent extends BaseComponent {
    static rootElement = '.idp-confirmation-dialog';

    constructor(page: Page) {
        super(page, HxpIdpConfirmDialogComponent.rootElement);
    }

    confirmButton = this.getElementByAutomationId('idp-confirmation-dialog__confirm-button');
    cancelButton = this.getElementByAutomationId('idp-confirmation-dialog__cancel-button');
}
