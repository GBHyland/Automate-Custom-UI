/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, Languages, MenuComponent } from '.';
export class AdfLayoutHeaderComponent extends BaseComponent {
    static rootElement = '.adf-layout-header';

    matMenu = new MenuComponent(this.page);

    constructor(page: Page) {
        super(page, AdfLayoutHeaderComponent.rootElement);
    }

    appTitleLocator = this.getChild('.adf-app-title');
    appLogoLocator = this.getChild('.hxp-sat-header-logo');
    moreActionsMenuButton = this.getChild('').getByRole('button').filter({ hasText: 'more_vert' });
    userInfoLocator = this.getChild('.adf-userinfo-name');
    getUserMenuLanguageOptionLocator = this.matMenu.getElementByAutomationId(`hxp-user-language-menu`);

    async switchLanguageTo(language: Languages): Promise<void> {
        await this.moreActionsMenuButton.click();
        await this.getUserMenuLanguageOptionLocator.hover();
        await this.matMenu.getLanguageMenuItem(`${language}`).click();
    }
}
