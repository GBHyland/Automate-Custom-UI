/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpChangeClassDialog extends BaseComponent {
    static rootElement = '.idp-screens-root-container'; // '#mat-mdc-dialog-6';

    constructor(page: Page) {
        super(page, HxpIdpChangeClassDialog.rootElement);
    }

    submitChangeButton = this.getElementByAutomationId('idp-change-class-button');
    classSearchField = this.getElementByAutomationId('idp-change-class-search');
    payslipClass = this.getElementByAutomationId('idp-dialog-list-item-2---payslip');
    invoiceClass = this.getElementByAutomationId('idp-dialog-list-item-3---invoice');
}
