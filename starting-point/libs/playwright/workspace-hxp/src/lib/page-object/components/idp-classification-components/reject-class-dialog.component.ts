/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpRejectClassDialog extends BaseComponent {
    static readonly rootElement = '.idp-report-issue-dialog';

    constructor(page: Page) {
        super(page, HxpIdpRejectClassDialog.rootElement);
    }

    cancelButton = this.getElementByAutomationId('idp-reject-dialog__cancel-button');
    submitChangeButton = this.getElementByAutomationId('idp-reject-dialog__save-button');
    classSearchField = this.getElementByAutomationId('idp-reject-reason-search');
    fadedRejectReason = this.getElementByAutomationId('idp-dialog-list-item-1---faded');
}
