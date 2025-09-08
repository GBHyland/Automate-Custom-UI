/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class AdfToolbarComponent extends BaseComponent {
    static rootElement = '.adf-toolbar';

    constructor(page: Page) {
        super(page, AdfToolbarComponent.rootElement);
    }

    moreActionsMenuButton = this.getChild('.hxp-more-action-button');

    downloadButton = this.page.getByRole('button').filter({ hasText: 'download' });

    async downloadFileFromToolbar(): Promise<null | string> {
        const [download] = await Promise.all([this.page.waitForEvent('download'), this.downloadButton.click()]);
        return download.path();
    }
}
