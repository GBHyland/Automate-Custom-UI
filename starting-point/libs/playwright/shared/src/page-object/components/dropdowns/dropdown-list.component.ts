/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { materialLocators } from '../material/material-locators';
import { timeouts } from '../../../utils/timeouts';

export class DropdownListComponent extends BaseComponent {
    constructor(page: Page, rootElement: string) {
        super(page, rootElement);
    }

    dropdownLocator = this.getChild('');
    noUserFoundInfoLocator = this.getChild(`${materialLocators.Option.class}[data-automation-id*="no-results"]`);
    firstOptionLocator = this.getChild(`[role="option"]:not([data-automation-id*="no-results"])`).first();
    getVersionDropdownList = this.getChild('.hxp-document-version-option');
    getListByRoleLocator = this.getChild('[role="listbox"]');

    getOptionLocatorByText = (optionName: string) =>
        this.getChild(`${materialLocators.Option.class}:not([data-automation-id*="no-results"]) span span`).getByText(optionName);
    getNthOptionLocator = (index: number): Locator => this.getChild(`[role="option"]:not([data-automation-id*="no-results"])`).nth(index);
    getOptionMatchingTextLocator = (optionName: string): Locator => this.getChild(`${materialLocators.Option.class} span`, { hasText: optionName });
    getOptionLocator = (optionName: string): Locator => this.getChild(`${materialLocators.Option.class} span`).getByText(optionName, { exact: true });
    isMultiple = async (): Promise<boolean> =>
        (await this.dropdownLocator.getAttribute('aria-multiselectable', { timeout: timeouts.short })) === 'true';

    getNthVersionDropdownOption = (index: any) => this.getVersionDropdownList.nth(index);
    /**
     * Method which wait until the option will be displayed - omitting the
     * "No user found with name" which is showing up before dropdown is populating
     * @param optionName option for which you would like to get
     * @returns Playwright Locator
     */
    getOptionWithWait = (optionName: string): Locator => {
        return this.getChild(`${materialLocators.Option.class}:not([data-automation-id*="no-results"]) span span`).getByText(optionName, {
            exact: true,
        });
    };

    async getOptionsList(): Promise<string[]> {
        const optionsList = [];
        for (const li of await this.getChild(`${materialLocators.Option.class} ${materialLocators.Option.text}`, { hasText: '' }).all()) {
            optionsList.push(await li.allInnerTexts());
        }

        return optionsList.flat(2).map((option) => option.trim());
    }
}
