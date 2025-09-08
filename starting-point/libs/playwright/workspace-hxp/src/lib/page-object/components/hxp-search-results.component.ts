/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, DataTableComponent, materialLocators } from '@alfresco-dbp/playwright/shared';
import { HxpSearchResultsHeaderComponent } from './hxp-search-results-header.component';

export class HxpSearchResultsComponent extends BaseComponent {
    static rootElement = 'hxp-search-results';

    constructor(page: Page) {
        super(page, HxpSearchResultsComponent.rootElement);
    }

    header = new HxpSearchResultsHeaderComponent(this.page);
    table = new DataTableComponent(this.page, HxpSearchResultsComponent.rootElement);

    oldResultListItemsLocator = this.getChild(materialLocators.List.item.class);
    noResultsLocator = this.getChild('.hxp-search-no-results');

    textSearchTabLocator = this.getChild('[role="tab"]').nth(0);
    HXQLSearchTabLocator = this.getChild('[role="tab"]').nth(1);

    getResultsNumberMessage = (message: string) => this.header.resultsNumberMessageLocator.filter({ hasText: message });

    async getResultsNumberFromHeader(): Promise<number> {
        await this.waitForSkeletonLoader();
        const resultsMessage = await this.header.resultsNumberMessageLocator.textContent();
        const match = resultsMessage?.match(/(\d+) Result(?:s)? Found/);
        if (match && match[1]) {
            return Number.parseInt(match[1], 10);
        }
        throw new Error(`Results number not found in the message: "${resultsMessage}"`);
    }

    getResultTitleLocator = (message: string) => this.getChild(`${materialLocators.List.item.class} .hxp-title`, { hasText: message });
    getResultDescLocator = (message: string) => this.getChild(`${materialLocators.List.item.class} .hxp-desc`, { hasText: message });

    /**
     * Compares expected table title substrings with actual table row titles and returns any differences.
     * @param expectedTitles - Array of expected title substrings to match against actual table row titles.
     * @returns Array of strings indicating missing or unexpected titles, or empty if all match.
     */
    async getTableTitleDifference(expectedTitles: string[]): Promise<string[]> {
        const actualTitles = await this.table.getDataRowTitles();

        const missing = expectedTitles
            .filter((expected) => !actualTitles.some((actual) => actual.includes(expected)))
            .map((title) => `Missing: ${title}`);

        const unexpected = actualTitles
            .filter((actual) => !expectedTitles.some((expected) => actual.includes(expected)))
            .map((title) => `Unexpected: ${title}`);

        return [...missing, ...unexpected];
    }
}
