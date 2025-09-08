/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

test.describe('Display external property widget', () => {
    test.use({ storageState: getUserState('hruser') });

    const { displayExternalPropertyProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const hruserData = {
        firstName: 'hr',
        username: 'hruser',
    };
    let runningProcess: ProcessInstanceDataEntry;

    test.beforeEach(async ({ tasksPage }) => {
        await tasksPage.navigate();
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(runningProcess.id);
    });

    test('[XAT-477] Should be able to view values in DisplayExternalProperty widget', async ({
        tasksPage,
        startProcessPage,
        taskDetailsPage,
        queryServiceHrUser,
        runtimeBundleServiceHrUser,
    }) => {
        await test.step('Open the start process form', async () => {
            await tasksPage.pageLayoutHeaderComponent.startProcessButton.click();
            await tasksPage.startProcessDialog.selectProcess(displayExternalPropertyProcess.processName);
        });

        await test.step('Check user data on start event', async () => {
            const firstNameFormField = startProcessPage.taskForm.getFieldInputByIdLocator(
                displayExternalPropertyProcess.formElements.currentUserFirstName.id
            );

            await expect.soft(firstNameFormField).toHaveValue(hruserData.firstName);
        });

        await test.step('Start the process', async () => {
            await startProcessPage.startProcessFooter.startProcessButton.click();

            await expect.soft(tasksPage.snackBar.message).toContainText('Process created');

            await tasksPage.snackBar.closeSnackBar('Process created');

            ({ entry: runningProcess } = await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
                filters: {
                    processDefinitionName: displayExternalPropertyProcess.processName,
                    status: 'RUNNING',
                },
            }));
        });

        await test.step('Check user data on user task', async () => {
            const userTasks = await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(runningProcess.id);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
            const lastNameFormField = taskDetailsPage.taskForm.getFieldInputByIdLocator(
                displayExternalPropertyProcess.formElements.currentUserUsername.id
            );

            await expect.soft(lastNameFormField).toHaveValue(hruserData.username);
        });
    });
});
