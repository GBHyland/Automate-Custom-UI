/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator } from '@playwright/test';
import { MatDialogContainer, materialLocators } from '@alfresco-dbp/playwright/shared';

export class FileActionDialog extends MatDialogContainer {
    getCopyToClipboardButtonLocator = this.getIconByNameLocator('content_copy');
    emptyFolderMessage = this.getChild('.adf-empty-content__title', { hasText: ' This folder is empty ' });
    getSelectedFolderNameLocator = this.getChild('.hxp-current-folder').locator('span');
    subFoldersListLocator = this.getChild('.hxp-sub-folder').first();

    getFolderByNameLocator = (folder: string) => this.getChild('.hxp-sub-folder').filter({ hasText: folder }).locator('span');
    getDocByTestId = (dataTestId: string): Locator => this.getChild('').getByTestId(`text_${dataTestId}`);
    dialogTitle = (text: string): Locator => this.getDialogTitleLocator.locator('h1', { hasText: text });

    async selectDestinationFolderAndConfirmCopy(destinationFolder: string): Promise<void> {
        await this.getIconByNameLocator('arrow_back').click();
        await this.getFolderByNameLocator(destinationFolder).click();
        await this.getButtonByText('Copy').click();
    }

    async createFolder(folderName: string, folderCategory: string): Promise<void> {
        await this.getChild('#hxp-new-folder-name').fill(folderName);
        await this.getChild(materialLocators.Select.value.class).click();
        await this.dropdownListComponent.getOptionLocator(folderCategory).click();
        await this.getButtonByExactText('Create Folder').click();
    }

    async performAction(documentTitle: string, actionName: string): Promise<void> {
        await this.getFolderByNameLocator(documentTitle).click();
        await this.getButtonByText(actionName).click();
    }
}
