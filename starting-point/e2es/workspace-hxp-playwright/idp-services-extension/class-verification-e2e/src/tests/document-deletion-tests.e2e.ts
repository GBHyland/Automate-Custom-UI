/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ProcessInstanceData, RequestResponse, getUserState, FeatureFlagsNames } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
import { BATCH_STATE_SNAPSHOTS } from '../resources';
const { refreshUserState, waitForUserTask } = idpHelperMethods;

test.use({ storageState: getUserState('hruser') });

test.describe('Tests for deletion of pages and documents in IDP Class Screen', () => {
    let processInstance: ProcessInstanceData | RequestResponse | undefined;
    let batchRunner: IdpBatchStateSnapshotRunner;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.resume1);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await refreshUserState(tasksPage, workerInfo);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
        processInstance = undefined;
    });

    test(`[XAT-17962] Document should be deleted correctly`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });

        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await idpClassificationPage.documentBrowser.sortByOption.click();
        await idpClassificationPage.overlayContainer.sortOption1.click();

        // Delete button is enabled when one or more non deleted documents are selected
        await expect(idpClassificationPage.floaterToolbar.deleteButton).toBeEnabled();
        await idpClassificationPage.documentBrowser
            .getClass(1)
            .getDocument(0)
            .getRootLocator.click({ modifiers: ['Shift'] });
        await idpClassificationPage.page.waitForTimeout(3000);
        await expect(idpClassificationPage.floaterToolbar.deleteButton).toBeEnabled();
        await expect(idpClassificationPage.classificationHeader.pagesCount).toHaveText(String(2));

        // Dialog can be launched using keyboard shortcut
        await idpClassificationPage.page.keyboard.press('Shift+Delete');
        await idpClassificationPage.confirmDialog.cancelButton.click();

        // Dialog can be launched using delete button
        await idpClassificationPage.documentBrowser.getClass(1).getDocument(0).getRootLocator.click();
        await idpClassificationPage.floaterToolbar.deleteButton.click();
        await idpClassificationPage.confirmDialog.confirmButton.click();

        // Delete button is not visible after deletion of single document
        await idpClassificationPage.page.waitForTimeout(2000);
        await expect(idpClassificationPage.floaterToolbar.deleteButton).not.toBeVisible();
        await expect(idpClassificationPage.floaterToolbar.deleteButton).toHaveCount(0);
        await expect(idpClassificationPage.classificationHeader.pagesCount).toHaveText(String(0));
        await expect(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(0));

        // One page remains after deleting the other (2 page document)
        await idpClassificationPage.documentBrowser.undoButton.click();
        const document = idpClassificationPage.documentBrowser.getClass(1).getDocument(0);
        await document.getPageComponent(0).getRootLocator.click();
        await idpClassificationPage.floaterToolbar.deleteButton.click();
        await idpClassificationPage.confirmDialog.confirmButton.click();
        await expect(idpClassificationPage.classificationHeader.pagesCount).toHaveText(String(1));
    });
});
