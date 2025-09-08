/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent, materialLocators } from '@alfresco-dbp/playwright/shared';

export class HxpUploadPropertiesEditor extends BaseComponent {
    public static readonly rootElement = 'hxp-workspace-upload-properties-editor';

    constructor(page: Page) {
        super(page, HxpUploadPropertiesEditor.rootElement);
    }

    locationPickerLocator = this.getChild('#hxp-document-location-picker-input');
    locationLocator = this.getChild(`${materialLocators.Form.field} input`);
    categoryPickerLocator = this.getChild(`hxp-document-category-picker ${materialLocators.Select.value.class}`);
    saveButtonLocator = this.getChild('button');
    toastLocator = this.page.locator('span.hxp-workspace-upload-properties-editor__toast__message');

    getLocationOption = (optionName: string) => this.page.locator('div.hxp-document-location-picker-overlay').getByText(optionName);
    getCategoryOption = (optionName: string) => this.page.locator('#hxp-document-category-picker-select-panel').getByText(optionName);

    expandLocationChevron = async (): Promise<void> => {
        const chevronButton = this.page.locator('.hxp-document-location-picker-overlay .hxp-selected button[aria-label^="DOCUMENT_TREE.TOGGLE"]');
        await chevronButton.waitFor({ state: 'visible' });

        if (await chevronButton.getByText('chevron_right').isVisible()) {
            await chevronButton.click();
        }
    };
}
