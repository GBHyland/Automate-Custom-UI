/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessManagementLabels } from '@hxp/playwright/workspace-hxp';
import { test, expect } from '../fixtures/page-initialization';
import { getUserState, UtilRandom, ProcessInstanceDataEntry, HXP_APPS } from '@alfresco-dbp/playwright/shared';

test.use({ storageState: getUserState('hruser') });
test.describe('My tasks custom columns selector', () => {
    const { withDisplayedVariables, withDisplayedVariablesSecond } = HXP_APPS.SYS_WORKSPACE.processes;
    const withDisplayedVarFirstName = `with-displayed-var-${UtilRandom.generateRandomString(5)}}-first`;
    const withDisplayedVarSecondName = `with-displayed-var-${UtilRandom.generateRandomString(5)}}-second`;

    let withDisplayedVarFirstProcess: ProcessInstanceDataEntry;
    let withDisplayedVarSecondProcess: ProcessInstanceDataEntry;

    test.beforeAll(async ({ runtimeBundleServiceHrUser }) => {
        ({ entry: withDisplayedVarFirstProcess } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            withDisplayedVariables.processDefinitionKey,
            { name: withDisplayedVarFirstName }
        ));
        ({ entry: withDisplayedVarSecondProcess } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            withDisplayedVariablesSecond.processDefinitionKey,
            { name: withDisplayedVarSecondName }
        ));

        await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(withDisplayedVarFirstProcess.id);
        await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(withDisplayedVarSecondProcess.id);
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(withDisplayedVarFirstProcess.id, withDisplayedVarSecondProcess.id);
    });

    test(`[XAT-16816] Should show process variables columns in task datatable`, async ({ processPage, tasksPage, preferenceMock }) => {
        const withDisplayedVariablesVariables = Object.keys(withDisplayedVariables.variables).map(
            (element) => withDisplayedVariables.variables[element]
        );
        const withDisplayedVariablesSecondVariables = Object.keys(withDisplayedVariablesSecond.variables).map(
            (element) => withDisplayedVariablesSecond.variables[element]
        );
        const allVariables = [...withDisplayedVariablesVariables, ...withDisplayedVariablesSecondVariables];

        await test.step('Mock the preferences for the columns visibility', async () => {
            const columnHeaders = <string[]>allVariables.map((element) => `${element.columnHeader}/${element.variableId}`);

            await processPage.navigate({ waitUntil: 'networkidle' });

            await preferenceMock.mockCloudColumnsVisibility(columnHeaders, 'tasks-list-cloud-columns-visibility');
            await processPage.contentSideNavbar.navigateTo(ProcessManagementLabels.MyTasks);
            await tasksPage.dataTable.waitForRootElement();
        });

        await test.step('Filter out the tasks by name', async () => {
            await tasksPage.applyFilter('string', { filterName: 'Task Name', value: 'displayed-var' });
        });

        await test.step('Verify the columns are displayed with the proper values', async () => {
            for (const variable of withDisplayedVariablesVariables) {
                await expect(tasksPage.dataTable.getRowByColumnTitleAndItsCellValue(variable.columnHeader, variable.value).first()).toBeVisible();
            }

            for (const variable of withDisplayedVariablesSecondVariables) {
                await expect(tasksPage.dataTable.getRowByColumnTitleAndItsCellValue(variable.columnHeader, variable.value).first()).toBeVisible();
            }
        });
    });
});
