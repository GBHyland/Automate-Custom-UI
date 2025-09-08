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
    let batchRunner1: IdpBatchStateSnapshotRunner;
    let batchRunner2: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner1 = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.invoice1);
        batchRunner2 = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.invoice1FileNoDates);
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

    test.describe('Metadata Panel Rejection Flow', () => {
        test(`[XAT-17925] Rejects with reason: faded`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
        }) => {
            await test.step('Start and navigate to the user task', async () => {
                processInstance = await batchRunner1.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            // Check if the reject button is available and click it
            await expect(fieldVerificationPage.metadataPanel.rejectButton).toBeEnabled();
            await fieldVerificationPage.metadataPanel.rejectButton.click();

            await fieldVerificationPage.rejectFieldDialog.fadedRejectReason.click();

            const reason1 = fieldVerificationPage.rejectFieldDialog.fadedRejectReason;
            const reason2 = fieldVerificationPage.rejectFieldDialog.missingPageRejectReason;
            await expect(reason1).toHaveAttribute('aria-selected', 'true');
            await fieldVerificationPage.rejectFieldDialog.missingPageRejectReason.click();
            await expect(reason2).toHaveAttribute('aria-selected', 'true');
            await expect(reason1).toHaveAttribute('aria-selected', 'false');
            await fieldVerificationPage.rejectFieldDialog.submitChangeButton.click();
        });
    });

    test.describe('Handles partially identified document - triggers rejection and adds note', () => {
        test(`[XAT-17928] Handles partially identified document - triggers rejection and adds note`, async ({
            fieldVerificationPage,
            page,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
        }) => {
            // Start the process with two documents, to create two user tasks
            processInstance = await batchRunner2.startProcess(runtimeBundleService);

            // Navigate to the 1st user task
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            // Confirm the presence of the metadata panel and expected elements
            const dateField = page.locator('[data-automation-id^="idp-field-Date"]');
            await expect(dateField).not.toHaveAttribute('ng-reflect-value'); // Assuming the date field is empty or not identified

            // User chooses to reject document
            await expect(fieldVerificationPage.metadataPanel.rejectButton).toBeEnabled();
            await fieldVerificationPage.metadataPanel.rejectButton.click();
            await fieldVerificationPage.rejectFieldDialog.missingPageRejectReason.click();
            const noteArea = fieldVerificationPage.rejectFieldDialog.rejectReasonNote;
            await noteArea.click();
            await noteArea.fill('This is the text for the rejected reason in the e2e test');
            await fieldVerificationPage.rejectFieldDialog.submitChangeButton.click();

            // Navigate to the 2nd user task
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            // Get batchState and check for the correct values for the documents and the batch
            const batchState = await runtimeBundleService.processInstance.getProcessVariable(processInstance.entry.id, 'batchState');
            await expect(batchState.documents[0].markAsRejected).toBe(true);
            await expect(batchState.documents[0].rejectNote).toBe('This is the text for the rejected reason in the e2e test');
            await expect(batchState.documents[1].markAsRejected).toBe(false);
            await expect(batchState.hasRejectedDocuments).toBe(true);
        });
    });
});
