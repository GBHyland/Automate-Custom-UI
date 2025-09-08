/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { test, expect, ProcessManagementLabels } from '@hxp/playwright/workspace-hxp';
import { getUserState, HXP_APPS, ProcessInstanceDataEntry, UtilRandom } from '@alfresco-dbp/playwright/shared';

test.use({ storageState: getUserState('hruser') });
test.describe('Process custom columns selector', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const { withDisplayedVariables, withDisplayedVariablesSecond } = processes;
    const displayedFirstName = `with-displayed-var-${UtilRandom.generateRandomString(5)}}-first`;
    const displayedSecondName = `with-displayed-var-${UtilRandom.generateRandomString(5)}}-second`;

    let displayedFirstProcess: ProcessInstanceDataEntry;
    let displayedSecondProcess: ProcessInstanceDataEntry;

    test.beforeAll(async ({ runtimeBundleServiceHrUser }) => {
        ({ entry: displayedFirstProcess } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            withDisplayedVariables.processDefinitionKey,
            { name: displayedFirstName }
        ));
        ({ entry: displayedSecondProcess } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            withDisplayedVariablesSecond.processDefinitionKey,
            { name: displayedSecondName }
        ));

        await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(displayedFirstProcess.id);
        await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(displayedSecondProcess.id);
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(displayedFirstProcess.id, displayedSecondProcess.id);
    });

    test(`[XAT-17312] Should show process variables columns in process datatable`, async ({ tasksPage, processPage, preferenceMock }) => {
        const withDisplayedVariablesVariables = Object.keys(withDisplayedVariables.variables).map(
            (element) => withDisplayedVariables.variables[element]
        );
        const withDisplayedVariablesSecondVariables = Object.keys(withDisplayedVariablesSecond.variables).map(
            (element) => withDisplayedVariablesSecond.variables[element]
        );
        const allVariables = [...withDisplayedVariablesVariables, ...withDisplayedVariablesSecondVariables];

        await test.step('Mock the preferences for the columns visibility', async () => {
            const columnHeaders = <string[]>allVariables.map((element) => `${element.columnHeader}/${element.variableId}`);

            await tasksPage.navigate({ waitUntil: 'networkidle' });

            await preferenceMock.mockCloudColumnsVisibility(columnHeaders, 'processes-cloud-columns-visibility');
            await tasksPage.contentSideNavbar.navigateTo(ProcessManagementLabels.AllProcesses);
            await processPage.dataTable.waitForRootElement();
        });

        await test.step('Filter out the process by name', async () => {
            await processPage.applyFilter('string', { filterName: 'Process Name', value: 'with-displayed-var' });
        });

        await test.step('Verify the columns are displayed with the proper values', async () => {
            for (const variable of withDisplayedVariablesVariables) {
                await expect
                    .soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue(variable.columnHeader, variable.value).first())
                    .toBeVisible();
            }

            for (const variable of withDisplayedVariablesSecondVariables) {
                await expect
                    .soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue(variable.columnHeader, variable.value).first())
                    .toBeVisible();
            }
        });
    });
});
