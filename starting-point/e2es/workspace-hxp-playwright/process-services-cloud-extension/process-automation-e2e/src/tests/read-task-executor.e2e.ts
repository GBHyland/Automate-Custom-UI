/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, getUserState, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Read task executor', () => {
    const taskExecutorProcess = HXP_APPS.SYS_WORKSPACE.processes.taskExecutorRead;
    let processInstance: ProcessInstanceDataEntry;

    test.beforeEach(async ({ runtimeBundleServiceHrUser, processDetailsPage, queryServiceHrUser }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);

        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(taskExecutorProcess.processDefinitionKey));
        await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({ processInstanceId: processInstance.id });

        await processDetailsPage.openProcessTaskByName(processInstance, 'pick process');
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test('[C692527] Should pass manually mapped system variable', async ({ taskDetailsPage, processDetailsPage }) => {
        await taskDetailsPage.taskForm.dropdown.selectOptionById('manual');
        await taskDetailsPage.taskForm.completeButtonLocator.click();

        await processDetailsPage.openProcessTaskByName(processInstance, taskExecutorProcess.processTasks.manualWrite);
        await taskDetailsPage.taskForm.completeButtonLocator.click();

        await processDetailsPage.openProcessTaskByName(processInstance, taskExecutorProcess.processTasks.manualRead);

        await expect.soft(taskDetailsPage.taskForm.getChild(taskExecutorProcess.formElements.automaticMappingInput.id)).toHaveValue('');
        await expect(taskDetailsPage.taskForm.getChild(taskExecutorProcess.formElements.manualMappingInput.id)).toHaveValue('hruser');
    });

    test('[C692528] Should pass automatically mapped system variable', async ({ taskDetailsPage, processDetailsPage }) => {
        await taskDetailsPage.taskForm.dropdown.selectOptionById('automatic');
        await taskDetailsPage.taskForm.completeButtonLocator.click();

        await processDetailsPage.openProcessTaskByName(processInstance, taskExecutorProcess.processTasks.automaticWrite);
        await taskDetailsPage.taskForm.completeButtonLocator.click();

        await processDetailsPage.openProcessTaskByName(processInstance, taskExecutorProcess.processTasks.automaticRead);

        await expect.soft(taskDetailsPage.taskForm.getChild(taskExecutorProcess.formElements.manualMappingInput.id)).toHaveValue('');
        await expect(taskDetailsPage.taskForm.getChild(taskExecutorProcess.formElements.automaticMappingInput.id)).toHaveValue('hruser');
    });
});
