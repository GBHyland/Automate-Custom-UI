/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page, Locator, expect } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpIdpMetadataPanelComponent extends BaseComponent {
    static readonly rootElement: string = '.idp-metadata-panel';

    readonly undoButton: Locator;
    readonly redoButton: Locator;
    readonly rejectButton: Locator;

    constructor(page: Page) {
        super(page, HxpIdpMetadataPanelComponent.rootElement);
        this.undoButton = this.getElementByAutomationId('idp-field-undo-button');
        this.redoButton = this.getElementByAutomationId('idp-field-redo-button');
        this.rejectButton = this.getElementByAutomationId('idp-field-reject-button');
    }
    async insertRowBelow(): Promise<void> {
        await this.page.getByRole('cell', { name: '1' }).click({ button: 'right' });
        await this.page.getByRole('menuitem', { name: 'Insert row below' }).click();
    }
    async insertRowAbove(): Promise<void> {
        await this.page.getByRole('cell', { name: '1' }).click({ button: 'right' });
        await this.page.getByRole('menuitem', { name: 'Insert row above' }).click();
    }
    async clearRow(cellText: string): Promise<void> {
        await this.page.getByRole('cell', { name: cellText }).click({ button: 'left' });
        await this.page.getByRole('cell', { name: cellText }).click({ button: 'right' });
        await this.page.getByRole('menuitem', { name: 'Clear this row' }).click();
    }
    async deleteRow(cellText: string): Promise<void> {
        await this.page.getByRole('cell', { name: cellText }).click({ button: 'left' });
        await this.page.getByRole('cell', { name: cellText }).click({ button: 'right' });
        await this.page.getByRole('menuitem', { name: 'Delete this row' }).click();
    }
    async clearColumn(columnName: string): Promise<void> {
        await this.page.getByRole('columnheader', { name: columnName }).click({ button: 'right' });
        await this.page.getByRole('menuitem', { name: 'Clear this column' }).click();
    }
    async deleteTable(): Promise<void> {
        await this.page.getByRole('img', { name: 'Table icon' }).click({ button: 'right' });
        await this.page.getByRole('menuitem', { name: 'Delete table' }).click();
    }

    getTableOpenTrigger(fieldId: string): Locator {
        return this.getElementByAutomationId(`field-has-issue${fieldId}`);
    }

    getFieldInputById(fieldId: string): Locator {
        return this.getElementByAutomationId(`idp-field-${fieldId}`);
    }

    getFieldHasIssue(fieldId: string): Locator {
        return this.getElementByAutomationId(`field-has-issue${fieldId}`);
    }

    getFieldExtractionResult(fieldId: string): Locator {
        return this.getElementByAutomationId(`idp-field-extraction-result-${fieldId}`);
    }

    async openTableForField(fieldId: string) {
        const fieldTrigger = this.page.locator(`[data-automation-id="field-has-issue${fieldId}"]`);
        await fieldTrigger.click();
        await this.page.waitForSelector('.idp-table-container, .idp-blank-table-container', { timeout: 5000 });
    }

    async closeTableView() {
        const closeButton = this.page.locator('[data-automation-id="idp-table-close-button"]');
        if (await closeButton.isVisible()) {
            await closeButton.click();
            await expect(this.page.locator('.idp-table-container')).toBeHidden();
        }
    }

    async typeIntoFirstTableCell(fieldId: string, value: string) {
        await this.page.waitForSelector('.idp-table-container', { timeout: 5000 });

        const cellInput = this.page.locator('.idp-cell-edit-input').first();
        await expect(cellInput).toBeVisible({ timeout: 5000 });

        await cellInput.click();
        await cellInput.press('Control+A');
        await cellInput.press('Backspace');
        await cellInput.fill(value);
        await this.page.keyboard.press('Tab');

        const actualValue = await cellInput.inputValue();
        expect(actualValue).toBe(value);
    }

    async navigateTableWithKeys() {
        const getSelectedCell = () => this.page.locator('.idp-cell-edit-input-is-selected');
        const getSelectedCellId = async () => getSelectedCell().getAttribute('id');
        const getRequiredCellId = async (label: string): Promise<string> => {
            const id = await getSelectedCellId();
            if (!id) {
                throw new Error(`${label} must be defined`);
            }
            return id;
        };

        const fillSelectedCell = async (value: string): Promise<string> => {
            const cellInput = getSelectedCell();
            await expect(cellInput).toBeVisible();
            await cellInput.click();
            await cellInput.press('Control+A');
            await cellInput.press('Backspace');
            await cellInput.fill(value);

            const id = await cellInput.getAttribute('id');
            if (!id) {
                throw new Error('Filled cell must have an id');
            }
            return id;
        };

        const verifyValuePersisted = async (cellId: string, expectedValue: string) => {
            const cell = this.page.locator(`[id="${cellId}"]`);
            await expect(cell).toHaveValue(expectedValue);
        };

        const originalId = await fillSelectedCell('123');
        await this.page.keyboard.press('Tab');

        const afterTabId = await getRequiredCellId('afterTabId');
        expect(afterTabId).not.toBe(originalId);
        await verifyValuePersisted(originalId, '123');

        await fillSelectedCell('456');
        await this.page.keyboard.press('Shift+Tab');

        const afterShiftTabId = await getRequiredCellId('afterShiftTabId');
        expect(afterShiftTabId).toBe(originalId);
        await verifyValuePersisted(afterTabId, '456');

        await fillSelectedCell('789');
        await this.page.keyboard.press('PageDown');
        await this.page.waitForTimeout(300);

        const afterPageDownId = await getRequiredCellId('afterPageDownId');
        expect(afterPageDownId).not.toBe(afterShiftTabId);
        await verifyValuePersisted(afterShiftTabId, '789');

        await fillSelectedCell('321');
        await this.page.keyboard.press('PageUp');
        await this.page.waitForTimeout(300);

        const afterPageUpId = await getRequiredCellId('afterPageUpId');
        expect(afterPageUpId).toBe(originalId);
        await verifyValuePersisted(afterPageDownId, '321');

        await fillSelectedCell('999');
        await this.page.keyboard.press('End');

        const afterEndId = await getRequiredCellId('afterEndId');
        expect(afterEndId).not.toBe(afterPageUpId);
        await verifyValuePersisted(afterPageUpId, '999');

        await fillSelectedCell('000');
        await this.page.keyboard.press('Home');

        const afterHomeId = await getRequiredCellId('afterHomeId');
        expect(afterHomeId).toBe(originalId);
        await verifyValuePersisted(afterEndId, '000');
    }
}
