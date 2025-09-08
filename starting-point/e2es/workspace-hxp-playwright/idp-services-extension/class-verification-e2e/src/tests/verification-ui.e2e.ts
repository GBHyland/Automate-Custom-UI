/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, ProcessInstanceData, RequestResponse, getUserState, TestFlags } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
import { BATCH_STATE_SNAPSHOTS } from '../resources';

const { waitForUserTask } = idpHelperMethods;
test.use({ storageState: getUserState('hruser') });

test.describe('Workspace IDP Tests - Start IDP process', () => {
    let processInstance: ProcessInstanceData | RequestResponse | undefined;
    let processInstance2: ProcessInstanceData | RequestResponse | undefined;
    let batchRunner: IdpBatchStateSnapshotRunner;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.oneInvoice);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);
        await tasksPage.navigate({ waitUntil: 'load' });
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
        await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance2?.entry?.id);
        processInstance = undefined;
        processInstance2 = undefined;
    });

    test(`[XAT-17706] Should change class with change dialog and show updated class`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await expect(idpClassificationPage.documentBrowser.payslipItem).not.toBeVisible();
        await idpClassificationPage.documentBrowser.sortByOption.click();
        await idpClassificationPage.overlayContainer.sortOption1.click();
        await expect(idpClassificationPage.documentBrowser.payslipItem).toBeVisible();
        await idpClassificationPage.floaterToolbar.changeClassButton.click();
        await idpClassificationPage.changeClassDialog.payslipClass.click();
        await idpClassificationPage.changeClassDialog.submitChangeButton.click();
        await test.step('Verify document appears under the new class', async () => {
            await expect(idpClassificationPage.documentBrowser.payslipItem).toBeVisible();
            await expect(idpClassificationPage.documentBrowser.payslipItem).toBeEnabled();
        });
        await expect(idpClassificationPage.documentBrowser.undoButton).toBeEnabled();
        await expect(idpClassificationPage.documentBrowser.redoButton).toBeDisabled();
        await idpClassificationPage.documentBrowser.undoButton.click();
        await test.step('Verify document appears under the old class', async () => {
            await expect(idpClassificationPage.documentBrowser.invoiceItem).toBeVisible();
            await expect(idpClassificationPage.documentBrowser.invoiceItem).toBeEnabled();
        });
        await expect(idpClassificationPage.documentBrowser.redoButton).toBeEnabled();
        await expect(idpClassificationPage.documentBrowser.undoButton).toBeDisabled();
        await idpClassificationPage.documentBrowser.redoButton.click();
        await test.step('Verify document appears under the new class again', async () => {
            await expect(idpClassificationPage.documentBrowser.payslipItem).toBeVisible();
            await expect(idpClassificationPage.documentBrowser.payslipItem).toBeEnabled();
        });
    });

    test(`[XAT-17704] Shortcut dialog should display and show filtered and unfiltered results correctly.`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await idpClassificationPage.stickyButtons.shortcutButton.click();
        await expect(idpClassificationPage.shortcutDialog.shortcutDialogTitle).toBeVisible();
        await expect(idpClassificationPage.shortcutDialog.navigateUpShortcutDescription).toBeVisible();

        await idpClassificationPage.shortcutDialog.shortcutDialogInput.fill('Select all');
        await expect(idpClassificationPage.shortcutDialog.navigateUpShortcutDescription).not.toBeVisible();
        await expect(idpClassificationPage.shortcutDialog.selectAllPagesShortcutDescription).toBeVisible();
    });

    test(`${TestFlags.UnderFF} [XAT-18132] Should open next task if next task checkbox selected or close if no next task exists`, async ({
        idpClassificationPage,
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.StudioAutoOpenNextUserTask, 'new-functionality');
        await test.step('Start the processes', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
            processInstance2 = await batchRunner.startProcess(runtimeBundleService);
        });

        await waitForUserTask(runtimeBundleService, processInstance);
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance2);

        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

        await expect.soft(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(1));
        await idpClassificationPage.idpClassFooter.submitButton.click();

        await expect.soft(idpClassificationPage.snackBar.message).toHaveText('The task has been completed');
        await expect.soft(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(2));

        await idpClassificationPage.idpClassFooter.submitButton.click();

        await expect(idpClassificationPage.snackBar.message).toHaveText('The task has been completed');
        // The following message should appear when this test is ran isolated but does not always appear when other tests are ran alongside making it flaky in github workflow
        // await expect(idpClassificationPage.snackBar.message).toHaveText('No next task is available to proceed');
    });

    test(`[XAT-17345] Should Classify document correctly and submit classification`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await expect(idpClassificationPage.classificationHeader.documentClassesCount).toHaveText(String(1));
        await expect(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(1));
        await expect(idpClassificationPage.classificationHeader.pagesCount).toHaveText(String(1));
        await idpClassificationPage.idpClassFooter.submitButton.click();
        await expect(idpClassificationPage.snackBar.message).toHaveText('The task has been completed');
    });

    test(`[XAT-17705] Save button should be disabled then enabled, then save correctly.`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await expect(idpClassificationPage.idpClassFooter.saveButton).toBeDisabled();
        await idpClassificationPage.documentBrowser.sortByOption.click();
        await idpClassificationPage.overlayContainer.sortOption1.click();
        await expect(idpClassificationPage.documentBrowser.payslipItem).toBeVisible();
        await idpClassificationPage.floaterToolbar.changeClassButton.click();
        await idpClassificationPage.changeClassDialog.payslipClass.click();
        await idpClassificationPage.changeClassDialog.submitChangeButton.click();
        await expect(idpClassificationPage.idpClassFooter.saveButton).toBeEnabled();
        await idpClassificationPage.idpClassFooter.saveButton.click();
        await expect(idpClassificationPage.snackBar.message).toHaveText('The form has been saved');
    });
});
