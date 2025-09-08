/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, ProcessInstanceData, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
const { waitForUserTask, uncheckOpenNextTaskAutomatically, verifySubmitButtonAccessible, getScrollInfo, scrollToField } = idpHelperMethods;

import { BATCH_STATE_SNAPSHOTS } from '../resources';

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    let batchRunner: IdpBatchStateSnapshotRunner;
    let batchRunnerMaxFields: IdpBatchStateSnapshotRunner;
    let batchRunnerReasoningFields: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.invoice1);
        batchRunnerMaxFields = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.maxFields100);
        // The initialization of the Reasoning Fields can be added back here once both feature flags are removed
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

    test.describe('Submits metadata successfully without any rejection', () => {
        test(`[XAT-17927] Submits metadata successfully without any rejection`, async ({
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

            // Submit without modifying or rejecting
            await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeEnabled();
            await fieldVerificationPage.fieldVerificationFooter.submitButton.click();

            // Add an expectation or mock for post-submission confirmation
        });
    });

    test.describe('Metadata Panel Undo and Redo Functionality', () => {
        test(`[XAT-18053] IDP Field Verification: Metadata Panel Undo/Redo`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            await test.step('Start and navigate to the user task', async () => {
                processInstance = await batchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            // Confirm the presence of the metadata panel and expected elements
            await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeVisible();

            await expect(fieldVerificationPage.metadataPanel.undoButton).toBeVisible();
            await expect(fieldVerificationPage.metadataPanel.redoButton).toBeVisible();
            await expect(fieldVerificationPage.metadataPanel.rejectButton).toBeVisible();
            await expect(fieldVerificationPage.metadataPanel.undoButton).toBeDisabled();
            await expect(fieldVerificationPage.metadataPanel.redoButton).toBeDisabled();

            // Modify the company name field in order to test undo and redo functionality
            const companyName = page.locator('[data-automation-id^="idp-field-Company"]');
            await companyName.click();
            const initialValue = await companyName.inputValue();
            const newValue = `${initialValue}-Test`;
            await companyName.fill('');
            await companyName.fill(newValue);
            await expect(companyName).toHaveValue(newValue);
            await companyName.press('Tab');

            await fieldVerificationPage.metadataPanel.undoButton.click();
            await expect(companyName).toHaveValue(initialValue);
            await expect(fieldVerificationPage.metadataPanel.undoButton).toBeDisabled();
            await expect(fieldVerificationPage.metadataPanel.redoButton).toBeEnabled();

            await fieldVerificationPage.metadataPanel.redoButton.click();
            await expect(companyName).toHaveValue(newValue);
            await expect(fieldVerificationPage.metadataPanel.undoButton).toBeEnabled();
            await expect(fieldVerificationPage.metadataPanel.redoButton).toBeDisabled();
        });
    });

    test.describe('Testing With Max Fields', () => {
        test(`[XAT-18255] Verify Submit Remains Visible With Max Fields`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            // Test configuration constants
            const SCROLL_TOLERANCE = 100; // pixels
            const submitButton = fieldVerificationPage.fieldVerificationFooter.submitButton;
            const FIELD_SELECTORS = {
                FIRST: '#Field0010g9whu',
                LAST: '#Field1000f3oh8',
                CONTAINER: '.idp-fields-container, #metadata-container',
            };

            // Ensure the page is ready and the task is loaded
            await test.step('Setup process and navigate to task', async () => {
                processInstance = await batchRunnerMaxFields.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
                await uncheckOpenNextTaskAutomatically(page);
            });

            // Verify initial state of the submit button
            await verifySubmitButtonAccessible(submitButton, 'initial state');

            // Verify the first and last fields are present and scroll is at the top
            await test.step('Verify initial scroll position and field visibility', async () => {
                const initialScrollInfo = await getScrollInfo(page, FIELD_SELECTORS, 'initial state');

                // Verify required fields exist
                expect(initialScrollInfo.firstFieldExists, 'First field should exist').toBe(true);
                expect(initialScrollInfo.lastFieldExists, 'Last field should exist').toBe(true);

                // Verify we're at the top initially
                expect(initialScrollInfo.firstFieldVisible, 'First field should be visible initially').toBe(true);
                expect(initialScrollInfo.lastFieldVisible, 'Last field should not be visible initially').toBe(false);
                expect(initialScrollInfo.scrollTop, 'Should be at top of page').toBeLessThan(SCROLL_TOLERANCE);
            });

            // Scroll to the last field and verify visibility changes
            await test.step('Scroll to bottom and verify field visibility changes', async () => {
                // Scroll to the last field
                await scrollToField(page, FIELD_SELECTORS.LAST);
                const finalScrollInfo = await getScrollInfo(page, FIELD_SELECTORS, 'after scroll to bottom');

                // Verify we've scrolled significantly (within tolerance of bottom)
                const scrolledToBottom = finalScrollInfo.maxScrollTop - finalScrollInfo.scrollTop < SCROLL_TOLERANCE;
                expect(scrolledToBottom, `Should be near bottom (within ${SCROLL_TOLERANCE}px)`).toBe(true);

                // Verify field visibility has changed appropriately
                expect(finalScrollInfo.firstFieldVisible, 'First field should not be visible after scrolling').toBe(false);
                expect(finalScrollInfo.lastFieldVisible, 'Last field should be visible after scrolling').toBe(true);
            });

            // Verify submit button remains accessible after scrolling
            await verifySubmitButtonAccessible(submitButton, 'after scrolling to bottom');

            // Test window resize (Submit button should remain visible)
            await page.setViewportSize({ width: 1024, height: 768 });
            await verifySubmitButtonAccessible(submitButton, 'after resizing window');
        });
    });

    test.describe('Testing With Reasoning Fields', () => {
        test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
            await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpReasoningFieldExtraction, 'new-functionality');
            batchRunnerReasoningFields = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.reasoningFieldsResume);
            // This batchRunner can be moved to the top when both feature flags are removed
        });

        test(`[XAT-18263] Verify reasoning fields appear in metadata panel and are populated`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            // Test configuration constants
            const submitButton = fieldVerificationPage.fieldVerificationFooter.submitButton;
            const fields = {
                education: page.locator('[data-automation-id^="idp-field-Education"]'),
                signed: page.locator('[data-automation-id^="idp-field-Signed"]'),
            };

            // Ensure the page is ready and the task is loaded
            await test.step('Setup process and navigate to task', async () => {
                processInstance = await batchRunnerReasoningFields.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
                await uncheckOpenNextTaskAutomatically(page);
            });

            // Verify initial state of the submit button
            await verifySubmitButtonAccessible(submitButton, 'initial state');

            // Verify reasoning fields are visible and contain expected values
            await test.step('Verify reasoning fields visibility and values', async () => {
                // Verify fields are visible
                await expect(fields.education).toBeVisible();
                await expect(fields.signed).toBeVisible();

                // Verify field values
                await expect(fields.education).toHaveValue('Bachelor of Science in Business Administration from UCLA');
                await expect(fields.signed).toHaveValue('Yes');
            });
        });
    });
});
