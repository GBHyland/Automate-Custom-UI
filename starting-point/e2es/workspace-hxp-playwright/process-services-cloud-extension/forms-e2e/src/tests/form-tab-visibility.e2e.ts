/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Visibility conditions - form tab section', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const { processWithTabVisibility } = processes;
    let processInstance: ProcessInstanceDataEntry;

    test.beforeEach(async ({ processDetailsPage, runtimeBundleServiceHrUser, queryServiceHrUser }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);
        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(processWithTabVisibility.processDefinitionKey));
        const { entry: task } = await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({ processInstanceId: processInstance.id });
        await runtimeBundleServiceHrUser.tasks.claimTask(task.id, 'hruser');
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test('[XAT-16929] Should be able to display form tab according to the visibility conditions', async ({ processDetailsPage, taskDetailsPage }) => {
        const { tabs } = processWithTabVisibility.form;
        const displayTabCondition = 'showTab';
        const inputNumberTwo = '123';

        await test.step('Navigate to the user task', async () => {
            await processDetailsPage.navigate({ query: processInstance.id });
            await processDetailsPage.dataTable.getRowByName(processWithTabVisibility.userTask.name).click();
        });

        await test.step('Verify the form tabs are visible without conditional', async () => {
            await expect.soft(taskDetailsPage.taskForm.getAllTabHeaderElements).toContainText([tabs.tabWithFields, tabs.tabBasicVarVar]);
        });

        await test.step('Verify the form tab is visible when the visibility condition is met', async () => {
            await taskDetailsPage.taskForm.getFieldInputByIdLocator(processWithTabVisibility.form.formWidgets.inputTextOne).fill(displayTabCondition);

            await expect
                .soft(taskDetailsPage.taskForm.getAllTabHeaderElements)
                .toContainText([tabs.tabWithFields, tabs.tabBasicVarField, tabs.tabBasicVarVar]);
        });

        await test.step('Fill the form and complete the task', async () => {
            await taskDetailsPage.taskForm.getTabHeaderElement(tabs.tabBasicVarField).click();
            await taskDetailsPage.taskForm.getFieldInputByIdLocator(processWithTabVisibility.form.formWidgets.inputNumberOne).fill(inputNumberTwo);
            await taskDetailsPage.taskForm.getActionButtonLocator('Complete').click();
        });

        await test.step('Verify the task form output', async () => {
            await processDetailsPage.navigate({ query: processInstance.id });
            await processDetailsPage.dataTable.getRowByName(processWithTabVisibility.userTask.name).click();
            await taskDetailsPage.taskForm.getTabHeaderElement(tabs.tabBasicVarField).click();

            await expect
                .soft(taskDetailsPage.taskForm.getAllTabHeaderElements)
                .toContainText([tabs.tabWithFields, tabs.tabBasicVarField, tabs.tabBasicVarVar]);
            await expect(taskDetailsPage.taskForm.getFieldInputByIdLocator(processWithTabVisibility.form.formWidgets.inputNumberOne)).toHaveValue(
                inputNumberTwo
            );
        });
    });
});
