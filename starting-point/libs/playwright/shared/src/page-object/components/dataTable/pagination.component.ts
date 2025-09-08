/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { MenuComponent } from '..';
import { BaseComponent } from '../base.component';
import { Page } from '@playwright/test';

export enum PaginationActionsType {
    PageSizeSelector = 'Page size selector',
    CurrentPageSelector = 'Current page selector',
    NextPageSelector = 'Next page button',
}

export class PaginationComponent extends BaseComponent {
    private static rootElement = 'adf-pagination';

    constructor(page: Page) {
        super(page, PaginationComponent.rootElement);
    }

    private itemsPerPageMenu = new MenuComponent(this.page);

    currentPageLocator = this.getChild('.adf-pagination__current-page');
    totalPageLocator = this.getChild('.adf-pagination__total-pages');
    getArrowLocatorFor = (action: PaginationActionsType) => this.getChild(`[aria-label="${action}"]`);
    paginationRangeLocator = this.getChild('.adf-pagination__range');

    async setItemsPerPage(amount: number): Promise<void> {
        await this.getArrowLocatorFor(PaginationActionsType.PageSizeSelector).click();
        await this.itemsPerPageMenu.getButtonByExactText(amount.toString()).click();
        await this.spinnerWaitForReload();
    }

    async navigateToPage(pageNumber: number): Promise<void> {
        await this.getArrowLocatorFor(PaginationActionsType.CurrentPageSelector).click();
        await this.itemsPerPageMenu.getButtonByExactText(pageNumber.toString()).click();
        await this.spinnerWaitForReload();
    }

    async getNumberOfRowsInTable(): Promise<null | number> {
        const pageRange = await this.paginationRangeLocator.innerText();
        const rowCount = pageRange.split(' ');
        return parseInt(rowCount[rowCount.length - 1], 10);
    }
}
