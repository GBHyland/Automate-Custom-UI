/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpUploadProgressDialogComponent extends BaseComponent {
    static rootElement = '.idp-document-upload-progress-dialog';

    constructor(page: Page) {
        super(page, HxpIdpUploadProgressDialogComponent.rootElement);
    }

    progressCompleteIndicator = this.getElementByAutomationId('idp-document-upload-progress-dialog__complete-indicator');
}
