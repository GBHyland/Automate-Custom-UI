/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, files, getUserState } from '@alfresco-dbp/playwright/shared';
import { expect, test, ViewerTypes } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let uploadFolder: Document;
let uploadFile: Document;

test.beforeEach(async ({ skipOrExecuteTestBasedOnFlagStatus, hxprApi }) => {
    await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.WorkspaceVersioning, 'new-functionality');
    uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');
    uploadFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, uploadFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Replace File', () => {
    test.use({ storageState: getUserState('hruser') });

    test(`[XAT-17644] Replace file from the preview`, async ({ contentBrowserPage, page }) => {
        await contentBrowserPage.navigateToDocument(uploadFile.sys_id);
        await expect.soft(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Pdf)).toBeVisible();

        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await expect.soft(contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Replace file')).toBeVisible();

        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Replace file').click(),
        ]);
        await fileChooser.setFiles(files.txtFile.path);

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File replaced successfully.');
        await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Txt)).toBeVisible();
    });

    test(`[XAT-17646] Replace file from context menu`, async ({ contentBrowserPage, page }) => {
        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);
        await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName(uploadFile.sys_title)).toBeVisible();

        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            await contentBrowserPage.performContextMenuAction(uploadFile.sys_title, 'Replace file'),
        ]);
        await fileChooser.setFiles(files.txtFile.path);
        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File replaced successfully.');

        await contentBrowserPage.hxpDatatableBody.getRowByName(uploadFile.sys_title).click();
        await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Txt)).toBeVisible();
    });

    test(`[XAT-17647] Replace file from action toolbar`, async ({ contentBrowserPage, page }) => {
        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);
        await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName(uploadFile.sys_title)).toBeVisible();

        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadFile.sys_title).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await expect.soft(contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Replace File')).toBeVisible();

        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Replace file').click(),
        ]);
        await fileChooser.setFiles(files.txtFile.path);
        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File replaced successfully.');

        await contentBrowserPage.hxpDatatableBody.getRowByName(uploadFile.sys_title).click();
        await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Txt)).toBeVisible();
    });
});
