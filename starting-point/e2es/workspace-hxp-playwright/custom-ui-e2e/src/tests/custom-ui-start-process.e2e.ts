/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// eslint-disable-next-line @nx/enforce-module-boundaries
import { HXP_APPS, UtilRandom, getUserState } from '@alfresco-dbp/playwright/shared';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Start process by pressing toolbar button in Custom UI', () => {
    const { simpleProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const processInstanceName = `pw-C593526-${UtilRandom.generateAlphaNumeric(10)}`;

    test.beforeEach(async ({ contentBrowserPage }, workerInfo) => {
        await contentBrowserPage.refreshUserState('repoadmin', workerInfo.project.use);
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser, queryServiceHrUser }) => {
        const processInstances = await queryServiceHrUser.processInstance.getProcessInstanceByFilters({ name: processInstanceName });
        const { entry: processInstance } = processInstances.list.entries[0];
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test('[C593526] Should be able to Start Process without form in start event', async ({ processPage, startProcessPage }) => {
        await processPage.navigate();

        await test.step('Open the process starting page', async () => {
            await processPage.pageLayoutHeaderComponent.startProcessButton.click();
            await processPage.startProcessDialog.selectProcess(simpleProcess.processName);
        });

        await test.step('Confirm the form is empty', async () => {
            await expect.soft(startProcessPage.taskForm.getFieldByLabelLocator('')).toHaveCount(0);
        });

        await test.step('Change process name', async () => {
            await startProcessPage.startProcessHeader.processNameInput.fill(processInstanceName);
        });

        await test.step('Start the process', async () => {
            await startProcessPage.startProcessFooter.startProcessButton.click();

            await expect.soft(startProcessPage.snackBar.message).toHaveText(`Process created '${processInstanceName}'`);
        });

        await test.step('Verify the process is running', async () => {
            await expect(processPage.dataTable.getRowByName(processInstanceName)).toBeVisible();
        });
    });
});
