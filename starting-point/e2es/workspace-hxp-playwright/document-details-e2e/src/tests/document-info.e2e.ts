/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, UtilRandom, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;
let childFolder: Document;
let file: Document;
let updatedTitle: string;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Folder-1', 'Folder description 1', 'hr');
    childFolder = await hxprApi.documentServiceApi.createFolder('Folder-2', 'Folder description 2', parentFolder.sys_id);
    file = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, parentFolder.sys_id);
    updatedTitle = `e2e--${UtilRandom.generateAlphaNumeric(8)}`;

    await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Document Info', async () => {
    test(`[C699505] User should be able to check and edit a file information from action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(file.sys_title, 'Info');
        await contentBrowserPage.documentViewer.propertiesViewer.editTitle(updatedTitle);
        await contentBrowserPage.documentViewer.propertiesViewer.saveButtonLocator.click();

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(updatedTitle)).toBeVisible();
    });

    test(`[C699506] User should be able to check and edit a folder information from action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(childFolder.sys_title, 'Info');
        await contentBrowserPage.documentViewer.propertiesViewer.editTitle(updatedTitle);
        await contentBrowserPage.documentViewer.propertiesViewer.saveButtonLocator.click();

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(updatedTitle)).toBeVisible();
    });

    test(`[C699507] User should be able to check and edit a file information from context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performContextMenuAction(file.sys_title, 'Info');
        await contentBrowserPage.documentViewer.propertiesViewer.editTitle(updatedTitle);
        await contentBrowserPage.documentViewer.propertiesViewer.saveButtonLocator.click();

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(updatedTitle)).toBeVisible();
    });

    test(`[C699508] User should be able to check and edit a folder information from context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performContextMenuAction(childFolder.sys_title, 'Info');
        await contentBrowserPage.documentViewer.propertiesViewer.editTitle(updatedTitle);
        await contentBrowserPage.documentViewer.propertiesViewer.saveButtonLocator.click();

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(updatedTitle)).toBeVisible();
    });
});
