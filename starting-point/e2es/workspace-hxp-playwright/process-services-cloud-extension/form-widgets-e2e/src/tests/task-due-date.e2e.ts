/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, HXP_APPS, ProcessInstanceDataEntry, UtilRandom } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.describe('Task details due date', () => {
    test.use({ storageState: getUserState('hruser') });

    let runningProcess: ProcessInstanceDataEntry;

    test.beforeEach(async ({ runtimeBundleServiceHrUser, processDetailsPage }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);

        const processInstanceName = `fe-e2e-XAT-1166-${UtilRandom.generateAlphaLowerCase(5)}`;
        const { calledProcess } = HXP_APPS.SYS_WORKSPACE.processes;

        ({ entry: runningProcess } = await runtimeBundleServiceHrUser.processInstance.startProcess(calledProcess.processDefinitionKey, {
            name: processInstanceName,
        }));
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(runningProcess.id);
    });

    test(`[XAT-1166] Should be able to view the due date set using the process variable of type datetime`, async ({
        processDetailsPage,
        taskDetailsPage,
    }) => {
        await processDetailsPage.navigate({ query: `${runningProcess.id}` });
        await processDetailsPage.dataTable.getRowByAriaLabel('calledTask').click();
        await taskDetailsPage.taskHeader.waitForRootElement();
        await taskDetailsPage.taskHeader.infoDrawerIconLocator.click();
        await taskDetailsPage.infoDrawer.waitForRootElement();

        await expect(taskDetailsPage.infoDrawer.dueDateValueLocator).toHaveText('Dec 12, 2019, 10:06:00 AM');
    });
});
