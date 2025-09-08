/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpRejectFieldDialog extends BaseComponent {
    static rootElement = '.cdk-overlay-pane';

    constructor(page: Page) {
        super(page, HxpIdpRejectFieldDialog.rootElement);
    }

    cancelRejectButton = this.getElementByAutomationId('idp-reject-dialog__cancel-button');
    classSearchField = this.getElementByAutomationId('idp-reject-reason-search');
    fadedRejectReason = this.getElementByAutomationId('idp-dialog-list-item-1---faded');
    missingPageRejectReason = this.getElementByAutomationId('idp-dialog-list-item-2---missing-page');
    rejectReasonNote = this.getElementByAutomationId('idp-reject-dialog__input__reject-note');
    submitChangeButton = this.getElementByAutomationId('idp-reject-dialog__save-button');
}
