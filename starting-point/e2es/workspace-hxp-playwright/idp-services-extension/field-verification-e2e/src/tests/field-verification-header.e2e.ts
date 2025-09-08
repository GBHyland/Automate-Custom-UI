/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, ProcessInstanceData, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
const { waitForUserTask } = idpHelperMethods;

import { BATCH_STATE_SNAPSHOTS } from '../resources';

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    let batchRunner: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.invoice1);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);
        await tasksPage.navigate({ waitUntil: 'load' });
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await test.step('Delete process instance', async () => {
            await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
            processInstance = undefined;
        });
    });

    test(`[XAT-17929] Should display correct header information`, async ({
        fieldVerificationPage,
        page,
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
    }) => {
        await test.step('Start and navigate to the user task', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            expect.soft(userTasks).toHaveLength(1);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
        });

        await test.step('Verify All issues resolved', async () => {
            await expect(fieldVerificationPage.fieldVerificationHeader.issueCountResolved).toHaveText(' All resolved');
        });

        await test.step('Verify task name is displayed', async () => {
            await expect(fieldVerificationPage.fieldVerificationHeader.taskName).toHaveText(/Field Review UI|Metadata Verification/);
        });

        await test.step('Verify Content Type is correct', async () => {
            await expect(fieldVerificationPage.fieldVerificationHeader.contentType).toHaveText('Invoice');
        });

        await test.step('Verify page count is correct', async () => {
            await expect(fieldVerificationPage.fieldVerificationHeader.totalPages).toHaveText('1');
        });

        await test.step('Verify go back button is visible and clickable', async () => {
            await expect(fieldVerificationPage.fieldVerificationHeader.goBack).toBeVisible();
            await fieldVerificationPage.fieldVerificationHeader.goBack.click();
            const discardButton = page.locator('[data-automation-id^="idp-discard-dialog__discard-button"]');
            await discardButton.click();
            await expect(page).toHaveURL(/task-list/); // Confirm navigation back to task list page occurred
        });
    });
});
