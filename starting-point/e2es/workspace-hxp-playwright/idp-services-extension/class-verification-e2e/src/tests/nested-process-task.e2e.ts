/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { Document } from '@hylandsoftware/hxcs-js-client/typings';
import { HXP_APPS, ProcessInstanceData, RequestResponse, getUserState, FeatureFlagsNames } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods } from '@hxp/playwright/workspace-hxp';
import { TEST_FILES } from '../resources';
const { startProcess, createFolder, cleanupFiles, findProcess, refreshUserState, waitForUserTask } = idpHelperMethods;

test.use({ storageState: getUserState('hruser') });

test.describe('Workspace IDP Tests - Nested tasks tests', () => {
    const { processes } = HXP_APPS.SYS_IDP_E2E;
    const { idpNestedProcess: testProcess } = processes;
    let uploadFolder: Readonly<Document>;
    let testFile: Readonly<Document>;
    let processInstance: ProcessInstanceData | RequestResponse | undefined;

    test.beforeAll(async ({ hxprApi, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        const folderData = await createFolder(hxprApi, [TEST_FILES.invoice1]);
        uploadFolder = folderData.uploadFolder;
        testFile = folderData.uploadedFiles[0];
    });

    test.afterAll(async ({ hxprApi }) => {
        await cleanupFiles(hxprApi, uploadFolder);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await refreshUserState(tasksPage, workerInfo);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
    });

    test(`[XAT-17922] A child process should be created from a nested one. A child task should be assigned. `, async ({
        runtimeBundleServiceHrUser: runtimeBundleService,
        queryServiceHrUser: queryService,
        idpClassificationPage,
        taskDetailsPage,
        page,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await startProcess(runtimeBundleService, [testFile], {
                processDefinitionKey: testProcess.processDefinitionKey,
                variables: testProcess.variables,
            });
        });
        const childProcess = await findProcess(queryService);
        const userTasks = await waitForUserTask(runtimeBundleService, childProcess.list.entries[0]);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await expect(idpClassificationPage.idpClassFooter.submitButton).toBeVisible();
        await idpClassificationPage.classificationHeader.goBackButton.click();

        await idpClassificationPage.contentSideNavbar.navigateTo('running-processes_filter');
        await expect(idpClassificationPage.dataTable.getRowByName('idp-nested-process').first()).toHaveCount(1);
        await idpClassificationPage.dataTable.getRowByName('idp-nested-process').click();
        await expect(page.locator('[data-automation-id="apa-cancel-process-button"]')).toBeVisible();
        expect(page.url()).toContain(processInstance.entry.id);

        await idpClassificationPage.contentSideNavbar.navigateTo('running-processes_filter');
        await expect(idpClassificationPage.dataTable.getRowByName('idp-child-process').first()).toHaveCount(1);
        await idpClassificationPage.dataTable.getRowByName('idp-child-process').click();
        await expect(page.locator('[data-automation-id="apa-cancel-process-button"]')).toBeVisible();
        expect(page.url()).toContain(childProcess.list.entries[0].entry.id);
    });
});
