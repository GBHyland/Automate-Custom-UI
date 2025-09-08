/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom, getUserState, ProcessInstanceDataEntry, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Refresh button tests', () => {
    const { simpleProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    let processPrefix: string;
    let runningProcessName: string;
    let runningProcessInstance: ProcessInstanceDataEntry;

    const updatedSnackbarMessage = 'The page has been refreshed';

    test.beforeEach(async ({}) => {
        processPrefix = UtilRandom.generateAlphaNumericLowerCase(5);
        runningProcessName = `${processPrefix}-running-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        for (const processInstance of [runningProcessInstance]) {
            await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
        }
    });

    test(`[XAT-17724] Should be able to refresh tasks list`, async ({ tasksPage, runtimeBundleServiceHrUser }) => {
        await tasksPage.navigate();
        const numberOfTaskOnTheList = await tasksPage.dataTable.pagination.getNumberOfRowsInTable();
        ({ entry: runningProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(simpleProcess.processDefinitionKey, {
            name: runningProcessName,
        }));
        await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(runningProcessInstance.id);
        await tasksPage.pageLayoutHeaderComponent.refreshButton.click();

        await expect.soft(tasksPage.snackBar.message).toHaveText(updatedSnackbarMessage);

        await tasksPage.page.waitForSelector(tasksPage.snackBar.messageLocator, { state: 'detached' });
        const numberOfTaskOnTheListAfterRefresh = await tasksPage.dataTable.pagination.getNumberOfRowsInTable();

        expect(numberOfTaskOnTheListAfterRefresh).toBeGreaterThan(numberOfTaskOnTheList);
    });

    test(`[XAT-17725] Should be able to refresh running process list`, async ({ processPage, runtimeBundleServiceHrUser }) => {
        await processPage.navigate();
        const numberOfProcessesOnTheList = await processPage.dataTable.pagination.getNumberOfRowsInTable();
        ({ entry: runningProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(simpleProcess.processDefinitionKey, {
            name: runningProcessName,
        }));
        await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(runningProcessInstance.id);
        await processPage.pageLayoutHeaderComponent.refreshButtonProcessesRunning.click();

        await expect.soft(processPage.snackBar.message).toHaveText(updatedSnackbarMessage);

        await processPage.page.waitForSelector(processPage.snackBar.messageLocator, { state: 'detached' });
        const numberOfProcessesOnTheListAfterRefresh = await processPage.dataTable.pagination.getNumberOfRowsInTable();

        expect(numberOfProcessesOnTheListAfterRefresh).toBeGreaterThan(numberOfProcessesOnTheList);
    });
});
