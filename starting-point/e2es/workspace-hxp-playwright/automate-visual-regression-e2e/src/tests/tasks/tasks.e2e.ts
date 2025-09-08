/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '../../fixtures/page-initialization';

test.use({ storageState: getUserState('hruser') });

test.describe('Visual Regression - Tasks List', () => {
    test.beforeEach(async ({ tasksPage, tasksListMock, processListMock }) => {
        await tasksListMock.mockTasksListResponse();
        await processListMock.mockProcessListResponse();
        await tasksPage.navigate();
        await tasksPage.dataTable.spinnerWaitForReload();
        await tasksPage.contentSideNavbar.collapsePanelHeader('Content Management');
    });

    test(`[XAT-16554] Should have tasks page properly displayed`, async ({ tasksPage }) => {
        await test.step('Verify sidenav', async () => {
            await expect.soft(tasksPage.contentSideNavbar.getRootLocator).toHaveScreenshot('XAT-16554-content-sidenav.png');
        });

        await test.step('Verify tasks page header', async () => {
            await expect.soft(tasksPage.pageLayoutHeaderComponent.getRootLocator).toHaveScreenshot('XAT-16554-my-tasks-page-header.png');
        });

        await test.step('Verify tasks filters', async () => {
            await expect.soft(tasksPage.filters.getRootLocator).toHaveScreenshot('XAT-16554-tasks-filters.png');
        });

        await test.step('Verify tasks table', async () => {
            await expect.soft(tasksPage.dataTable.getRootLocator).toHaveScreenshot('XAT-16554-my-tasks-table.png');
        });

        await test.step('Verify entire page', async () => {
            await tasksPage.contentSideNavbar.collapsePanelHeader('Process Management');
            await expect(tasksPage.page).toHaveScreenshot('XAT-16554-my-tasks-page-full.png', {
                mask: [tasksPage.satPlatformNavPanelComponent.appsListLocator],
                fullPage: true,
            });
        });
    });
});
