/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { MatDialogContainer } from '@alfresco-dbp/playwright/shared';

export class StartProcessDialog extends MatDialogContainer {
    private static rootElement = 'apa-start-process-dialog';

    constructor(page: Page) {
        super(page, StartProcessDialog.rootElement);
    }

    async selectProcess(processName: string): Promise<void> {
        await this.getElementByAutomationId('start-process-dialog-search-input').fill(processName);
        await this.getElementByAutomationId(processName).click();
    }
}
