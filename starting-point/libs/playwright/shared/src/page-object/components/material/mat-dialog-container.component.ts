/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '../base.component';
import { DropdownListComponent, DropdownStandardComponent } from '../dropdowns';
import { materialLocators, MatSelectComponent } from '.';

export class MatDialogContainer extends BaseComponent {
    constructor(page: Page, rootElement = materialLocators.Dialog.container.root) {
        super(page, rootElement);
    }

    dropdownListComponent = new DropdownListComponent(this.page, '.cdk-overlay-container');
    dropdownList = new DropdownStandardComponent(this.page);
    select = new MatSelectComponent(this.page);

    dialog = this.getChild('');
    getDialogTitleLocator = this.getChild(materialLocators.Dialog.title);
    getDialogContentLocator = this.getChild(materialLocators.Dialog.content.root);
    getDialogContentTextLocator = this.getDialogContentLocator.locator('textarea');
    getTableListLocator = this.getChild(materialLocators.Table.class);
    getListItemsLocator = this.getChild(materialLocators.List.item.class);
    getValidationErrorLocator = this.getChild(`[data-automation-id*='error']`);
    dialogContentDevConfigDataLocator = this.getChild('[class*="studio-development-configuration-content-list-item"]');
    getDialogConfirmButtonLocator = this.getElementByAutomationId('dialog-confirm');
    getDialogCloseButtonLocator = this.getElementByAutomationId('dialog-close');
    getDialogReferenceItemLocator = this.getChild('[data-automation-id*="confirm-dialog-message-list-item"]');
    getDialogCategoryAddButtonLocator = this.getElementByAutomationId('dialog-add');
    getDialogCategoryCloseButtonLocator = this.getElementByAutomationId('dialog-cancel');
    getValidationErrorByClass = this.getChild(materialLocators.Error.class);
    getProcessVariableInfoTooltipDialogLocator = this.getChild('.studio-info-dialog-content');
    getDialogDescriptionLocator = this.getProcessVariableInfoTooltipDialogLocator.locator('.ama-adf-tooltip-container-text p');

    getFieldByPlaceholderLocator = (name: string) => this.getChild(`[placeholder*='${name}']`);
    getRowByNameLocator = (name: string) => this.getChild(materialLocators.Table.row.class, { hasText: name });
    getTabLocator = (tabName: string) => this.getChild(`${materialLocators.Tab.header} [role="tab"]`, { hasText: tabName });
    getDialogHeaderLocator = (headerNo: number = 1) => this.getChild(`h${headerNo}`);
    getExpansionPanelHeaderByTextLocator = (text: string) => this.getChild(materialLocators.Expansion.panel.title, { hasText: text });
    getIconByNameLocator = (name: string) => this.getChild(materialLocators.Icon.root, { hasText: name });
    getCurrentDialogIdValue = () => this.dialog.last().getAttribute('id');
    private getRippleEffectTabLocator = (tabName: string) => this.getTabLocator(tabName).locator(materialLocators.RippleElement.class);
    getRadioButtonByNameLocator = (name: string) => this.getChild(`${materialLocators.Radio.button} label`, { hasText: name });
    getFieldByNameLocator = (text: string) => this.dialog.getByRole('textbox', { name: text, exact: true });
    getSelectFieldLocator = (name: string) => this.getChild(`[formcontrolname='${name}']`);

    private async waitForRippleEffectToFinish(tabName: string): Promise<void> {
        try {
            await this.getRippleEffectTabLocator(tabName).waitFor({ state: 'attached' });
            await this.getRippleEffectTabLocator(tabName).waitFor({ state: 'detached' });
        } catch {
            this.logger.info('ripple tab effect was not present');
        }
    }

    async switchToTab(tabName: string): Promise<void> {
        await this.getTabLocator(tabName).click();
        await this.waitForRippleEffectToFinish(tabName);
    }

    async getVariableReferencesList(): Promise<string[]> {
        const dialogReferenceItemLocators = await this.getDialogReferenceItemLocator.all();
        const variableReferencesTexts = await Promise.all(
            dialogReferenceItemLocators.map(async (locator) => {
                const textContent = await locator.textContent();
                return textContent ? textContent.trim() : '';
            })
        );
        return variableReferencesTexts;
    }

    async fillCategoryData(name: string, description = ''): Promise<void> {
        await this.getFieldByPlaceholderLocator('New Category').fill(name);
        const descriptionField = this.getFieldByPlaceholderLocator('Enter description');
        await descriptionField.click();
        await descriptionField.fill(description);
    }

    async clickAddButton(): Promise<void> {
        await this.getDialogCategoryAddButtonLocator.click();
    }

    async clickDeleteButton(): Promise<void> {
        await this.getDialogConfirmButtonLocator.click();
    }

    async selectEnvironment(env: string): Promise<void> {
        await this.getSelectFieldLocator('environment').click();
        await this.select.getOptionByName(env).click();
    }
}
