/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { PreferenceMock } from '../../../mocks';
import { BaseComponent } from '../base.component';
import { PaginationActionsType, PaginationComponent } from './pagination.component';
import { materialLocators, MenuComponent } from '..';

type SearchOptions = 'name' | 'ariaLabel' | 'automationId';
type ExpectedCheckboxState = 'checked' | 'unchecked';

export class DataTableComponent extends BaseComponent {
    static rootElement = 'adf-datatable';

    contextMenuActions = new MenuComponent(this.page);
    preferenceMock = new PreferenceMock(this.page);
    pagination = new PaginationComponent(this.page);

    constructor(page: Page, rootElement = DataTableComponent.rootElement) {
        super(page, rootElement);
    }

    getProjectNameColumnHeaderLocator = this.getElementByAutomationId('auto_id_name');
    getEmptyFolderLocator = this.getChild('.adf-empty-folder');
    getEmptyContentTitleLocator = this.getChild('adf-empty-content .adf-empty-content__title');
    getEmptyContentSubTitleLocator = this.getChild('adf-empty-content .adf-empty-content__subtitle');
    getColumnHeaderByRoleLocator = this.getChild('[role="columnheader"]');
    getCellByRoleLocator = this.getChild('[role="gridcell"]');
    getSelectColumnsButtonLocator = this.getElementByAutomationId('adf-datatable-main-menu-button');

    /** Locator for row (or rows) */
    getRowLocator = this.getChild(`adf-datatable-row`);
    contentRowLocator = this.getChild(`.adf-datatable-body adf-datatable-row`);

    getCellByDataAutomationId = (appName: string) => this.getChild(`[data-automation-id="${appName}" button`, { hasText: 'more_vert' });

    /**
     * Method used in cases where we want to check that some record is visible in the datatable. It will consider only cell
     * @returns {Locator} reference to cell element which contains text.
     */
    getCellByName = (name: string): Locator => this.getChild(`adf-datatable-cell`, { hasText: name });
    getCellsByColumnName = (column: 'Title' | 'Size' | 'Created' | 'Last Modified' | 'Permission'): Locator => {
        return this.getChild(`.adf-datatable-body [aria-label="${column}"] .adf-cell-value`);
    };

    /**
     * Method used in cases where we want to check that some record is visible in the datatable. It will consider whole row, fetched by name
     */
    getRowByName = (name: string | number): Locator => this.getChild(`adf-datatable-row`, { hasText: name.toString() });
    getRowByNumber = (number: number): Locator => this.getChild(`adf-datatable-row`).nth(number);

    /**
     * Method to collect all titles from the datatable rows.
     * Removes the first element from the array, which is the header.
     * @returns the array of found titles.
     */
    async getDataRowTitles(): Promise<string[]> {
        await this.waitForSkeletonLoader();
        const titleLocators = this.getChild('adf-datatable-row [aria-label="Title"]');
        await titleLocators.first().waitFor();
        const titles = await titleLocators.allInnerTexts();
        return titles.slice(1);
    }

    /**
     * Method used in cases where we want to check that some record is visible in the datatable. It will consider whole row, fetched by aria-label attribute
     */
    getRowByAriaLabel = (ariaLabel: string | number): Locator => this.getChild(`adf-datatable-row[aria-label="${ariaLabel}"]`);

    getActionButtonByAutomationId = (appName: string | number): Locator =>
        this.getChild(`adf-datatable-row [data-automation-id="${appName}"] ${materialLocators.Icon.root}`, { hasText: 'more_vert' });

    /**
     * Method used in cases where we want to get the row by name or aria-label attribute
     * @returns {Locator} reference to cell element which contains text.
     */
    getRowBy(searchValue: string | number, searchBy: SearchOptions): Locator {
        if (searchBy === 'name') {
            return this.getRowByName(searchValue);
        }
        if (searchBy === 'ariaLabel') {
            return this.getRowByAriaLabel(searchValue);
        }
        return undefined;
    }

    /**
     * Method used in cases where we want to get a selected row by name
     * @returns {Locator} reference to cell element which contains text.
     */
    getSelectedRowByName = (name: string | number): Locator => this.getChild(`adf-datatable-row[aria-selected="true"]`, { hasText: name.toString() });

    /**
     * Method used in cases where we want to check that some record is visible in the datatable.
     * But we want to check it by column header title and value of this column.
     * @returns {Locator} reference to cell element which contains text.
     */
    getRowByColumnTitleAndItsCellValue = (columnTitle: string, cellValue: string | number | boolean): Locator =>
        this.page.locator(`//div[contains(@title, '${columnTitle}')]//span[contains(text(), '${cellValue}')]/ancestor::adf-datatable-row`);

    /**
     * Method used in cases where user have possibility to navigate "inside" the element (it's clickable and has link attribute).
     * Perform action .click() to navigate inside it
     * @returns {Locator} reference to cell element which contains link.
     */
    getCellLinkByName = (name: string): Locator => this.getChild('.adf-datatable-cell-value[role="link"]', { hasText: name });

    /**
     * Method used in cases where we want to get all of items in datatable by columnName
     * @returns {Locator} reference to cell or cells element(s)
     */
    getAllCellsByColumnName = (columnName: string): Locator => this.getChild(`.adf-datatable-body adf-datatable-row [title="${columnName}"]`);

    /**
     * Method used in cases where we want to get the button (hamburger menu) for row element
     * @returns {Locator} reference to menu placed in row localized by the name, aria-label or automationId attribute
     */
    getActionsButton(searchValue: string | number, searchBy: SearchOptions = 'name'): Locator {
        if (searchBy === 'name' || searchBy === 'ariaLabel') {
            return this.getRowBy(searchValue, searchBy).locator(materialLocators.Icon.root).getByText('more_vert');
        }
        if (searchBy === 'automationId') {
            return this.getActionButtonByAutomationId(searchValue);
        }
        return undefined;
    }

    /**
     * Method used in cases where we want to get the edit button and there is no hamburger menu
     * @returns {Locator} reference to edit button placed in row localized by the name
     */
    getEditButtonByName = (name: string): Locator => this.getRowByName(name).locator('button#editButton');

    /**
     * Method used in cases where we want to get the button and there is no hamburger menu
     * @returns {Locator} reference to button placed in row localized by the name
     */
    getButtonByNameForSpecificRow = (elementTitleInRow: string, buttonTitle: string): Locator =>
        this.getRowByName(elementTitleInRow).locator('button', { hasText: buttonTitle });

    /**
     * Method used in cases where you want to get some specific cell (by column name) for row which contains some name/title/etc.
     * @returns {Locator} reference to cell element
     */
    getCellByColumnNameAndRowItem = (item: string | number, columnName: string): Locator =>
        this.getRowByName(item).locator(`[title="${columnName}"]`);

    /**
     * Method used in cases where we want to get the checkbox for row element
     * @param item file/folder name
     * @returns {Locator} reference to checkbox placed in row localized by the name
     */
    getCheckboxForElement = (item: string): Locator => this.getRowByName(item).locator(materialLocators.Checkbox.root);

    /**
     * For content application we have possibility to set up the role for a user request
     * @param user username
     * @returns {Locator}
     */
    getButtonRoleExpandMenuLocatorForUser = (user: string): Locator => this.getRowByName(user).locator('adw-role-selector');
    getColumnHeaderByTitleLocator = (headerTitle: string): Locator => this.getChild('[role="columnheader"]', { hasText: headerTitle });
    getColumnHeaderDraggableAreaLocator = (headerLocator: Locator) =>
        headerLocator.locator(`adf-icon[data-automation-id*='adf-datatable-cell-header-drag-icon']`);
    getColumnResizeAreaLocator = (headerLocator: Locator) => headerLocator.locator('.adf-datatable__resize-handle');
    getRowHeight = async (rowLocator: Locator) => (await rowLocator.boundingBox()).height;
    getDataTableProperties = async () => ({
        rowCount: (await this.getRowLocator.all()).length,
        columnCount: (await this.getColumnHeaderByRoleLocator.all()).length,
    });

    getContentRowCount = async (): Promise<number> => {
        await this.contentRowLocator.first().waitFor();
        return (await this.contentRowLocator.all()).length;
    };

    async sortBy(columnTitle: string, order: 'Ascending' | 'Descending'): Promise<void> {
        const columnHeaderLocator = this.getColumnHeaderByTitleLocator(columnTitle);
        await columnHeaderLocator.click();
        await this.spinnerWaitForReload();

        const sortAttribute = await columnHeaderLocator.getAttribute('aria-sort');
        if (!(sortAttribute === order)) {
            await columnHeaderLocator.click();
        }

        await this.spinnerWaitForReload();
    }

    /**
     * Click action from the expandable kebab menu for the element in datatable
     * @param searchValue title of the record you would like to proceed
     * @param searchBy get the row locator by name or aria-label attribute
     * @param action provide button title for the action
     * @param subAction if the action is in sub menu, then provide it here
     */
    async performActionForElement(searchValue: string, action: string, searchBy: SearchOptions = 'name', subAction?: string): Promise<void> {
        await this.getActionsButton(searchValue, searchBy).click();
        await this.contextMenuActions.getMenuItemByText(action).click();
        if (subAction) {
            await this.contextMenuActions.getMenuItemByText(subAction).click();
        }
    }

    /**
     * This method is used when we want to perform some action from header menu
     * @param actions provide column header names which you want to check or uncheck
     * @param expectedState whether to check ('checked') or uncheck ('unchecked') the checkboxes. Default is 'checked'.
     */
    async performHeaderMenuAction(actions: string[], expectedState: ExpectedCheckboxState = 'checked'): Promise<void> {
        await this.getElementByAutomationId('adf-datatable-main-menu-button').click();

        for (const action of actions) {
            const checkbox = this.contextMenuActions.getCheckboxByText(action);
            const isChecked = await checkbox.isChecked();
            const shouldBeChecked = expectedState === 'checked';

            if (isChecked !== shouldBeChecked) {
                await checkbox.click();
            }
        }
        await this.contextMenuActions.getMenuItemByText('Apply').click();
    }

    async performActionForFirstRow(action: string): Promise<void> {
        await this.getChild(`.adf-datatable-body adf-datatable-row ${materialLocators.Icon.root}`).first().click();
        await this.contextMenuActions.getMenuItemByText(action).click();
    }

    /**
     * This method is used when we want to perform right mouse click on the dataTable row and perform some action
     * @param name of the data table element with which we want to click
     * @param action provide which action you want to perform
     * @param columnTitle provide column title if you want to narrow locator name search
     */
    async performRowActionFromRightClickMenu(name: string | number, action: string, columnTitle?: string): Promise<void> {
        if (columnTitle) {
            await this.goThroughPagesLookingForRowWithName(name, columnTitle);
            await this.performActionFromRightClickMenu(action, this.getRowByColumnTitleAndItsCellValue(columnTitle, name));
        } else {
            await this.goThroughPagesLookingForRowWithName(name);
            await this.performActionFromRightClickMenu(action, this.getRowByName(name));
        }
    }

    async getMatMenuOptionsLocator(name: string | number): Promise<Locator> {
        await this.getRowByName(name).click({ button: 'right' });
        return this.contextMenuActions.getMenuItemsLocator();
    }

    async goThroughPagesLookingForRowWithName(name: string | number, columnTitle?: string): Promise<void> {
        const searchElement = columnTitle ? this.getRowByColumnTitleAndItsCellValue(columnTitle, name) : this.getRowByName(name);
        await this.goThroughPagesLookingForElement(searchElement);
    }

    async resizeColumn(columnNameToResize: string, pixels: number, direction: string): Promise<void> {
        const columnToResize = this.getColumnHeaderByTitleLocator(columnNameToResize);

        await Promise.all([
            this.page.waitForRequest(this.preferenceMock.columnsWidthsEndpoint),
            this.mouseDragAndDropByPixels(this.getColumnResizeAreaLocator(columnToResize), 'middle', pixels, direction),
        ]);
    }

    async reorderColumn(columnNameToDrag: string, columnNameToDragOver: string): Promise<void> {
        const columnToMove = this.getColumnHeaderByTitleLocator(columnNameToDrag);
        const columnToMoveOver = this.getColumnHeaderByTitleLocator(columnNameToDragOver);
        await columnToMove.hover();

        await Promise.all([
            this.page.waitForRequest(this.preferenceMock.columnsOrderEndpoint),
            this.mouseDragAndDrop(this.getColumnHeaderDraggableAreaLocator(columnToMove), columnToMoveOver),
        ]);
    }

    async getColumnWidth(columnName: string): Promise<number> {
        const columnBounding = await this.getColumnHeaderByTitleLocator(columnName).boundingBox();
        return columnBounding.width;
    }

    async getColumnTitlesList() {
        const headersList = [];
        for (const li of await this.getColumnHeaderByRoleLocator.all()) {
            headersList.push(await li.allInnerTexts());
        }
        return headersList.flat().flat(2);
    }

    async selectMultipleRowsByName(rowNames: string[]): Promise<void> {
        await this.page.keyboard.down('Meta');
        for (const rowName of rowNames) {
            await this.getRowByName(rowName).click();
            await this.getSelectedRowByName(rowName).waitFor();
        }
        await this.page.keyboard.up('Meta');
    }

    async getMinimumRowHight(): Promise<number> {
        const rowHeightsList: number[] = [];
        for (const rowLocator of await this.getRowLocator.all()) {
            rowHeightsList.push(await this.getRowHeight(rowLocator));
        }
        return Math.min(...rowHeightsList);
    }

    async getMinimumColumnWidth(): Promise<number> {
        const columnWidthList: number[] = [];
        for (const title of await this.getColumnTitlesList()) {
            columnWidthList.push(await this.getColumnWidth(title));
        }
        return Math.min(...columnWidthList);
    }

    async getAllCellsLocators(): Promise<Locator[]> {
        const headerLocators = await this.getColumnHeaderByRoleLocator.all();
        const cellLocators = await this.getCellByRoleLocator.all();
        return headerLocators.concat(cellLocators);
    }

    async getCellValuesListByRowName(rowName: string): Promise<string[]> {
        const cellValuesList = [];
        for (const cell of await this.getRowByName(rowName).getByRole('gridcell').all()) {
            cellValuesList.push((await cell.innerText()).replaceAll('\u00A0', ' '));
        }
        return cellValuesList;
    }

    private async performActionFromRightClickMenu(action: string, clickLocator: Locator): Promise<void> {
        await clickLocator.click({ button: 'right' });
        await this.contextMenuActions.getMenuItemByText(action).click();
        await this.spinnerWaitForReload();
    }

    private async goThroughPagesLookingForElement(searchElement: Locator): Promise<void> {
        await this.spinnerWaitForReload();
        if (await searchElement.isVisible()) {
            return undefined;
        }

        if ((await this.pagination.currentPageLocator.textContent()) !== ' Page 1 ') {
            await this.pagination.navigateToPage(1);
        }

        const maxPages = (await this.pagination.totalPageLocator.textContent()).match(/\d/)[0];
        for (let page = 1; page <= Number(maxPages); page++) {
            if (await searchElement.isVisible()) {
                break;
            }
            await this.pagination.getArrowLocatorFor(PaginationActionsType.NextPageSelector).isEnabled();
            await this.pagination.getArrowLocatorFor(PaginationActionsType.NextPageSelector).click();
            await this.spinnerWaitForReload();
        }
    }
}
