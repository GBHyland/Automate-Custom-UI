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

let uploadFolder: Document;
let uploadedFile: Document;
let updatedFileTitle: string;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');
    uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, uploadFolder.sys_id);
    updatedFileTitle = `e2e--${UtilRandom.generateAlphaNumeric(8)}.pdf`;

    await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Edit File Properties', async () => {
    test(`[C698871] User should be able to edit Main properties of a File`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.mainContentContainer.getDocByTestId(uploadedFile.sys_title).click();
        await contentBrowserPage.documentViewer.infoButtonLocator.click();
        await contentBrowserPage.documentViewer.propertiesViewer.editTitle(updatedFileTitle);
        await contentBrowserPage.documentViewer.propertiesViewer.saveButtonLocator.click();
        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(updatedFileTitle)).toBeVisible();
    });

    test(`[C698872] User should be able to cancel editing Main properties of a File`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.mainContentContainer.getDocByTestId(uploadedFile.sys_title).click();
        await contentBrowserPage.documentViewer.infoButtonLocator.click();
        await contentBrowserPage.documentViewer.propertiesViewer.editTitle(updatedFileTitle);
        await contentBrowserPage.documentViewer.propertiesViewer.cancelButtonLocator.click();
        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(uploadedFile.sys_title)).toBeVisible();
    });
});
