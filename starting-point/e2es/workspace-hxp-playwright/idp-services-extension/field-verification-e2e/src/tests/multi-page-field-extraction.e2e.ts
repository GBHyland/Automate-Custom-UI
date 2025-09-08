/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, ProcessInstanceData, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
const { waitForUserTask, clickAndExpectPageChange } = idpHelperMethods;

import { BATCH_STATE_SNAPSHOTS } from '../resources';

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    let batchRunner: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.invoice3Pages);
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
    test.describe('HXIDP-3321 Bug - Extract multi-page document - fields extract on page 3 - focus directly to extracted fields on page 3 broke ui', () => {
        test('[XAT-18064] should focus through extracted fields on page 3 without breaking UI', async ({
            taskDetailsPage,
            page,
            runtimeBundleServiceHrUser: runtimeBundleService,
        }) => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
            // Cycle to page 3 fields and hit "Enter" to switch focus through the fields
            await page.keyboard.press('Enter');
            const companyName = page.locator('[data-automation-id^="idp-field-Company"]');
            await expect(companyName).toHaveValue('Hyland Software');

            await page.keyboard.press('Enter');
            const invoiceNumber = page.locator('[data-automation-id^="idp-field-InvoiceNumber"]');
            await expect(invoiceNumber).toHaveValue('123456');

            await page.keyboard.press('Enter');
            const date = page.locator('[data-automation-id^="idp-field-Date"]');
            await expect(date).toHaveValue('5/15/1991');

            await page.keyboard.press('Enter');
            const lineItems = page.locator('[data-automation-id^="idp-field-TotalLineItems"]');
            await expect(lineItems).toHaveValue('3');

            await page.keyboard.press('Enter');
            const netPay = page.locator('[data-automation-id^="idp-field-TotalAmount"]');
            await expect(netPay).toHaveValue('$5,000');

            // Ensure the page did not break and the backarrow is still functional
            const backArrow = page.locator('[data-automation-id="idp-go-back-button"]');
            await backArrow.click();
            const discardButton = page.locator('[data-automation-id^="idp-discard-dialog__discard-button"]');
            await discardButton.click();
            const taskName = page.locator('[data-automation-id="auto_id_name"]');
            await expect(taskName).toBeVisible();

            // Navigate back to the user task and test the page navigation toolbar that also broke in the bug
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
            const pageCounter = page.locator('hyland-idp-viewer-page-navigation').getByRole('spinbutton');
            const startingPage = Number.parseInt(await pageCounter.inputValue(), 10);

            expect(startingPage).toBe(1);
            await clickAndExpectPageChange(page, 'next', 2);
            await clickAndExpectPageChange(page, 'next', 3);
            await clickAndExpectPageChange(page, 'previous', 2);
            await clickAndExpectPageChange(page, 'previous', 1);
        });
    });
});
