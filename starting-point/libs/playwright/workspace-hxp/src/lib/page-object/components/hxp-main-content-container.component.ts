/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Locator, Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';
import { HxpDocumentListPaginatorComponent } from './hxp-document-list-paginator';

export class MainContentContainer extends BaseComponent {
    static rootElement = '.hxp-document-list-container';

    constructor(page: Page) {
        super(page, MainContentContainer.rootElement);
    }

    datatableRowHeader = this.getChild('[data-automation-id="datatable-row-header"]');
    columnHeaders = this.datatableRowHeader.locator('[role="columnheader"]');
    emptyFolderMessage = this.getChild('.adf-empty-content__title', {
        hasText: ' This folder is empty ',
    });

    paginator = new HxpDocumentListPaginatorComponent(this.page);

    dataRowLocator = this.getChild('').getByTestId(/datatable-row-(0|[1-9]\d*)/);
    getDocByTestId = (dataTestId: string): Locator => this.getChild('').getByTestId(`text_${dataTestId}`);
    getColumnHeaderByTitleLocator = (columnName: string) => this.columnHeaders.filter({ hasText: columnName });
    getColumnResizeAreaLocator = (columnName: string) => this.getColumnHeaderByTitleLocator(columnName).locator('.adf-datatable__resize-handle');

    async resizeColumn(columnNameToResize: string, pixels: number, direction: string): Promise<void> {
        await this.mouseDragAndDropByPixels(this.getColumnResizeAreaLocator(columnNameToResize), 'middle', pixels, direction);
    }

    async getColumnWidth(columnName: string): Promise<number> {
        const columnBounding = await this.getColumnHeaderByTitleLocator(columnName).boundingBox();
        if (columnBounding !== null) {
            return columnBounding.width;
        }
        throw new Error('Column bounding is null.');
    }
}
