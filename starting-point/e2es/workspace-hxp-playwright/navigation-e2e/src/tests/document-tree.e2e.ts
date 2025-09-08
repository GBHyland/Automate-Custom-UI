/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState } from '@alfresco-dbp/playwright/shared';
import { ContentBrowserLabels, expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

const expectedActions: string[] = ['Share', 'Copy'];
let parentFolder: Document;
let childFolder: Document;
let file: Document;

test.use({ storageState: getUserState('hruser') });

test.describe('Content Tree Navigation', async () => {
    test.beforeEach(async ({ contentBrowserPage, hxprApi }) => {
        parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent Folder', 'Folder description', 'hr');
        childFolder = await hxprApi.documentServiceApi.createFolder('Child Folder', 'Child Folder description', parentFolder.sys_id);
        file = await hxprApi.documentServiceApi.createFile('EmptyFile', 'File description', childFolder.sys_id);

        await contentBrowserPage.navigateToRoot();
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C694999] user should be able to navigate to parent folder`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.contentSideNavbar.navigateTo(ContentBrowserLabels.HomeLabel);
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator('Home')).toBeVisible();

        await contentBrowserPage.contentSideNavbar.contentBrowserNavigateTo(parentFolder.sys_title);
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator(parentFolder.sys_title)).toBeVisible();
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator(childFolder.sys_title)).toBeVisible();

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(childFolder.sys_title)).toBeVisible();
    });

    test(`[C695000] user should be able to navigate to the child folder`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.contentSideNavbar.navigateTo(ContentBrowserLabels.HomeLabel);
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator('Home')).toBeVisible();

        await contentBrowserPage.contentSideNavbar.contentBrowserNavigateTo(parentFolder.sys_title);

        await contentBrowserPage.contentSideNavbar.contentBrowserNavigateTo(childFolder.sys_title);

        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator(parentFolder.sys_title)).toBeVisible();
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator(childFolder.sys_title)).toBeVisible();

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(file.sys_title)).toBeVisible();
    });

    test(`[XAT-373] User should see correct action names in contextual menu`, async ({ contentBrowserPage }) => {
        await test.step('Validate the contextual menu action names through right click on folder', async () => {
            await contentBrowserPage.mainContentContainer.waitForRootElement();
            await contentBrowserPage.contentSideNavbar.getRowByName(parentFolder.sys_title).click({ button: 'right' });

            expect.soft(await contentBrowserPage.hxpContextMenuComponent.getAllActionNames()).toEqual(expectedActions);
        });

        await test.step('Validate the contextual menu action names through clicking on ellipsis button for a folder', async () => {
            await contentBrowserPage.reload();
            await contentBrowserPage.mainContentContainer.waitForRootElement();
            await contentBrowserPage.contentSideNavbar.ellipsisLocator(parentFolder.sys_title).click();

            expect(await contentBrowserPage.hxpContextMenuComponent.getAllActionNames()).toEqual(expectedActions);
        });
    });
});
