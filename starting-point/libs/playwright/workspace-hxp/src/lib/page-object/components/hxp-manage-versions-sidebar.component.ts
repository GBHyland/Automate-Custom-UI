/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent, MatDialogContainer, MenuComponent } from '@alfresco-dbp/playwright/shared';
import { HxpEditVersionDialogComponent } from './hxp-edit-version-dialog.component';

export class HxpManageVersionsSidebarComponent extends BaseComponent {
    static rootElement = 'hxp-manage-versions-sidebar';
    matDialogContainer = new MatDialogContainer(this.page);
    matMenuComponent = new MenuComponent(this.page);

    constructor(page: Page) {
        super(page, HxpManageVersionsSidebarComponent.rootElement);
    }

    editVersionDialog = new HxpEditVersionDialogComponent(this.page);

    getAllVersion = this.getChild('.hxp-version-item');
    editVersionInfoButton = this.matMenuComponent.getButtonByNameLocator('Edit Version Info');
    downloadButton = this.matMenuComponent.getButtonByNameLocator('Download');
    shareButton = this.matMenuComponent.getButtonByNameLocator('Share');
    restoreButton = this.matMenuComponent.getElementByAutomationId('context-Restore');

    getNthVersionLocator = (index: number): Locator => this.getAllVersion.nth(index);
    getMoreActionsButtonForNthVersion = (index: number): Locator => this.getNthVersionLocator(index).locator('button', { hasText: 'more_vert' });
    getNthVersionTitle = (index: number): Locator => this.getNthVersionLocator(index).locator('.hxp-version-title');
    getNthVersionDescription = (index: number): Locator => this.getNthVersionLocator(index).locator('.hxp-version-description');

    async editVersionInfo(versionTitle: string, versionDescription: string): Promise<void> {
        await this.editVersionInfoButton.click();
        await this.editVersionDialog.versionTitleInputField.fill(versionTitle);
        await this.editVersionDialog.versionDescriptionInputField.fill(versionDescription);
        await this.editVersionDialog.saveButton.click();
    }
}
