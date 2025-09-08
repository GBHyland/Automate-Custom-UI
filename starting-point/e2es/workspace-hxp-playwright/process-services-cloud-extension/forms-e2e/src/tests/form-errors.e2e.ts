/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, getUserState, UtilRandom, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Form errors shown when incorrect variable mapping', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const processesToTest = [
        {
            testDescription: '[XAT-1209] Should not be able to display form variables if name is incorrect',
            process: processes.formErrorsProcess,
        },
        {
            testDescription: '[XAT-1207] Should not be able to display form variables if path is incorrect',
            process: processes.formErrorsFromInvalidPathProcess,
        },
        {
            testDescription: '[XAT-1208] Should not be able to display form variables if id is incorrect',
            process: processes.formErrorsFromInvalidIDProcess,
        },
    ];

    processesToTest.forEach(({ testDescription, process }) => {
        let formErrorsProcessInstance: ProcessInstanceDataEntry;

        test.beforeEach(async ({ runtimeBundleServiceHrUser, queryServiceHrUser }) => {
            const processName = `${process.processName}-${UtilRandom.generateAlphaLowerCase(5)}`;
            ({ entry: formErrorsProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(process.processDefinitionKey, {
                name: processName,
            }));
            await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({ processInstanceId: formErrorsProcessInstance.id });
        });

        test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
            await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(formErrorsProcessInstance.id);
        });

        test(testDescription, async ({ taskDetailsPage, processDetailsPage }) => {
            await test.step('Verify error appears on form', async () => {
                await processDetailsPage.openProcessTaskByName(formErrorsProcessInstance, process.userTask.name);
                const expectedErrorMessage = 'There was a problem loading dropdown elements. Please contact administrator.';
                const errorMessageElement = taskDetailsPage.taskForm.getErrorMessageLocator();

                await expect.soft(errorMessageElement).toHaveText(expectedErrorMessage);
            });

            await test.step('Click on dropdown and verify no dropdown options appear', async () => {
                await taskDetailsPage.taskForm.dropdown.executorDropdownLocator.click();
                const dropdownOptions = taskDetailsPage.taskForm.dropdown.dropdownOptionsLocator;

                await expect.soft(dropdownOptions).toHaveCount(0);
            });

            await test.step('Complete Task and Verify dropdown is disabled', async () => {
                await taskDetailsPage.taskForm.completeButtonLocator.click();
                await processDetailsPage.openProcessTaskByName(formErrorsProcessInstance, process.userTask.name);
                const dropdownElement = taskDetailsPage.taskForm.dropdown.executorDropdownLocator;

                await expect(dropdownElement).toBeDisabled();
            });
        });
    });
});
