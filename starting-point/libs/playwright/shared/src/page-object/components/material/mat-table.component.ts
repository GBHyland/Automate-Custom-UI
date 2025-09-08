/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { materialLocators, MatPaginatorComponent } from '.';
import { BaseComponent } from '../base.component';
import { Locator, Page } from '@playwright/test';

export interface SortOptionsURL {
    maxItems?: number;
    skipCount?: number;
    sort?: string;
    order?: 'asc' | 'desc';
}

export class MatTableComponent extends BaseComponent {
    static childRootElement: string;

    pagination = new MatPaginatorComponent(this.page);

    constructor(page: Page, childRootElement?: string) {
        super(page, `${childRootElement ? childRootElement : ''} ${materialLocators.Table.class} `);
    }

    getFirstRowLocator = this.getChild(`${materialLocators.Table.row.class} >> nth=0`);
    getRowsLocator = this.getChild(materialLocators.Table.row.class);
    getAllRowsOfColumnLocator = (columnName: string) => this.getChild(`[data-column-name='${columnName}']`);
    getRowByNameLocator = (name: string) => this.getChild(materialLocators.Table.row.class, { hasText: name });
    /**
     * @param matColumn is a part of a class name to identify specific column e.g
     * class="mat-cell cdk-cell cdk-column-createdBy mat-column-createdBy ng-star-inserted"
     */
    getCellOfRowLocator = (name: string, matColumn: string) => this.getRowByNameLocator(name).locator(materialLocators.Table.column(matColumn));
    getRowByCellValueLocator = (matColumn: string, value: string) => {
        return this.getChild(materialLocators.Table.row.class, {
            has: this.page.locator(materialLocators.Table.column(matColumn), { hasText: value }),
        });
    };
    getMoreOptionLocator = (row: string | Locator) => {
        const rowLocator = typeof row === 'string' ? this.getRowByNameLocator(row) : row;
        return rowLocator.locator(materialLocators.Icon.root, { hasText: 'more_vert' });
    };
    getColumnHeaderByNameLocator = (columnName: string) =>
        this.getChild(`[role='columnheader']`, { hasText: new RegExp(`^\\s*${columnName}\\s*$`, 'g') });

    getSortingUrl(options?: Partial<SortOptionsURL>): string {
        const sortOptions: SortOptionsURL = {
            maxItems: 100,
            skipCount: 0,
            sort: 'name',
            order: 'desc',
            ...options,
        };
        return `?maxItems=${sortOptions.maxItems}&skipCount=${sortOptions.skipCount}&sort=${sortOptions.sort},${sortOptions.order}`;
    }

    getSearchUrl = (name: string = ''): string => `?name=${name}`;

    async sortColumn(columnName: string, sort: 'ascending' | 'descending'): Promise<void> {
        const columnHeader = this.getColumnHeaderByNameLocator(columnName);
        let currentSortOrder = await columnHeader.getAttribute('aria-sort');

        if (sort !== currentSortOrder) {
            await columnHeader.locator(`[role='button']`).click();
            await this.spinnerWaitForReload();
            currentSortOrder = await columnHeader.getAttribute('aria-sort');
        }

        if (sort !== currentSortOrder) {
            await columnHeader.locator(`[role='button']`).click();
            await this.spinnerWaitForReload();
        }
    }

    async goThroughPagesLookingForRowWithName(name: string): Promise<void> {
        const nextPageButton = this.pagination.getPaginationRangeAction('next');
        await this.pagination.navigateToFirstPage();

        while ((await this.getRowByNameLocator(name).isVisible()) === false && (await nextPageButton.isEnabled())) {
            await nextPageButton.click();
            await this.spinnerWaitForReload();
        }
    }
}
