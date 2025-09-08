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

test.use({ storageState: getUserState('hruser') });

test.describe('Document Upload Retry', async () => {
    let uploadFolder: Document;

    test.beforeEach(async ({ hxprApi }) => {
        uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C703039] Retry failed files upload`, async ({ contentBrowserPage, documentMock }) => {
        const { txtFile } = files;
        const { uploadDialog } = contentBrowserPage;

        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);

        await documentMock.disableUploadEndpoint();

        await contentBrowserPage.mainContentHeader.newFileUploadButton.click();
        await contentBrowserPage.selectFileForUpload(txtFile.path);

        await expect.soft(uploadDialog.getChild('')).toBeVisible();
        await expect(uploadDialog.getUploadListFileError(txtFile.title)).toBeVisible();

        await documentMock.enableUploadEndpoint();

        await uploadDialog.checkboxLocator.first().click();
        await expect.soft(uploadDialog.getUploadListSelectedRowByName(txtFile.title)).toBeVisible();

        await expect.soft(uploadDialog.uploadListRetryButtonLocator).toBeVisible();
        await uploadDialog.uploadListRetryButtonLocator.click();

        await expect.soft(uploadDialog.tableRowLocator).toContainText([txtFile.title]);
        await expect(uploadDialog.getUploadListFileError(txtFile.title)).not.toBeVisible();
    });

    test(`[C703040] Retry failed files creation after upload`, async ({ contentBrowserPage, documentMock }) => {
        const { txtFile } = files;
        const { uploadDialog, fileUploadSnackbar } = contentBrowserPage;
        const { propertiesEditor } = uploadDialog;

        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);

        await contentBrowserPage.mainContentHeader.newFileUploadButton.click();
        await contentBrowserPage.selectFileForUpload(txtFile.path);

        await expect.soft(uploadDialog.getChild('')).toBeVisible();
        await expect(uploadDialog.tableRowLocator).toContainText([txtFile.title]);

        await uploadDialog.checkboxLocator.first().click();
        await propertiesEditor.categoryPickerLocator.click();
        await propertiesEditor.getCategoryOption('SysFile').click();
        await propertiesEditor.saveButtonLocator.click();

        await expect.soft(propertiesEditor.toastLocator).toContainText(' Properties assigned ');
        await expect.soft(uploadDialog.submitButtonLocator).toBeEnabled();

        await documentMock.disableDocumentsEndpoint();

        await uploadDialog.submitButtonLocator.click();

        await expect.soft(fileUploadSnackbar.fileNamesLocator).toContainText([txtFile.title]);
        await expect(fileUploadSnackbar.getUploadStatus('Retry')).toBeVisible();

        await documentMock.enableDocumentsEndpoint();

        await fileUploadSnackbar.retryButtonLocator.click();

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(txtFile.title)).toBeVisible();
    });
});
