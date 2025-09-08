/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @cspell/spellchecker */
import { FeatureFlagsNames, ProcessInstanceData, RequestResponse, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
const { waitForUserTask, typeRow } = idpHelperMethods;

import { BATCH_STATE_SNAPSHOTS } from '../resources';
test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    /** managed by beforeAll and afterAll */
    let batchRunner: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | RequestResponse | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.basketballStatsMissingFields);
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

    test.describe('Handles missing table extraction - adds table manually', () => {
        test(`[XAT-18226] Handles missing table extraction - adds table manually`, async ({
            fieldVerificationPage,
            page,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
        }) => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            expect.soft(userTasks).toHaveLength(1);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });

            const basketballTables = [
                { name: 'Minutes Played', id: 'MinutesPlayed0ikpdt' },
                { name: '3Pt Field Goals', id: '3PtFieldGoals0crx8m' },
                { name: 'Free Throws', id: 'FreeThrows0tkzyc' },
                { name: 'Rebounds', id: 'Rebounds0w7qjk' },
            ];

            const threePtFieldGoalsTable = page.locator(`[data-automation-id^="field-has-issue${basketballTables[1].id}"]`);
            const extractionIssueMessage = threePtFieldGoalsTable.locator('[data-automation-id^="idp-field-extraction-result-text-"]');
            const addTableButton = threePtFieldGoalsTable.locator('[data-automation-id="idp-add-table-button"]');

            await expect(extractionIssueMessage).toBeVisible();
            await expect(addTableButton).toBeVisible();
            await addTableButton.click();

            const metadataPanel = fieldVerificationPage.metadataPanel;
            await metadataPanel.openTableForField(basketballTables[1].id);
            await metadataPanel.insertRowBelow();
            await metadataPanel.insertRowBelow();
            await metadataPanel.insertRowAbove();
            await metadataPanel.openTableForField(basketballTables[1].id);
            await page.locator('#extraction-table-container').getByText('1').click({ button: 'left' });
            await typeRow(metadataPanel.page, ['1', 'Bad Player', '2023', '100']);
            await page.locator('#extraction-table-container').getByText('1').click({ button: 'right' });
            await page.getByRole('menuitem', { name: 'Clear this row' }).click();
            await metadataPanel.deleteRow('1');

            await metadataPanel.openTableForField(basketballTables[1].id);
            await typeRow(metadataPanel.page, ['1', 'Lebron James', '2023', '500']);
            await typeRow(metadataPanel.page, ['2', 'Anthony Davis', '2023', '400']);
            await typeRow(metadataPanel.page, ['3', 'Drew K', '2023', '300']);
            await fieldVerificationPage.metadataPanel.undoButton.click();
            await fieldVerificationPage.metadataPanel.redoButton.click();
            await metadataPanel.clearColumn('Rank');

            // Fill regular fields
            const regularFields = [
                { label: 'Division', selector: '[data-automation-id^="idp-field-Division"]', value: 'Eastern' },
                { label: 'Conference', selector: '[data-automation-id^="idp-field-Conference"]', value: 'East' },
            ];

            for (const field of regularFields) {
                const fieldLocator = page.locator(field.selector);
                if ((await fieldLocator.inputValue()) === '') {
                    await fieldLocator.fill(field.value);
                    await expect(fieldLocator).toHaveValue(field.value);
                }
            }
            await page.keyboard.press('Enter');

            const freeThrowsTable = page.locator(`[data-automation-id^="field-has-issue${basketballTables[2].id}"]`);
            const addTableButton2 = freeThrowsTable.locator('[data-automation-id="idp-add-table-button"]');
            await addTableButton2.click();
            await metadataPanel.deleteTable();

            const reboundsTable = page.locator(`[data-automation-id^="field-has-issue${basketballTables[3].id}"]`);
            const addTableButton3 = reboundsTable.locator('[data-automation-id="idp-add-table-button"]');
            await addTableButton3.click();
            await metadataPanel.openTableForField(basketballTables[3].id);
            await metadataPanel.insertRowBelow();
            await page.keyboard.type('Undo/Redo');
            await page.keyboard.press('Tab');
            await fieldVerificationPage.metadataPanel.undoButton.click();
            await fieldVerificationPage.metadataPanel.undoButton.click();
            await fieldVerificationPage.metadataPanel.redoButton.click();
            await fieldVerificationPage.metadataPanel.redoButton.click();
            await page.keyboard.press('Tab');

            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');
            await page.keyboard.press('Enter');

            await fieldVerificationPage.fieldVerificationFooter.submitButton.click();
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            // Assert final batchState snapshot reflects latest table data
            const updatedBatchState = await runtimeBundleService.processInstance.getProcessVariable(processInstance.entry.id, 'batchState');

            const updatedTable = updatedBatchState.documents[0].tables.find((t) => t.id === basketballTables[1].id);
            expect(updatedTable).toBeDefined();
            expect(updatedTable.records.length).toBeGreaterThanOrEqual(1);

            const lastRow = updatedTable.records.at(-1)?.records.map((r) => r.value);
            expect(lastRow).toEqual(['', 'Drew K', '2023', '300']);

            const deletedTable = updatedBatchState.documents[0].tables.find((t) => t.id === basketballTables[2].id);
            expect(deletedTable.records.length).toBe(0);

            const reboundsBatchTable = updatedBatchState.documents[0].tables.find((t) => t.id === basketballTables[3].id);
            expect(reboundsBatchTable).toBeDefined();
            expect(reboundsBatchTable.records.length).toBeGreaterThan(0);

            const firstCellValue = reboundsBatchTable.records[1].records[0].value;
            expect(firstCellValue).toBe('Undo/Redo');
        });
    });
});
