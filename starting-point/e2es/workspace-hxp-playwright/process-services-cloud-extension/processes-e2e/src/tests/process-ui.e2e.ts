/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, getUserState, TestFlags } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Process User Interface', () => {
    test.beforeEach(async ({ processPage }) => {
        await processPage.navigate();
        await processPage.dataTable.waitForRootElement();
    });

    test(`${TestFlags.UnderFF} [C687998] Should be able to see only process sections when accessing a process UI`, async ({
        processPage,
        tasksPage,
        page,
        contentBrowserPage,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');

        expect.soft(page.url()).toContain('#/process-list-cloud');

        await processPage.dataTable.waitForRootElement();

        await expect.soft(contentBrowserPage.contentSideNavbar.getSideNavbarTitle(' Process Management ')).toBeVisible();
        await expect.soft(contentBrowserPage.contentSideNavbar.getSideNavbarTitle(' Content Management ')).toBeHidden();
        await expect.soft(contentBrowserPage.mainContentHeader.newFileUploadButton, 'Process UI should not contain File Upload button').toBeHidden();

        await tasksPage.navigate();
        await tasksPage.dataTable.waitForRootElement();
        await contentBrowserPage.satoriHeaderComponent.appHeaderTitle.click();
        await processPage.dataTable.waitForRootElement();

        expect(page.url()).toContain('#/process-list-cloud');
    });

    test(`${TestFlags.UnderFF} [C687998-OLD] Should be able to see only process sections when accessing a process UI`, async ({
        processPage,
        tasksPage,
        page,
        contentBrowserPage,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'old-functionality');

        expect.soft(page.url()).toContain('#/process-list-cloud');

        await processPage.dataTable.waitForRootElement();

        await expect.soft(contentBrowserPage.contentSideNavbar.getSideNavbarTitle(' Process Management ')).toBeVisible();
        await expect.soft(contentBrowserPage.contentSideNavbar.getSideNavbarTitle(' Content Management ')).toBeHidden();
        await expect.soft(contentBrowserPage.mainContentHeader.newFileUploadButton, 'Process UI should not contain File Upload button').toBeHidden();

        await tasksPage.navigate();
        await tasksPage.dataTable.waitForRootElement();
        await tasksPage.hxpWorkspaceHeaderComponent.getAppTitleLocator.click();
        await processPage.dataTable.waitForRootElement();

        expect(page.url()).toContain('#/process-list-cloud');
    });
});
