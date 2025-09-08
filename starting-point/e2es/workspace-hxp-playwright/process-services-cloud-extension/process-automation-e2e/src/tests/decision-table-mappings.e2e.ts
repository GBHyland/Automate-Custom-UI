/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, ProcessInstanceDataEntry, UtilRandom, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Decision table', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const { decisionStringProcess, decisionIntegerProcess, decisionBooleanProcess, decisionDateProcess, decisionMultiProcess } = processes;
    let processInstance: ProcessInstanceDataEntry;
    let processName: string;

    const tests = [
        {
            testId: 'XAT-1229',
            mappingParameter: 'string',
            process: decisionStringProcess,
            outputText: 'hello',
            outputNumber: '11',
            outputDate: '2019-09-26',
        },
        {
            testId: 'XAT-1230',
            mappingParameter: 'integer',
            process: decisionIntegerProcess,
            outputText: 'hi',
            outputNumber: '22',
            outputDate: '2019-09-26',
        },
        {
            testId: 'XAT-1231',
            mappingParameter: 'boolean',
            process: decisionBooleanProcess,
            outputText: 'hi',
            outputNumber: '11',
            outputDate: '2019-09-26',
        },
        {
            testId: 'XAT-1232',
            mappingParameter: 'date',
            process: decisionDateProcess,
            outputText: 'hi',
            outputNumber: '11',
            outputDate: '2019-09-27',
        },
    ];

    test.beforeEach(async ({ processDetailsPage }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    for (const { testId, mappingParameter, process, outputText, outputNumber, outputDate } of tests) {
        test(`[${testId}] Should display the decision ${mappingParameter} output right after processing the decision task`, async ({
            runtimeBundleServiceHrUser,
            processDetailsPage,
            taskDetailsPage,
            queryServiceHrUser,
        }) => {
            processName = `[${testId}]-process-${mappingParameter}-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
            ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(process.processDefinitionKey, {
                name: processName,
            }));
            await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
                filters: {
                    name: processName,
                },
            });
            await processDetailsPage.navigate({ query: processInstance.id });

            await test.step('Fill input values', async () => {
                await processDetailsPage.dataTable.getRowByName('inputtask').click();
                await taskDetailsPage.taskForm.getFieldInputByIdLocator('inputText').fill('hi');
                await taskDetailsPage.taskForm.getFieldInputByIdLocator('inputNumber').fill('11');
                await taskDetailsPage.taskForm.getFieldInputByIdLocator('inputDate').fill('2019-09-26');
                await taskDetailsPage.taskForm.completeButtonLocator.click();
                await taskDetailsPage.spinner.waitForReload();
            });

            await test.step('Check output values', async () => {
                await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({
                    processInstanceId: processInstance.id,
                    name: process.processTasks.outputTask,
                });

                await processDetailsPage.navigate({ query: processInstance.id });
                await processDetailsPage.dataTable.getRowByName('outputtask').click();

                await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputText')).toHaveValue(outputText);
                await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputNumber')).toHaveValue(outputNumber);
                await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputDate')).toHaveValue(outputDate);
                if (mappingParameter === 'boolean') {
                    await expect(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputCheckbox')).toBeChecked();
                } else {
                    await expect(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputCheckbox')).not.toBeChecked();
                }
            });
        });
    }

    test('[XAT-16407] Should display the decision outputs without mapping when inputs are different than mapping', async ({
        runtimeBundleServiceHrUser,
        processDetailsPage,
        taskDetailsPage,
        queryServiceHrUser,
    }) => {
        processName = `[XAT-16407]-process-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(decisionMultiProcess.processDefinitionKey, {
            name: processName,
        }));
        await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
            filters: {
                name: processName,
            },
        });
        await processDetailsPage.navigate({ query: processInstance.id });

        await test.step('Fill input values', async () => {
            await processDetailsPage.dataTable.getRowByName('inputtask').click();
            await taskDetailsPage.taskForm.getFieldInputByIdLocator('inputText').fill('not matching text');
            await taskDetailsPage.taskForm.getFieldInputByIdLocator('inputNumber').fill('11');
            await taskDetailsPage.taskForm.getFieldInputByIdLocator('inputDate').fill('2019-09-26');
            await taskDetailsPage.taskForm.completeButtonLocator.click();
            await taskDetailsPage.spinner.waitForReload();
        });

        await test.step('Check output values', async () => {
            await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({
                processInstanceId: processInstance.id,
                name: decisionMultiProcess.processTasks.outputTask,
            });

            await processDetailsPage.navigate({ query: processInstance.id });
            await processDetailsPage.dataTable.getRowByName('outputtask').click();

            await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputText')).toHaveValue('not matching text');
            await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputNumber')).toHaveValue('11');
            await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputDate')).toHaveValue('2019-09-26');
            await expect(taskDetailsPage.taskForm.getFieldInputByIdLocator('outputCheckbox')).not.toBeChecked();
        });
    });
});
