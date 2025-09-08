/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { timeouts } from '../../../utils';

export class SnackBarComponent extends BaseComponent {
    private static rootElement = 'adf-snackbar-content';

    messageLocator = `[data-automation-id='adf-snackbar-message-content']`;
    message = this.getChild(this.messageLocator).first();

    getByMessageLocator = (message: string) => this.getChild(this.messageLocator, { hasText: message }).first();
    getCloseButtonByMessageLocator = (message: string) => this.getChild('', { hasText: message }).locator('button', { hasText: 'close' });

    constructor(page: Page, rootElement = SnackBarComponent.rootElement) {
        super(page, rootElement);
    }

    async closeSnackBar(message: string) {
        try {
            await this.getCloseButtonByMessageLocator(message).click({ timeout: timeouts.medium });
        } catch {}
    }

    async waitForSnackBarMessage() {
        await this.message.isEnabled({ timeout: timeouts.large });
    }
}
