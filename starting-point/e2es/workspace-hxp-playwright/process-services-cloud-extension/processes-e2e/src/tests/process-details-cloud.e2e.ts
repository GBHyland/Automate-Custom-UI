/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, getUserState, ProcessInstanceDataEntry, TaskDataEntry, UtilRandom } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Process details cloud', () => {
    const { SYS_WORKSPACE: testApp } = HXP_APPS;
    const { decisionStringProcess: testProcess } = testApp.processes;
    let testProcessName: string;
    let runningProcess: ProcessInstanceDataEntry;
    let userTask: TaskDataEntry;

    test.beforeEach(async ({ runtimeBundleServiceHrUser, queryServiceHrUser, processPage }, workerInfo) => {
        await processPage.refreshUserState('hruser', workerInfo.project.use);

        testProcessName = `${testProcess.processName}-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
        await runtimeBundleServiceHrUser.processInstance.startProcess(testProcess.processDefinitionKey, { name: testProcessName });
        ({ entry: runningProcess } = await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
            filters: {
                name: testProcessName,
            },
        }));
        ({ entry: userTask } = await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({ processInstanceId: runningProcess.id }));
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(runningProcess.id);
    });

    test('[XAT-17284] Should be able to navigate to process details page with “View details” context menu option', async ({
        processDetailsPage,
        runtimeBundleServiceHrUser,
        processPage,
    }) => {
        await test.step('Complete the first task and navigate to running processes with filters', async () => {
            await runtimeBundleServiceHrUser.tasks.completeTask(userTask.id);
            await processPage.navigate({
                query:
                    `?appName=${testApp.appName}&processName=${testProcessName}` +
                    `&initiator=hruser&sort=startDate&order=DESC&processDefinitionName=${testProcess.processName}`,
            });
            await processPage.dataTable.waitForRootElement();
        });

        await test.step('Navigate to process details page with "View Details" option', async () => {
            await processPage.dataTable.getRowByName(testProcessName).click({ button: 'right' });
            await processPage.dataTable.contextMenuActions.getViewDetailsButtonLocator.click();
            await processDetailsPage.dataTable.waitForRootElement();

            await expect.soft(processDetailsPage.dataTable.getRowByAriaLabel(testProcess.processTasks.inputTask)).toBeVisible();
            await expect(processDetailsPage.dataTable.getRowByAriaLabel(testProcess.processTasks.outputTask)).toBeVisible();
        });
    });

    test('[XAT-17285] Should be able to navigate to process details page with process instance id in task info drawer', async ({
        processDetailsPage,
        taskDetailsPage,
    }) => {
        await test.step('Navigate to task details page with "View Details" option', async () => {
            await processDetailsPage.navigate({ query: `${runningProcess.id}` });
            await processDetailsPage.dataTable.getRowByAriaLabel(testProcess.processTasks.inputTask).click({ button: 'right' });
            await processDetailsPage.dataTable.contextMenuActions.getViewDetailsButtonLocator.click();
            await taskDetailsPage.taskForm.waitForRootElement();

            await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('inputText')).toBeVisible();
            await expect.soft(taskDetailsPage.infoDrawer.getInputByTitleLocator('Process instance id')).toBeHidden();
        });

        await test.step('Navigate to process details page with process instance id in task info drawer', async () => {
            await taskDetailsPage.taskHeader.infoDrawerIconLocator.click();
            await taskDetailsPage.infoDrawer.getInputByTitleLocator('Process instance id').click();
            await processDetailsPage.dataTable.waitForRootElement();

            expect(processDetailsPage.page.url()).toContain(`process-details-cloud?processInstanceId=${runningProcess.id}`);
        });
    });
});
