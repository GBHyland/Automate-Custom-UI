/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

test.describe('Data table widget', () => {
    test.use({ storageState: getUserState('hruser') });

    const { dataTableProcess } = HXP_APPS.SYS_WORKSPACE.processes;

    test.beforeEach(async ({ tasksPage }) => {
        await tasksPage.navigate();
    });

    test('[XAT-16631] Should be able to correctly display data table with nested object and special characters in JSON keys for Path to JSON property', async ({
        startProcessPage,
        tasksPage,
    }) => {
        const dataTableProperties = {
            rowCount: 6,
            columnCount: 8,
        };
        const expectedRowData = ['5', '00,55', 'test5', 'May 25, 2023', '5,56 €', 'json', 'true', 'done'];

        await test.step('Open the start process form', async () => {
            await tasksPage.pageLayoutHeaderComponent.startProcessButton.click();
            await tasksPage.startProcessDialog.selectProcess(dataTableProcess.processName);
        });

        await test.step('Verify button for JSON type data', async () => {
            await tasksPage.dataTable.getButtonByNameForSpecificRow('test3', 'json').click();

            await expect.soft(startProcessPage.matDialogContainer.getDialogTitleLocator).toHaveText('Testing results');

            await startProcessPage.matDialogContainer.getButtonByExactText('Close').click();
        });

        await test.step('Confirm that data table is properly displayed', async () => {
            expect.soft(await tasksPage.dataTable.getDataTableProperties()).toStrictEqual(dataTableProperties);
            expect.soft(await tasksPage.dataTable.getMinimumRowHight()).toBeGreaterThan(0);
            expect.soft(await tasksPage.dataTable.getMinimumColumnWidth()).toBeGreaterThan(0);
            (await tasksPage.dataTable.getAllCellsLocators()).forEach(async (cell) => {
                await expect.soft(cell).not.toBeEmpty();
            });
            expect.soft(await tasksPage.dataTable.getCellValuesListByRowName('test5')).toStrictEqual(expectedRowData);
        });

        await test.step('Verify sortable and draggable icons', async () => {
            const nameColumnLocator = tasksPage.dataTable.getColumnHeaderByTitleLocator('Name');
            await nameColumnLocator.click();
            await nameColumnLocator.hover();

            await expect.soft(nameColumnLocator).toHaveAttribute('aria-sort', 'Ascending');
            await expect(tasksPage.dataTable.getColumnHeaderDraggableAreaLocator(nameColumnLocator)).toBeVisible();
        });
    });
});
