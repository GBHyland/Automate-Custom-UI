/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { Document } from '@hylandsoftware/hxcs-js-client/typings';
import { FeatureFlagsNames, ProcessInstanceData, RequestResponse, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
import { BATCH_STATE_SNAPSHOTS } from '../resources';
import path from 'node:path';
const { waitForUserTask, deleteTestFolder } = idpHelperMethods;

test.use({ storageState: getUserState('hruser') });

test.describe('Workspace IDP Tests - Start IDP process', () => {
    let processInstance: ProcessInstanceData | RequestResponse | undefined;
    let batchRunner: IdpBatchStateSnapshotRunner;
    let classFolder: Document;

    test.beforeAll(async ({ hxprApi, skipOrExecuteTestBasedOnFlagStatus, idpBatchStateSnapshotInitializer }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.oneInvoice);
        const query = await hxprApi.queryServiceApi.getDocumentsByQuery("NAME:'classFolder'")[0];
        classFolder = query?.[0] ?? null;
        if (!classFolder) {
            classFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(
                'classFolder',
                'Folder description',
                'hr',
                'ReadWrite',
                '00000000-0000-0000-0000-000000000000',
                true
            );
        }
    });

    test.afterAll(async ({ hxprApi }) => {
        await deleteTestFolder(hxprApi, classFolder);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);
        await tasksPage.navigate({ waitUntil: 'load' });
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
        processInstance = undefined;
    });

    test(`[XAT-18126] Should be able to import documents in the classification review UI`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
        contentBrowserPage,
        page,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await expect(idpClassificationPage.classificationHeader.importDocumentsButton).toBeVisible();
        const filePath = path.resolve(__dirname, '../resources/files/pw-e2e-resume-1.pdf');
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            idpClassificationPage.classificationHeader.importDocumentsButton.click(),
        ]);
        await fileChooser.setFiles(filePath);
        await page.waitForTimeout(15000);
        await idpClassificationPage.idpClassFooter.submitButton.click();
        await contentBrowserPage.navigateToDocument(classFolder.sys_id);
        await contentBrowserPage.hxpDatatableBody.getRowByName(processInstance.entry.id).click();
        await expect.soft(contentBrowserPage.hxpDatatableBody.getRowByName('pw-e2e-resume-1')).toBeVisible();
    });
});
