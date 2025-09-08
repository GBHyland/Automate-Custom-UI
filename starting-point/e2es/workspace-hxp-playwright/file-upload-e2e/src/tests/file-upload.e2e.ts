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

test.describe('Document Upload', async () => {
    test.use({ storageState: getUserState('hruser') });

    let uploadFolder: Document;

    test.beforeEach(async ({ hxprApi }) => {
        uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');
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

    test(`[C699674] Single file upload with location and content type input`, async ({ contentBrowserPage, hxprApi }) => {
        const { txtFile } = files;
        const { uploadDialog, fileUploadSnackbar } = contentBrowserPage;
        const { propertiesEditor } = uploadDialog;

        const childFolder: Document = await hxprApi.documentServiceApi.createFolder('Child Folder', 'Folder description', uploadFolder.sys_id);

        await test.step('Navigate to folder and add a single document for upload', async () => {
            await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);

            await contentBrowserPage.mainContentHeader.newFileUploadButton.click();
            await contentBrowserPage.selectFileForUpload(txtFile.path);

            await expect.soft(uploadDialog.getChild('')).toBeVisible();
            await expect.soft(uploadDialog.getTableRowFileTitle(txtFile.title)).toBeVisible();
        });

        await test.step('Select the document', async () => {
            await uploadDialog.getTableRowFileTitle(txtFile.title).click();

            await expect.soft(propertiesEditor.locationPickerLocator).toBeVisible();
            await expect.soft(propertiesEditor.locationPickerLocator).toHaveAttribute('placeholder', uploadFolder.sys_path);
            await expect.soft(propertiesEditor.categoryPickerLocator).toBeVisible();
            await expect.soft(propertiesEditor.saveButtonLocator).toBeDisabled();
            await expect.soft(uploadDialog.submitButtonLocator).toBeDisabled();
        });

        await test.step('Update properties', async () => {
            await propertiesEditor.locationPickerLocator.click();
            await propertiesEditor.expandLocationChevron();
            await propertiesEditor.getLocationOption(childFolder.sys_title).click();

            await expect.soft(propertiesEditor.locationPickerLocator).toHaveAttribute('placeholder', childFolder.sys_path);

            await propertiesEditor.categoryPickerLocator.click();
            await propertiesEditor.getCategoryOption('SysFile').click();

            await expect.soft(propertiesEditor.saveButtonLocator).toBeEnabled();
            await expect.soft(uploadDialog.submitButtonLocator).toBeDisabled();

            await propertiesEditor.saveButtonLocator.click();

            await expect.soft(propertiesEditor.toastLocator).toBeVisible();
            await expect.soft(propertiesEditor.toastLocator).toContainText(' Properties assigned ');
            await expect.soft(uploadDialog.submitButtonLocator).toBeEnabled();
        });

        await test.step('Submit document', async () => {
            await uploadDialog.submitButtonLocator.click();

            await expect.soft(fileUploadSnackbar.getChild('')).toBeVisible();
            await expect.soft(fileUploadSnackbar.fileNamesLocator).toContainText(txtFile.title);

            await contentBrowserPage.hxpDatatableBody.getRowByName(childFolder.sys_title).click();
            await expect(contentBrowserPage.hxpDatatableBody.getRowByName(txtFile.title)).toBeVisible();
        });
    });

    test(`[C699673] Multiple files upload with location and content type input`, async ({ contentBrowserPage }) => {
        const { txtFile, pdfFile, jpgFile, invalidFile } = files;
        const { uploadDialog, fileUploadSnackbar } = contentBrowserPage;
        const { propertiesEditor } = uploadDialog;

        await test.step('Navigate to folder and add multiple documents for upload', async () => {
            await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);

            await contentBrowserPage.dragAndDropFilesToUpload([txtFile, pdfFile, jpgFile, invalidFile]);

            await expect.soft(uploadDialog.getChild('')).toBeVisible();
            await expect.soft(uploadDialog.tableRowLocator).toContainText([txtFile.title, pdfFile.title, jpgFile.title, invalidFile.title]);
        });

        await test.step('Select all files', async () => {
            await uploadDialog.checkboxLocator.first().click();

            await expect.soft(propertiesEditor.locationPickerLocator).toBeVisible();
            await expect.soft(propertiesEditor.categoryPickerLocator).toBeVisible();
            await expect.soft(propertiesEditor.saveButtonLocator).toBeDisabled();
            await expect.soft(uploadDialog.submitButtonLocator).toBeDisabled();
        });

        await test.step('Assign category', async () => {
            await propertiesEditor.categoryPickerLocator.click();
            await propertiesEditor.getCategoryOption('SysFile').click();

            await expect.soft(propertiesEditor.saveButtonLocator).toBeEnabled();
            await expect.soft(uploadDialog.submitButtonLocator).toBeDisabled();

            await propertiesEditor.saveButtonLocator.click();

            await expect.soft(propertiesEditor.toastLocator).toBeVisible();
            await expect.soft(propertiesEditor.toastLocator).toContainText(' Properties assigned ');
            await expect.soft(uploadDialog.submitButtonLocator).toBeEnabled();
        });

        await test.step('Remove 1 file', async () => {
            await uploadDialog.clearSelectionButtonLocator.click();
            await uploadDialog.checkboxLocator.last().click();
            await uploadDialog.deleteButtonLocator.click();

            await expect.soft(uploadDialog.tableRowLocator).toContainText([txtFile.title, pdfFile.title, jpgFile.title]);
            await expect.soft(uploadDialog.getTableRowFileTitle(invalidFile.title)).not.toBeVisible();
        });

        await test.step('Upload documents', async () => {
            await uploadDialog.submitButtonLocator.click();

            await expect.soft(uploadDialog.getChild('')).not.toBeVisible();
            await expect.soft(fileUploadSnackbar.getChild('')).toBeVisible();
            await expect.soft(fileUploadSnackbar.fileNamesLocator).toContainText([txtFile.title, pdfFile.title, jpgFile.title]);
            await expect.soft(fileUploadSnackbar.getUploadStatus('Upload successful')).toHaveCount(3);
            await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName(txtFile.title)).toBeVisible();
            await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName(pdfFile.title)).toBeVisible();
            await expect(contentBrowserPage.hxpDatatableBody.getRowByName(jpgFile.title)).toBeVisible();
        });
    });
});
