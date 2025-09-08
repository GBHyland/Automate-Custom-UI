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
let subChildFolder1: Document;
let subChildFolder2: Document;
let file1: Document;
let file2: Document;

const snackbarMessages = {
    documentDeleted: 'Document deleted',
    multipleDocumentsDeleted: '4 Documents deleted',
};

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent-Folder', 'Folder description', 'hr');
    childFolder = await hxprApi.documentServiceApi.createFolder('Child-Folder', 'Child Folder description', parentFolder.sys_id);
    file1 = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, childFolder.sys_id);
    file2 = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, childFolder.sys_id);
    subChildFolder1 = await hxprApi.documentServiceApi.createFolder('subChild-Folder1', 'subChild Folder 1', childFolder.sys_id);
    subChildFolder2 = await hxprApi.documentServiceApi.createFolder('subChild-Folder2', 'subChild Folder 2', childFolder.sys_id);

    await contentBrowserPage.navigateToDocument(childFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Document Delete', async () => {
    test(`[C697270] User should be able to delete the selected file using action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(file1.sys_title, 'Delete');
        await contentBrowserPage.fileActionDialog.getButtonByText('Delete Document').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.documentDeleted);
        await expect.soft(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(file1.sys_title)).not.toBeVisible();
    });

    test(`[C697271] User should be able to delete the selected folder using action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await contentBrowserPage.performToolbarAction(childFolder.sys_title, 'Delete');
        await contentBrowserPage.fileActionDialog.getButtonByText('Delete Document').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.documentDeleted);
        await expect.soft(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(childFolder.sys_title)).not.toBeVisible();
    });

    test(`[C697273] User should be able to delete the selected File from context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performContextMenuAction(file1.sys_title, 'Delete');
        await contentBrowserPage.fileActionDialog.getButtonByText('Delete Document').click();

        await expect(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.documentDeleted);
        await expect(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(file1.sys_title)).not.toBeVisible();
    });

    test(`[C699677] User should be able to delete files and folders using action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(file1.sys_title).click();
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(file2.sys_title).click();
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(subChildFolder1.sys_title).click();
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(subChildFolder2.sys_title).click();
        await contentBrowserPage.adfToolbar.getButtonByText('Delete').click();
        await contentBrowserPage.fileActionDialog.getButtonByText('Delete Document').click();

        await expect(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.multipleDocumentsDeleted);
        await expect(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(file1.sys_title)).not.toBeVisible();
        await expect(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(file2.sys_title)).not.toBeVisible();
        await expect(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(subChildFolder1.sys_title)).not.toBeVisible();
        await expect(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(subChildFolder2.sys_title)).not.toBeVisible();
    });
});
