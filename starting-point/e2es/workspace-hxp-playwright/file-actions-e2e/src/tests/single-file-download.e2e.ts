/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

let uploadedFileName1: string;
let uploadedFileName2: string;
let uploadedFileId: string;

const snackbarMessages = {
    fileDownloadProgress: 'Downloading a file',
    fileDownloadSuccess: 'File has been downloaded successfully!',
    fileDownloadError: 'File download failed',
};

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    const parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('single-download', 'Folder Description', 'hr');
    const uploadedFile1 = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, parentFolder.sys_id);
    const uploadedFile2 = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, parentFolder.sys_id);

    uploadedFileName1 = uploadedFile1.sys_title;
    uploadedFileName2 = uploadedFile2.sys_title;
    uploadedFileId = uploadedFile1.sys_id;

    await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Single File Download', () => {
    test(`[C695004] Download button should be visible on selecting a single file`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileName1).click();

        await expect(contentBrowserPage.adfToolbar.getButtonByExactText('download')).toBeVisible();
    });

    test(`[C695005] Download button should not be visible on selecting multiple files`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileName1).click();
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileName2).click();

        await expect(contentBrowserPage.adfToolbar.getButtonByExactText('download')).not.toBeVisible();
    });

    test(`[C695007] User should be able to download a single file from action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileName1).click();
        const downloadedFilePath = await contentBrowserPage.adfToolbar.downloadFileFromToolbar();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.fileDownloadSuccess);
        expect(downloadedFilePath).not.toEqual(null);
    });

    test(`[C695008] User should be able to download a single file from context-menu`, async ({ contentBrowserPage }) => {
        const downloadedFilePath = await contentBrowserPage.performContextMenuAction(uploadedFileName1, 'Download');

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.fileDownloadSuccess);
        expect(downloadedFilePath).not.toEqual(null);
    });

    test(`[C695006] User should be able to see error and info message when the download will fail`, async ({ hxprApi, contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileName1).click();
        await hxprApi.documentServiceApi.deleteDocumentById(uploadedFileId);
        await contentBrowserPage.adfToolbar.getButtonByExactText('download').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.fileDownloadProgress);
        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.fileDownloadError);
    });
});
