/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @cspell/spellchecker */

import { FeatureFlagsNames, ProcessInstanceData, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';

import { BATCH_STATE_SNAPSHOTS } from '../resources';

const { waitForUserTask } = idpHelperMethods;

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    let batchRunner: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.tableRepeat);
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
    test.describe('Clears red status', () => {
        test(`[XAT-18089] Clears red status on non-extracted table when pressing Enter`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            await test.step('Start the process', async () => {
                processInstance = await batchRunner.startProcess(runtimeBundleService);
            });

            await test.step('Navigate to 1st user task', async () => {
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
            });

            await test.step('Press Enter to clear red status on table field', async () => {
                await page.keyboard.press('Enter');
                // Confirm red status is cleared
                // Submit without modifying or rejecting
                await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeEnabled();
                await fieldVerificationPage.fieldVerificationFooter.submitButton.click();
            });

            await test.step('Navigate to 2nd user task', async () => {
                await page.reload();
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
            });

            await test.step('Click on red status table field then clear status with Enter', async () => {
                const freeThrows = page.locator('[data-automation-id^="field-has-issueFreeThrows"]');
                await expect(freeThrows).toBeVisible();
                // Expose issue where clicking on the field and pressing Enter does not clear the red status and focuses on the hidden field
                await freeThrows.click();
                await page.keyboard.press('Enter');
                // Confirm red status is cleared
                // Submit without modifying or rejecting
                await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeEnabled();
                await fieldVerificationPage.fieldVerificationFooter.submitButton.click();
            });
        });
    });
});
