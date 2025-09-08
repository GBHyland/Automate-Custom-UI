/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS, ProcessInstanceDataEntry, UtilRandom, files, Document } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('File Viewer and Metadata Viewer', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const testFile = files.pdfFile;
    const testProcess = processes.attachLocalWithViewers;
    const formWidgets = testProcess.form.formWidgets;

    let processInstance: ProcessInstanceDataEntry;
    let destinationFolder: Document;
    let destinationFolderName: string;

    test.beforeEach(async ({ processDetailsPage, runtimeBundleServiceHrUser, hxprApi, queryServiceHrUser }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);

        destinationFolder = await hxprApi.documentServiceApi.createFolder(`pw-e2e-folder-${UtilRandom.generateTimeStamp()}`, 'folder description');

        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', destinationFolder, 'Everything');

        destinationFolderName = destinationFolder.sys_title;
        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(testProcess.processDefinitionKey, {
            name: `pw-e2e-attach-file-${UtilRandom.generateTimestampWithAlphaLowerCase(3)}`,
            variables: { processContentPath: { uri: `hxpr:/path/${destinationFolderName}` } },
        }));

        await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
            filters: {
                name: processInstance.name,
            },
        });
        await processDetailsPage.navigate({ query: processInstance.id });
        await processDetailsPage.dataTable.waitForRootElement();
        await processDetailsPage.dataTable.getRowByName(testProcess.userTaskName).click();
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser, hxprApi }) => {
        await hxprApi.documentServiceApi.teardown();
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(processInstance.id);
    });

    test('[C694020] Attached file should be visible in file and metadata viewers', async ({ taskDetailsPage }) => {
        const attachFileWidget = 'Attach file';
        const attachFileButtonIdLocator = `#${formWidgets.attachFileWidgetId}`;

        await taskDetailsPage.openAttachmentFormById(attachFileButtonIdLocator);
        await taskDetailsPage.attachFileDialog.attachFileFromLocal(testFile.path);

        await expect
            .soft(await taskDetailsPage.taskForm.getMetadataViewerLocator(formWidgets.metadataViewerId).getByLabel('Name'))
            .toHaveValue(testFile.title);
        await expect.soft(taskDetailsPage.taskForm.getFieldByLabelLocator(attachFileWidget)).toContainText(testFile.title);
        await expect.soft(taskDetailsPage.taskForm.getPdfViewerControlPanelLocator(formWidgets.fileViewerId)).toBeVisible();

        await taskDetailsPage.taskForm.getPdfViewerControlPanelScaleButtonLocator(formWidgets.fileViewerId).click();

        await expect.soft(taskDetailsPage.taskForm.getPdfViewerControlPanelScaleLocator(formWidgets.fileViewerId)).toHaveText('100%');
        await expect(taskDetailsPage.taskForm.getPdfViewerDocumentLocator(formWidgets.fileViewerId)).toContainText('A sample PDF file');
    });
});
