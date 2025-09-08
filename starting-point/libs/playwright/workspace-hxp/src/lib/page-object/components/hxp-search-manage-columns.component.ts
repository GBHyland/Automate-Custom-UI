/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BaseComponent } from '@alfresco-dbp/playwright/shared';

export class HxpSearchManageColumnsComponent extends BaseComponent {
    static rootElement = 'hxp-manage-column-dialog';

    constructor(page: Page) {
        super(page, HxpSearchManageColumnsComponent.rootElement);
    }

    availableColumnsLocator = this.getChild('.hxp-manage-columns-available-columns');
    selectedColumnsLocator = this.getChild('.hxp-manage-columns-selected-columns');
    availableColumnSearchContainer = this.availableColumnsLocator.locator('.hxp-manage-columns-search-container [aria-label="Search Input"]');

    draggableButton = (columnName: string) =>
        this.selectedColumnsLocator
            .locator('.hxp-manage-columns-column-item', { hasText: columnName })
            .locator('button', { hasText: 'drag_indicator' });

    async removeColumns(columnNames: string[]): Promise<void> {
        for (const column of columnNames) {
            const removeButton = this.selectedColumnsLocator
                .locator('.hxp-manage-columns-column-item', { hasText: column })
                .locator('button', { hasText: 'remove_circle_outline' });
            await removeButton.click();
        }
    }

    async addColumns(columnNames: string[]): Promise<void> {
        for (const column of columnNames) {
            const addButton = this.availableColumnsLocator
                .locator('.hxp-manage-columns-column-item', { hasText: column })
                .locator('button', { hasText: 'add_circle_outline' });
            await addButton.click();
        }
    }

    async dragColumnOverColumn(columnNameToMove: string, columnNameToGoOver: string): Promise<void> {
        const columnToMove = this.draggableButton(columnNameToMove);
        const columnToGoOver = this.draggableButton(columnNameToGoOver);

        await columnToMove.waitFor({ state: 'visible' });
        await this.mouseDragAndDrop(columnToMove, columnToGoOver);
    }
}
