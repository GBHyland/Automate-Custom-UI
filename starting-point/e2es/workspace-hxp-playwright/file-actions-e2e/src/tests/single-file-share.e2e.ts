/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

let uploadedFileName: string;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    const parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent-Folder', 'Folder Description', 'hr');
    const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, parentFolder.sys_id);
    uploadedFileName = uploadedFile.sys_title;

    await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Single File Share', async () => {
    test(`[C698835] User should be able to open the file with the shareable File Link from toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(uploadedFileName, 'Share');
        await contentBrowserPage.fileActionDialog.getCopyToClipboardButtonLocator.click();
        const shareableFileLink = await contentBrowserPage.getClipboardData();
        await contentBrowserPage.page.goto(shareableFileLink);

        await expect(contentBrowserPage.documentViewer.adfViewerLocator).toBeVisible();
    });

    test(`[C699050] User should be able to open the file with the shareable File Link from context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Share');
        await contentBrowserPage.fileActionDialog.getCopyToClipboardButtonLocator.click();
        const shareableFileLink = await contentBrowserPage.getClipboardData();
        await contentBrowserPage.page.goto(shareableFileLink);

        await expect(contentBrowserPage.documentViewer.adfViewerLocator).toBeVisible();
    });
});
