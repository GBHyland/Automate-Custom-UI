/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { materialLocators } from '.';

export type Languages = 'en' | 'fr' | 'de' | 'it' | 'es' | 'pl' | 'pt';

export class MenuComponent extends BaseComponent {
    constructor(page: Page, rootElement = materialLocators.Menu.class) {
        super(page, rootElement);
    }

    getMoveButtonLocator = this.getChild('.hxp-move-button');
    getMenuItemTextLocator = this.getChild('[data-automation-id="menu-item-title"]');
    getViewDetailsButtonLocator = this.getElementByAutomationId('context-View Details');
    getMenuItemByIndexLocator = (number: number) => this.getChild(`[role='menuitem']`).nth(number);
    getMenuItemsLocator = (locatorType = 'button') => this.getChild(`${locatorType} span span`);
    getMenuOptionButtonByText = (text: string) => this.getChild(`button ${materialLocators.Option.text}`, { hasText: text });
    getCheckboxByText = (text: string) => this.getChild(materialLocators.Checkbox.root).getByText(text, { exact: true });
    getMenuItemByText = (text: string) => this.getChild(`[role='menuitem']`, { hasText: text });
    getMenuItemByTextExact = (text: string) =>
        this.getChild(`[role='menuitem']`, { hasText: new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) });
    getLanguageMenu = this.getChild('[data-automation-id="hxp-user-language-menu"]');
    getLanguageMenuItem = (langValue: any) => this.getChild(`[lang='${langValue}']`);
    getOptionByText = (text: string) => this.getChild(`[role='option']`, { hasText: text });

    async setHierarchicalSelectorOption(option: string, menuPath: string[]): Promise<void> {
        for (const menuOption of menuPath) {
            await this.getMenuItemByText(menuOption).hover();
        }
        await this.getMenuItemByText(option).click();
    }

    async getHierarchicalSelectorOptions(menuPath: string[]): Promise<string[]> {
        for (const menuOption of menuPath) {
            await this.getMenuItemByText(menuOption).hover();
        }
        return this.getMenuItemsLocator().allInnerTexts();
    }
}
