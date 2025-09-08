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

/** From project: `workspace-hxp-idp-services-extension-shared` */
export const SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME = 500;

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

    test(`[XAT-17611] Can navigate to user task for IDP field verification`, async ({
        fieldVerificationPage,
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
    }) => {
        await test.step('Start and navigate to the user task', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            expect.soft(userTasks).toHaveLength(1);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
        });

        await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeVisible(); // confirm presence of submit button
    });

    test(`[XAT-17991] Should display filterable shortcut browser in field verification`, async ({
        fieldVerificationPage,
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
    }) => {
        await test.step('Start and navigate to the user task', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            expect.soft(userTasks).toHaveLength(1);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
        });

        // Confirm the button for the shortcut browser appears as expected
        await expect(fieldVerificationPage.stickyButtons.shortcutButton).toBeVisible();

        // Confirm that clicking on the button opens the shortcut browser
        await expect(fieldVerificationPage.shortcutDialog.getRootLocator).toBeHidden();
        await fieldVerificationPage.stickyButtons.shortcutButton.click();
        await expect(fieldVerificationPage.shortcutDialog.getRootLocator).toBeVisible();

        // Confirm typing in the filter bar filters as expected
        await fieldVerificationPage.shortcutDialog.shortcutDialogInput.fill('Undo');
        await fieldVerificationPage.page.waitForTimeout(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME); // wait for the filter to be applied
        await expect.soft(fieldVerificationPage.shortcutDialog.redoLastActionShortcutDescription).toBeHidden();
        await expect.soft(fieldVerificationPage.shortcutDialog.undoLastActionShortcutDescription.first()).toBeVisible();
        await fieldVerificationPage.shortcutDialog.shortcutDialogInput.fill('Redo');
        await fieldVerificationPage.page.waitForTimeout(SHORTCUT_BROWSER_FILTER_DEBOUNCE_TIME); // wait for the filter to be applied
        await expect.soft(fieldVerificationPage.shortcutDialog.undoLastActionShortcutDescription).toBeHidden();
        await expect.soft(fieldVerificationPage.shortcutDialog.redoLastActionShortcutDescription.first()).toBeVisible();

        // Confirm clicking the X in the filter bar clears it as expected
        await fieldVerificationPage.shortcutDialog.shortcutDialogClearButton.click();
        await expect.soft(fieldVerificationPage.shortcutDialog.shortcutDialogInput).toHaveValue('');

        // Confirm clicking the X on the dialog closes the shortcut browser
        await expect(fieldVerificationPage.shortcutDialog.getRootLocator).toBeVisible();
        await fieldVerificationPage.shortcutDialog.shortcutDialogCloseButton.click();
        await expect(fieldVerificationPage.shortcutDialog.getRootLocator).toBeHidden();
    });
});
