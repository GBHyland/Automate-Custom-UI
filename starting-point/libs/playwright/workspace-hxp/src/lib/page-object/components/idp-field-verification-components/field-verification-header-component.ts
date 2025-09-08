/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpFieldVerificationHeaderComponent extends BaseComponent {
    static rootElement = '.idp-header';

    constructor(page: Page) {
        super(page, HxpIdpFieldVerificationHeaderComponent.rootElement);
    }
    contentType = this.getElementByAutomationId('header-extraction.verification.task_header.content_type');
    goBack = this.getElementByAutomationId('idp-go-back-button');
    issueCount = this.getElementByAutomationId('idp-issue-count');
    issueCountResolved = this.getElementByAutomationId('idp-issue-count-resolved');
    taskName = this.getElementByAutomationId('header-extraction.verification.task_header.task_name');
    totalPages = this.getElementByAutomationId('header-extraction.verification.task_header.total_pages');
}
