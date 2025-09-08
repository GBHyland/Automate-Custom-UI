/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/playwright/shared';

export class HxpContextMenuComponent extends BaseComponent {
    static rootElement = '.hxp-context-menu';

    constructor(page: Page) {
        super(page, HxpContextMenuComponent.rootElement);
    }

    async getAllActionNames(): Promise<string[]> {
        return this.getChild(`button ${materialLocators.Menu.text}`).allInnerTexts();
    }
    getMenuByName = (name: string) => this.getChild(`[role="menuitem"]`).filter({ hasText: name.toLowerCase() });
}
