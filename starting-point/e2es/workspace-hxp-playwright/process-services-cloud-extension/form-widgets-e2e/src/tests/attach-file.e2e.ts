/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, ProcessInstanceDataEntry, Document, UtilRandom, getUserState, timeouts, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Attach File from Local and/or Content', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const attachFileProcess = processes.attachFilesTask;

    let attachFileProcessInstance: ProcessInstanceDataEntry;
    let destinationFolder: Document;
    let destinationFolderName: string;
    let preUploadedFileName: string;

    test.beforeEach(async ({ processDetailsPage, runtimeBundleServiceHrUser, hxprApi, queryServiceHrUser }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);

        destinationFolder = await hxprApi.documentServiceApi.createFolder(`pw-e2e-folder-${UtilRandom.generateTimeStamp()}`, 'folder description');

        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', destinationFolder, 'Everything');
        await hxprApi.uploadServiceApi.uploadFile(files.txtFile, destinationFolder.sys_id);

        destinationFolderName = destinationFolder.sys_title;
        preUploadedFileName = files.txtFile.title;
        ({ entry: attachFileProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            attachFileProcess.processDefinitionKey,
            {
                name: `pw-e2e-attach-file-${UtilRandom.generateTimestampWithAlphaLowerCase(3)}`,
                variables: { processContentPath: { uri: `hxpr:/path/${destinationFolderName}` } },
            }
        ));

        await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
            filters: {
                name: attachFileProcessInstance.name,
            },
        });
        await processDetailsPage.navigate({ query: attachFileProcessInstance.id });
        await processDetailsPage.dataTable.waitForRootElement();
        await processDetailsPage.dataTable.getRowByNumber(1).click();
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser, hxprApi }) => {
        await hxprApi.documentServiceApi.teardown();
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(attachFileProcessInstance.id);
    });

    test('[XAT-17757] Should be able to upload and attach a single file from Local', async ({ taskDetailsPage }) => {
        const testWidget = attachFileProcess.form.formWidgets.singleFileLocal;
        const expectedUploadedFilesNumber = 'Uploaded 1 / 1';

        await taskDetailsPage.openAttachmentFormByName(testWidget);
        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(preUploadedFileName).isVisible();

        await expect.soft(taskDetailsPage.attachFileDialog.getBreadcrumbsLocator).toHaveText(destinationFolderName);

        await taskDetailsPage.attachFileDialog.switchToTab('Local storage');
        await taskDetailsPage.attachFileDialog.uploadFile(files.pdfFile.path);
        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(files.pdfFile.title).isVisible();

        await expect.soft(taskDetailsPage.attachFileDialog.getUploadedFilesNumberLocator).toContainText(expectedUploadedFilesNumber);

        await taskDetailsPage.attachFileDialog.switchToTab('Repository');

        await expect(taskDetailsPage.dataTable.contentRowLocator).toHaveCount(2);

        await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(files.pdfFile.title).click();
        await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(preUploadedFileName).click();

        await expect.soft(taskDetailsPage.attachFileDialog.getAttachButtonLocator).toBeDisabled();

        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(files.pdfFile.title).click();
        await taskDetailsPage.attachFileDialog.getAttachButtonLocator.click();

        await expect(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).toContainText(files.pdfFile.title);
    });

    test('[XAT-17885] Should be able to upload and attach a single file from Content', async ({ taskDetailsPage }) => {
        const testWidget = attachFileProcess.form.formWidgets.singleFileContent;

        await taskDetailsPage.openAttachmentFormByName(testWidget);

        await expect.soft(taskDetailsPage.dataTable.contentRowLocator).toHaveCount(1);
        await expect.soft(taskDetailsPage.attachFileDialog.getTabLocator('Local storage')).toBeDisabled();

        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(preUploadedFileName).click();
        await taskDetailsPage.attachFileDialog.getAttachButtonLocator.click();

        await expect(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).toContainText(preUploadedFileName);
    });

    test('[XAT-17886] Should be able to upload and attach multiple files from Local and Content', async ({ taskDetailsPage }) => {
        const testWidget = attachFileProcess.form.formWidgets.multipleFilesLocalContent;
        const expectedUploadedFilesNumber = 'Uploaded 2 / 2';

        await taskDetailsPage.openAttachmentFormByName(testWidget);
        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(preUploadedFileName).isVisible();
        await taskDetailsPage.attachFileDialog.switchToTab('Local storage');
        await taskDetailsPage.attachFileDialog.uploadFile([files.pdfFile.path, files.docFile.path]);
        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(files.pdfFile.title).isVisible();
        await taskDetailsPage.attachFileDialog.dataTable.getRowByName(files.docFile.title).isVisible();

        await expect.soft(taskDetailsPage.attachFileDialog.getUploadedFilesNumberLocator).toContainText(expectedUploadedFilesNumber);

        await taskDetailsPage.attachFileDialog.switchToTab('Repository');

        await expect(taskDetailsPage.dataTable.contentRowLocator).toHaveCount(3);

        await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(files.pdfFile.title).click();
        await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(files.docFile.title).click();
        await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(preUploadedFileName).click();

        expect.soft(await taskDetailsPage.attachFileDialog.dataTable.getRowByName(files.pdfFile.title).getAttribute('aria-selected')).toBeTruthy();
        expect.soft(await taskDetailsPage.attachFileDialog.dataTable.getRowByName(files.docFile.title).getAttribute('aria-selected')).toBeTruthy();
        expect.soft(await taskDetailsPage.attachFileDialog.dataTable.getRowByName(preUploadedFileName).getAttribute('aria-selected')).toBeTruthy();

        await taskDetailsPage.attachFileDialog.getAttachButtonLocator.click();

        await expect.soft(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).toContainText(files.pdfFile.title);
        await expect.soft(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).toContainText(files.docFile.title);
        await expect(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).toContainText(preUploadedFileName);
    });

    test.describe('Actions on attached file', () => {
        let testWidget: string;

        test.beforeEach(async ({ taskDetailsPage, hxprApi }) => {
            testWidget = attachFileProcess.form.formWidgets.multipleFilesLocalContent;

            await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, destinationFolder.sys_id);
            await taskDetailsPage.page.waitForTimeout(timeouts.medium);
            await taskDetailsPage.openAttachmentFormByName(testWidget);
            await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(preUploadedFileName).click();
            await taskDetailsPage.attachFileDialog.dataTable.getCheckboxForElement(files.pdfFile.title).click();
            await taskDetailsPage.attachFileDialog.getAttachButtonLocator.click();
        });

        test('[XAT-17887] Should be able to view, download and remove attached file', async ({ taskDetailsPage }) => {
            await taskDetailsPage.performActionOnAttachedFile(testWidget, files.pdfFile.title, 'View');
            await taskDetailsPage.filePreview.waitForRootElement();

            await expect.soft(taskDetailsPage.filePreview.getFileNameLocator).toHaveText(files.pdfFile.title);

            await taskDetailsPage.filePreview.getCloseButtonLocator.click();
            const downloadedFilePath = await taskDetailsPage.downloadAttachedFile(testWidget, files.pdfFile.title);

            expect.soft(downloadedFilePath).not.toEqual(null);

            await taskDetailsPage.performActionOnAttachedFile(testWidget, files.pdfFile.title, 'Remove');

            await expect.soft(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).toContainText(preUploadedFileName);
            await expect(taskDetailsPage.taskForm.getFieldByLabelLocator(testWidget)).not.toContainText(files.pdfFile.title);
        });
    });
});
