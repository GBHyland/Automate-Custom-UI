/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '.';

export class HxpPropertiesViewerContainerComponent extends BaseComponent {
    static rootElement = 'hxp-properties-viewer-container';

    constructor(page: Page) {
        super(page, HxpPropertiesViewerContainerComponent.rootElement);
    }

    editButtonLocator = this.getChild('.hxp-property-edit-button');
    titleFieldLocator = this.getChild(`${materialLocators.Form.fieldInfix} [data-automation-id='card-textitem-value-sys_title']:not([disabled])`);
    fileNameFieldLocator = this.getChild(`[data-automation-id='card-textitem-value-sysfile_blob.filename']`);
    saveButtonLocator = this.getChild('.hxp-save-properties-button');
    cancelButtonLocator = this.getChild('.hxp-cancel-button');
    categoryValueLocator = this.getChild('[data-automation-id="select-readonly-value-sys_primaryType"]');

    async editTitle(fileTitle: string): Promise<void> {
        await this.editButtonLocator.nth(0).click();
        await this.titleFieldLocator.fill(fileTitle);
    }

    async editFileName(fileName: string): Promise<void> {
        await this.editButtonLocator.nth(0).click();
        await this.fileNameFieldLocator.fill(fileName);
    }

    async getAllProperties(): Promise<Record<string, string>> {
        const properties: Record<string, string> = {};
        const list = await this.getChild('.adf-property-list [data-automation-id*="header-"]').all();

        for (const property of list) {
            const keyLocator = property.locator(`.adf-property-label`).first();
            const valueLocator = property.locator(`.adf-property-value`).first();

            const key = await keyLocator.textContent();
            if (key === null) {
                continue;
            }

            const tagName = await valueLocator.evaluate((el) => el.tagName);

            let value;
            if (tagName === 'DIV') {
                value = await valueLocator.textContent();
            } else if (tagName === 'INPUT') {
                value = await valueLocator.inputValue();
            } else {
                continue;
            }

            properties[key.trim()] = value?.trim() ?? '';
        }

        return properties;
    }
}
