/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, UtilRandom, ProcessInstanceDataEntry, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Queued task counter', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const { candidateUserProcess } = processes;
    let initialProcessInstance: ProcessInstanceDataEntry;
    let newProcessInstance: ProcessInstanceDataEntry;

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(initialProcessInstance.id);
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(newProcessInstance.id);
    });

    test(`[XAT-16817] should be able to see "Queued Tasks" counter increase when starting a process`, async ({
        tasksPage,
        runtimeBundleServiceHrUser,
    }) => {
        let currentTaskCounter: string;

        await test.step('Create a new process instance to make sure queued task counter has initial value', async () => {
            const runningProcessName = `fe-e2e-XAT-16817-queued-1-${UtilRandom.generateAlphaLowerCase(5)}`;
            ({ entry: initialProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(
                candidateUserProcess.processDefinitionKey,
                { name: runningProcessName }
            ));
            await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(initialProcessInstance.id);
        });

        await test.step('Navigate to Personal Files page and expand Process Management section', async () => {
            await tasksPage.navigate();
            await tasksPage.contentSideNavbar.expandPanelHeader('Process Management');
            currentTaskCounter = await tasksPage.contentSideNavbar.getQueuedTaskCounterLocator.textContent();
        });

        await test.step('Create another process instance to increase the counter', async () => {
            const runningProcessName = `fe-e2e-XAT-16817-queued-2-${UtilRandom.generateAlphaLowerCase(5)}`;
            ({ entry: newProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(
                candidateUserProcess.processDefinitionKey,
                { name: runningProcessName }
            ));
            await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(newProcessInstance.id);
        });

        await test.step('Check if the counter has increased', async () => {
            await tasksPage.contentSideNavbar.getQueuedTasksCounterActive.waitFor();
            await expect
                .poll(
                    async () => {
                        return Number(await tasksPage.contentSideNavbar.getQueuedTaskCounterLocator.textContent());
                    },
                    { timeout: 5000, intervals: [200] }
                )
                .toBeGreaterThan(Number(currentTaskCounter));
        });
    });
});
