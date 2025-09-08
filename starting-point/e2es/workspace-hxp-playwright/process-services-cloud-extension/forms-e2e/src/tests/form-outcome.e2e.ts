/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.describe('Form outcomes', () => {
    test.use({ storageState: getUserState('hruser') });

    const expectedSnackbarMessage = 'The task has been completed';
    let processInstance: ProcessInstanceDataEntry;

    test.beforeEach(async ({ processDetailsPage }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test(`[XAT-16849] Should be able to display form outcome buttons according to the visibility conditions`, async ({
        processDetailsPage,
        runtimeBundleServiceHrUser,
        taskDetailsPage,
    }) => {
        const { formOutcomesProcess } = HXP_APPS.SYS_WORKSPACE.processes;
        const { textInputId } = formOutcomesProcess.form.formWidgets;
        const buttonWithoutAnswers = 'You should answer the question';
        const invalidAnswer = 'bat';
        const invalidAnswerButtonName = 'Invalid answer';
        const validAnswer = 'cat';
        const validAnswerButtonName = 'Valid answer';

        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(formOutcomesProcess.processDefinitionKey));
        await processDetailsPage.navigate({ query: processInstance.id });

        await test.step('Navigate to the first task and verify that the relevant outcome is visible when no data is provided', async () => {
            await processDetailsPage.dataTable.getRowByName(formOutcomesProcess.userTask.name).click();

            await expect.soft(taskDetailsPage.taskForm.getActionButtonLocator(buttonWithoutAnswers)).toBeVisible();
        });

        await test.step('Provide data and verify visible form outcomes', async () => {
            await taskDetailsPage.taskForm.getFieldInputByIdLocator(textInputId).fill(invalidAnswer);

            await expect.soft(taskDetailsPage.taskForm.getActionButtonLocator(invalidAnswerButtonName)).toBeVisible();

            await taskDetailsPage.taskForm.getFieldInputByIdLocator(textInputId).fill(validAnswer);

            await expect.soft(taskDetailsPage.taskForm.getActionButtonLocator(validAnswerButtonName)).toBeVisible();
        });

        await test.step('Complete the task using custom outcome button', async () => {
            await taskDetailsPage.taskForm.getActionButtonLocator(validAnswerButtonName).click();

            await expect(taskDetailsPage.snackBar.message).toHaveText(expectedSnackbarMessage);
        });
    });

    test(`[XAT-16765] Should be able to complete a form without validation`, async ({
        processDetailsPage,
        runtimeBundleServiceHrUser,
        taskDetailsPage,
    }) => {
        const { skipFormValidation } = HXP_APPS.SYS_WORKSPACE.processes;
        const { textInputId, decimalInputId, amountInputId } = skipFormValidation.form.formWidgets;
        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(skipFormValidation.processDefinitionKey));

        await test.step('Navigate to user task', async () => {
            await processDetailsPage.navigate({ query: processInstance.id });
            await processDetailsPage.dataTable.getRowByName(skipFormValidation.userTask.name).click();
        });

        await test.step('Provide invalid data', async () => {
            const tooLongText = 'text that is too long';
            const invalidDecimal = '7.7';
            const invalidAmount = '6.8';

            await taskDetailsPage.taskForm.getFieldInputByIdLocator(textInputId).fill(tooLongText);
            await taskDetailsPage.taskForm.getFieldInputByIdLocator(decimalInputId).fill(invalidDecimal);
            await taskDetailsPage.taskForm.getFieldInputByIdLocator(amountInputId).fill(invalidAmount);
        });

        await test.step('Complete the form using custom outcome button without form validation', async () => {
            await taskDetailsPage.taskForm.getActionButtonLocator('Terminate').click();

            await expect(taskDetailsPage.snackBar.message).toHaveText(expectedSnackbarMessage);
        });
    });
});
