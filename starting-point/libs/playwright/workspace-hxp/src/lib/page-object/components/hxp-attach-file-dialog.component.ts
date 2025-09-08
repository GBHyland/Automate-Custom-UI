/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import {
    AdfToolbarComponent,
    DataTableComponent,
    DropdownListComponent,
    MatDialogContainer,
    materialLocators,
    timeouts,
} from '@alfresco-dbp/playwright/shared';

type TabLabels = 'Repository' | 'Local storage';

export class HxpAttachFileDialogComponent extends MatDialogContainer {
    static rootElement = 'hxp-attach-file-dialog';

    dataTable = new DataTableComponent(this.page);
    toolbar = new AdfToolbarComponent(this.page);
    breadcrumbDropdown = new DropdownListComponent(this.page, materialLocators.Select.panel.class);

    constructor(page: Page) {
        super(page, HxpAttachFileDialogComponent.rootElement);
    }

    getUploadedFilesNumberLocator = this.getChild('.adf-upload-dialog__title');
    getBreadcrumbsLocator = this.getChild('.hxp-attach-file-dialog-navigation');
    getAttachButtonLocator = this.getButtonByExactText('Attach');
    getUploadButtonLocator = this.getButtonByExactText('UPLOAD');

    override async switchToTab(tabName: TabLabels): Promise<void> {
        await super.switchToTab(tabName);
        await this.page.waitForTimeout(timeouts.normal);
    }

    async uploadFile(filePath: string | string[]): Promise<void> {
        const [fileChooser] = await Promise.all([this.page.waitForEvent('filechooser'), this.getUploadButtonLocator.click()]);
        await fileChooser.setFiles(filePath);
    }

    async attachFileFromLocal(filePath: string | string[]): Promise<void> {
        await this.switchToTab('Local storage');
        await this.uploadFile(filePath);
        await this.getAttachButtonLocator.isEnabled();
        await this.getAttachButtonLocator.click();
    }
}
