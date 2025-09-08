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

const { waitForUserTask, interactWithTableField, waitForExtractionStatus, uncheckOpenNextTaskAutomatically } = idpHelperMethods;

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    let batchRunner1: IdpBatchStateSnapshotRunner;
    let batchRunner2: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner1 = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.basketball4tables1page);
        batchRunner2 = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.twoDocsTableAndInvoice);
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

    test.describe('Table Extract', () => {
        test(`[XAT-17973] Verifies extracted tables and field behaviors`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            // --- Setup process and navigation ---
            await test.step('Start and navigate to the user task', async () => {
                processInstance = await batchRunner1.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            // Check the 'Open Next Task Automatically' checkbox state and uncheck if checked
            await uncheckOpenNextTaskAutomatically(page);

            // Confirm the presence and state of the submit button
            await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeEnabled();

            // --- Locators and test data ---
            const metadataPanel = fieldVerificationPage.metadataPanel;
            const {
                tableSplitterBar: splitterBar,
                splitterPaneTable: paneTable,
                splitterPaneDocument: paneDocument,
            } = fieldVerificationPage.fieldVerificationViewerTextLayer;
            const basketballFields = [
                { name: 'Minutes Played', id: 'MinutesPlayed0ikpdt' },
                { name: '3Pt Field Goals', id: '3PtFieldGoals0crx8m' },
                { name: 'Free Throws', id: 'FreeThrows0tkzyc' },
                { name: 'Rebounds', id: 'Rebounds0w7qjk' },
            ];

            // --- Initial state: splitter bar should not be visible ---
            await test.step('Verify splitter bar is initially hidden', async () => {
                await expect(splitterBar).not.toBeVisible();
            });

            // --- Interact with each table field - changing values and verifying splitter bar is visible ---
            for (const field of basketballFields) {
                await test.step(`Interact with table field: ${field.name}`, async () => {
                    await interactWithTableField(metadataPanel, splitterBar, field.id, '99');
                });
            }

            // --- Drag the splitter bar and verify pane resizing ---
            await test.step('Drag the splitter bar and verify resizing', async () => {
                await expect(splitterBar).toBeVisible();

                const docHeightBefore = await paneDocument.evaluate((el) => (el as HTMLElement).offsetHeight);
                const tableHeightBefore = await paneTable.evaluate((el) => (el as HTMLElement).offsetHeight);
                const splitterBarBox = await splitterBar.boundingBox();
                const dragAmount = 200; // Amount to drag the splitter bar

                if (splitterBarBox) {
                    const centerX = splitterBarBox.x + splitterBarBox.width / 2;
                    const centerY = splitterBarBox.y + splitterBarBox.height / 2;
                    await splitterBar.hover();
                    await page.mouse.move(centerX, centerY);
                    await page.mouse.down();
                    await page.mouse.move(centerX, centerY - dragAmount);
                    await page.mouse.up();
                }

                const docHeightAfter = await paneDocument.evaluate((el) => (el as HTMLElement).offsetHeight);
                const tableHeightAfter = await paneTable.evaluate((el) => (el as HTMLElement).offsetHeight);

                expect(docHeightBefore - docHeightAfter).toEqual(dragAmount);
                expect(tableHeightAfter - tableHeightBefore).toEqual(dragAmount);
                await expect(splitterBar).toBeVisible(); // Check that the splitter bar is still visible after resizing
            });

            // --- Fill and navigate a non-table field ---
            await test.step('Fill and navigate non-table field', async () => {
                await page.reload();
                const orgField = page.locator('[data-automation-id^="idp-field-Organization"]');
                await orgField.click();
                const originalValue = await orgField.inputValue();
                const updatedValue = `${originalValue}-Test`;
                await orgField.fill(updatedValue);
                await expect(orgField).toHaveValue(updatedValue);
                await page.keyboard.press('Tab');
                await page.keyboard.press('Shift+Tab');
            });

            // --- Submit the document ---
            await fieldVerificationPage.fieldVerificationFooter.submitButton.click();
        });
    });

    test.describe('Field and Table IDs in batchState', () => {
        test(`[XAT-18239] Field and Table IDs in batchState`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            // Setup process and navigation
            processInstance = await batchRunner2.startProcess(runtimeBundleService);
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            expect.soft(userTasks).toHaveLength(1);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });

            // Check the 'Open Next Task Automatically' checkbox state and uncheck if checked
            await uncheckOpenNextTaskAutomatically(page);

            // Confirm the presence and state of the submit button
            await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeEnabled();

            // Extract counts and IDs from batchState for comparison
            const batchState = await runtimeBundleService.processInstance.getProcessVariable(processInstance.entry.id, 'batchState');
            const initialFieldsCount = batchState.documents.reduce((total, doc) => total + doc.fields.length, 0);
            const initialTablesCount = batchState.documents.reduce((total, doc) => total + doc.tables.length, 0);
            const initialFieldIds = batchState.documents.flatMap((doc) => doc.fields.map((field) => field.id));
            const initialTableIds = batchState.documents.flatMap((doc) => doc.tables.map((table) => table.id));

            // Submit the document
            await fieldVerificationPage.fieldVerificationFooter.submitButton.click();

            // Wait for the extraction status to become 'Extracted' when the 2nd document is processed
            const updatedBatchState = await waitForExtractionStatus(runtimeBundleService, processInstance, 'Extracted');

            // Extract updated counts and IDs for comparison
            const updatedFieldsCount = updatedBatchState.documents.reduce((total, doc) => total + doc.fields.length, 0);
            const updatedTablesCount = updatedBatchState.documents.reduce((total, doc) => total + doc.tables.length, 0);
            const updatedFieldIds = updatedBatchState.documents.flatMap((doc) => doc.fields.map((field) => field.id));
            const updatedTableIds = updatedBatchState.documents.flatMap((doc) => doc.tables.map((table) => table.id));

            // Compare counts and IDs
            expect(updatedFieldsCount).toBe(initialFieldsCount);
            expect(updatedTablesCount).toBe(initialTablesCount);
            expect(updatedFieldIds).toEqual(initialFieldIds);
            expect(updatedTableIds).toEqual(initialTableIds);
        });
    });
});
