/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';

export class TabManagerComponent extends BaseComponent {
    private static rootElement = 'modelingsdk-tab-manager';

    constructor(page: Page) {
        super(page, TabManagerComponent.rootElement);
    }

    selectedTabAttribute = 'aria-selected';

    getCreateButtonLocator = this.getElementByAutomationId('create-button').filter({ visible: true });
    getAllTabsTitlesLocator = this.getChild('.ama-tab-title');
    getActiveTabTitleLocator = this.getChild(`[${this.selectedTabAttribute}='true']`).locator('.ama-tab-title');
    getHomeTabLocator = this.getElementByAutomationId('home-tab');

    getTabByNameLocator = (tabName: string) => this.getChild(`[role='tab']`, { hasText: tabName });
    getTitleLocator = (tabName: string) => this.getTabByNameLocator(tabName).locator('.ama-tab-title');
    getCloseButtonLocator = (tabName: string) => this.getTabByNameLocator(tabName).locator(`button`, { hasText: 'close' });
    getDirtyStateDotLocator = (tabName: string) => this.getTabByNameLocator(tabName).locator('.ama-tab-model-dirty');
    getReadOnlyStateIconLocator = (tabName: string) => this.getTabByNameLocator(tabName).locator('.ama-tab-model-readonly-icon');

    async switchToTab(tabName: string): Promise<void> {
        await this.getTitleLocator(tabName).click();
        await this.spinnerWaitForReload();
    }
}
