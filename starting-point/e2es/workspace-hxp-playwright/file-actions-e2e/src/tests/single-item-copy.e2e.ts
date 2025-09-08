/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;
let childFolder: Document;
let destinationFolder: Document;
let testFolder: Document;
let testFile: Document;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }, workerInfo) => {
    await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);

    parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('parentFolder', 'Parent folder description', 'hr');
    destinationFolder = await hxprApi.documentServiceApi.createFolder('destinationFolder', 'Destination folder description', parentFolder.sys_id);
    childFolder = await hxprApi.documentServiceApi.createFolder('childFolder', 'Child folder description', parentFolder.sys_id);
    testFolder = await hxprApi.documentServiceApi.createFolder('testFolder', 'Test folder description', childFolder.sys_id);
    testFile = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, childFolder.sys_id);

    await contentBrowserPage.navigateToDocument(childFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Document copy', async () => {
    test(`[C698856] User should be able to copy a single testFile to a folder from toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(testFile.sys_title, 'Copy');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.getFolderByNameLocator(childFolder.sys_title).waitFor();
        await contentBrowserPage.fileActionDialog.getButtonByText('Copy').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File has been copied');

        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFile.sys_title)).toBeVisible();
    });

    test(`[C698857] User should be able to copy a single testFile to a folder from context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performContextMenuAction(testFile.sys_title, 'Copy');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.getFolderByNameLocator(childFolder.sys_title).waitFor();
        await contentBrowserPage.fileActionDialog.getButtonByText('Copy').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File has been copied');

        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFile.sys_title)).toBeVisible();
    });

    test(`[C699510] User should be able to copy a single folder from action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(testFolder.sys_title, 'Copy');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.getFolderByNameLocator(childFolder.sys_title).waitFor();
        await contentBrowserPage.fileActionDialog.getButtonByText('Copy').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('Folder has been copied');

        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFolder.sys_title)).toBeVisible();
    });

    test(`[C699511] User should be able to copy a single folder from context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performContextMenuAction(testFolder.sys_title, 'Copy');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.getFolderByNameLocator(childFolder.sys_title).waitFor();
        await contentBrowserPage.fileActionDialog.getButtonByText('Copy').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('Folder has been copied');

        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFolder.sys_title)).toBeVisible();
    });

    test(`[XAT-16802] User should be able to copy a single file from sub-folder to destination-folder`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(testFile.sys_title, 'Copy');
        await contentBrowserPage.fileActionDialog.selectDestinationFolderAndConfirmCopy(destinationFolder.sys_title);

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File has been copied');

        await contentBrowserPage.navigateToDocument(destinationFolder.sys_id);
        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();

        await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName(testFile.sys_title)).toBeVisible();
        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFile.sys_title)).toHaveCount(1);
    });
});
