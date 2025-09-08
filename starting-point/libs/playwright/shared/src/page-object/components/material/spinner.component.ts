/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { timeouts } from '../../../utils';
import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { materialLocators } from '.';

export class SpinnerComponent extends BaseComponent {
    constructor(page: Page, rootElement = materialLocators.ProgressSpinner.root) {
        super(page, rootElement);
    }

    async waitForReload(): Promise<void> {
        try {
            await this.getChild('').waitFor({ state: 'attached', timeout: timeouts.short });
            await this.getChild('').waitFor({ state: 'detached', timeout: timeouts.medium });
        } catch {
            /* do nothing */
        }
    }
}
