/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, getUserState, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Dropdown and radio button verification', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    let processInstance: ProcessInstanceDataEntry;

    test.beforeEach(async ({ taskDetailsPage, runtimeBundleServiceHrUser }, workerInfo) => {
        await taskDetailsPage.refreshUserState('hruser', workerInfo.project.use);
        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            processes.restCallCheckProcess.processDefinitionKey,
            { name: processes.restCallCheckProcess.processName }
        ));

        const userTasks = await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(processInstance.id);

        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test(`[XAT-17487] Dropdown and radio button widgets should display the correct options`, async ({ taskDetailsPage }) => {
        const { radioButtonId, dropdownId } = processes.restCallCheckProcess.form.formWidgets;

        await expect.soft(taskDetailsPage.taskForm.radioButtonComponent.getRadioButtonOptionsById(radioButtonId)).not.toHaveCount(0);

        await taskDetailsPage.taskForm.dropdownComponent.getDropdownById(dropdownId).click();

        await expect(taskDetailsPage.taskForm.overlayPaneComponent.getOverlayOptions).not.toHaveCount(0);
    });
});
