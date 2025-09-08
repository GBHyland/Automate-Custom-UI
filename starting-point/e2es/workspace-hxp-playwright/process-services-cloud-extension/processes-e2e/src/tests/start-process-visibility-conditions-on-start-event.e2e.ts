/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, UtilRandom, getUserState, timeouts } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Start Process - visibility conditions on start event', () => {
    const { startVisibilityForm } = HXP_APPS.SYS_WORKSPACE.processes;
    const processInstanceName = `pw-xat-17188-${UtilRandom.generateAlphaNumeric(10)}`;

    test.beforeEach(async ({ processPage }) => {
        await processPage.navigate();
        await processPage.pageLayoutHeaderComponent.startProcessButton.click();
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser, queryServiceHrUser }) => {
        const processInstances = await queryServiceHrUser.processInstance.getProcessInstanceByFilters({ name: processInstanceName });
        const { entry: processInstance } = processInstances.list.entries[0];
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test('[XAT-17188] Should be able to start a process with a form contains visibility conditions on a start event', async ({
        processPage,
        startProcessPage,
    }) => {
        await processPage.startProcessDialog.selectProcess(startVisibilityForm.processName);

        await test.step('Change process name', async () => {
            await startProcessPage.startProcessHeader.processNameInput.fill(processInstanceName);
        });

        await test.step('Verify that the form visibility conditions work as expected', async () => {
            await startProcessPage.taskForm
                .getFieldInputByIdLocator(startVisibilityForm.form.formWidgets.text)
                .waitFor({ state: 'visible', timeout: timeouts.short });
            await startProcessPage.taskForm.getFieldInputByIdLocator(startVisibilityForm.form.formWidgets.text).pressSequentially('test');

            await expect.soft(startProcessPage.taskForm.getFieldByIdLocator(startVisibilityForm.form.formWidgets.MultilineText)).toBeVisible();
        });

        await test.step('Verify that the process can be started', async () => {
            await startProcessPage.startProcessFooter.startProcessButton.click();

            await expect(startProcessPage.snackBar.message).toContainText(`Process created '${processInstanceName}`);
        });
    });
});
