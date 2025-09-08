/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class FieldVerificationRootContainer extends BaseComponent {
    static rootElement = 'idp-field-verification-root';

    constructor(page: Page) {
        super(page, FieldVerificationRootContainer.rootElement);
    }

    submitButton = this.getElementByAutomationId('idp-field-submit-button');
    saveButton = this.getElementByAutomationId('idp-field-save-button');
    progressSpinner = this.getElementByAutomationId('idp-field-progress-spinner');
}
