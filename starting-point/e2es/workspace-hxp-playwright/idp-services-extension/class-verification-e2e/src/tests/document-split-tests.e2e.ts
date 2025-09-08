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

test.describe('Tests for split and merge of documents in IDP Class Screen', () => {
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

    test(`[XAT-17972] Document should be split and merged correctly`, async ({
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

        // Split button is enabled when one or more non split documents are selected
        const firstDocument = idpClassificationPage.documentBrowser.getClass(1).getDocument(0);
        await idpClassificationPage.documentBrowser.documentDropdownButton.click();
        await firstDocument.getPageComponent(0).getRootLocator.click();
        await idpClassificationPage.page.waitForTimeout(3000);
        await expect(idpClassificationPage.floaterToolbar.splitButton).toBeEnabled();

        // Spit can be done using keyboard shortcut
        await idpClassificationPage.page.keyboard.press('S');
        await expect(idpClassificationPage.documentBrowser.getClass(1).getDocument(0).getRootLocator).toHaveCount(1);
        await expect(idpClassificationPage.documentBrowser.getClass(1).getDocument(1).getRootLocator).toHaveCount(1);
        await expect(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(2));
        await idpClassificationPage.documentBrowser.undoButton.click();

        // Split can be done using split button
        await firstDocument.getPageComponent(0).getRootLocator.click();
        await idpClassificationPage.floaterToolbar.splitButton.click();
        await expect(idpClassificationPage.documentBrowser.getClass(1).getDocument(0).getRootLocator).toHaveCount(1);
        await expect(idpClassificationPage.documentBrowser.getClass(1).getDocument(1).getRootLocator).toHaveCount(1);
        await expect(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(2));

        // Split button is not visible when trying to split single page document
        await idpClassificationPage.page.waitForTimeout(2000);
        await expect(idpClassificationPage.floaterToolbar.splitButton).not.toBeVisible();
        await expect(idpClassificationPage.floaterToolbar.splitButton).toHaveCount(0);

        // Merge can be done with merge button
        await firstDocument.getRootLocator.click();
        await idpClassificationPage.documentBrowser
            .getClass(1)
            .getDocument(1)
            .getRootLocator.click({ modifiers: ['Shift'] });
        await idpClassificationPage.floaterToolbar.mergeButton.click();
        await expect(firstDocument.getRootLocator).toHaveCount(1);
        await expect(idpClassificationPage.documentBrowser.getClass(1).getDocument(1).getRootLocator).toHaveCount(0);
        await expect(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(1));

        // Merge can be done using keyboard shortcut
        await idpClassificationPage.documentBrowser.undoButton.click();
        await firstDocument.getRootLocator.click();
        await idpClassificationPage.documentBrowser
            .getClass(1)
            .getDocument(1)
            .getRootLocator.click({ modifiers: ['Shift'] });
        await idpClassificationPage.page.keyboard.press('M');
        await expect(firstDocument.getRootLocator).toHaveCount(1);
        await expect(idpClassificationPage.documentBrowser.getClass(1).getDocument(1).getRootLocator).toHaveCount(0);
        await expect(idpClassificationPage.classificationHeader.documentCount).toHaveText(String(1));

        // Merge Button can't be visible when selecting a single document
        await firstDocument.getRootLocator.click();
        await expect(idpClassificationPage.floaterToolbar.mergeButton).not.toBeVisible();
        await expect(idpClassificationPage.floaterToolbar.mergeButton).toHaveCount(0);
    });
});
