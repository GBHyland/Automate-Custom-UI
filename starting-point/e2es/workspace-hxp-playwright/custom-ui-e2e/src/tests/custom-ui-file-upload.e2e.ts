/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// eslint-disable-next-line @nx/enforce-module-boundaries
import { getUserState, files } from '@alfresco-dbp/playwright/shared';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

test.describe('Document upload in Custom UI', async () => {
    test.use({ storageState: getUserState('hruser') });

    let uploadFolder: Document;

    test.beforeEach(async ({ hxprApi, contentBrowserPage }, workerInfo) => {
        uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');

        await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C699036] User should be able to upload multiple files via drag and drop`, async ({ contentBrowserPage }) => {
        const { txtFile, pdfFile } = files;
        const { uploadDialog, fileUploadSnackbar } = contentBrowserPage;
        const { propertiesEditor } = uploadDialog;

        await test.step('Drag and drop files to upload', async () => {
            await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);
            await contentBrowserPage.dragAndDropFilesToUpload([txtFile, pdfFile]);
            await uploadDialog.checkboxLocator.first().click();
        });

        await test.step('Assign category to files', async () => {
            await propertiesEditor.categoryPickerLocator.click();
            await propertiesEditor.getCategoryOption('SysFile').click();
            await propertiesEditor.saveButtonLocator.click();

            await expect.soft(propertiesEditor.toastLocator).toContainText(' Properties assigned ');
            await expect.soft(uploadDialog.tableRowLocator).toContainText([txtFile.title, pdfFile.title]);
        });

        await test.step('Upload and confirm files in list', async () => {
            await uploadDialog.submitButtonLocator.click();

            await expect.soft(fileUploadSnackbar.getUploadStatus('Upload successful')).toHaveCount(2);
            await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName(txtFile.title)).toBeVisible();
            await expect(contentBrowserPage.hxpDatatableBody.getRowByName(pdfFile.title)).toBeVisible();
        });
    });
});
