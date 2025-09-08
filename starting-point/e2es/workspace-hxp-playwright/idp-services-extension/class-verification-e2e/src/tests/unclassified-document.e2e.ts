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
const { waitForUserTask, refreshUserState } = idpHelperMethods;

test.use({ storageState: getUserState('hruser') });

test.describe('Workspace IDP Tests - Unclassified document tests', () => {
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
    });

    test(`[XAT-17768] Document should be unclassified. Only issues filter should only show unclassified class.`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        processInstance = await batchRunner.startProcess(runtimeBundleService);
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
        await idpClassificationPage.documentBrowser.sortByOption.click();
        await idpClassificationPage.overlayContainer.sortOption1.click();
        await idpClassificationPage.documentBrowser.issueToggle.click();
        await expect(idpClassificationPage.documentBrowser.getClass(0).className).toHaveText('Unclassified');
        await expect(idpClassificationPage.documentBrowser.getClass(1).className).toHaveCount(0);
    });

    test(`[XAT-18231] Document should be dragged and dropped in a new class`, async ({
        taskDetailsPage,
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
        page,
    }) => {
        processInstance = await batchRunner.startProcess(runtimeBundleService);
        const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
        await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

        await idpClassificationPage.documentBrowser.sortByOption.click();
        await idpClassificationPage.overlayContainer.sortOption1.click();
        const document = idpClassificationPage.documentBrowser.getClass(1).getDocument(0).getRootLocator;
        const targetClass = idpClassificationPage.documentBrowser.payslipItem;

        const sourceBox = await document.boundingBox();
        const targetBox = await targetClass.boundingBox();

        if (sourceBox && targetBox) {
            await page.mouse.move(sourceBox.x + sourceBox.width / 2, sourceBox.y + sourceBox.height / 2);
            await page.mouse.down();
            await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 5 });
            await page.mouse.up();
        }
        await targetClass.click();
        await expect(targetClass).toBeEnabled();
        await expect(idpClassificationPage.documentBrowser.getClass(2).getDocument(0).getRootLocator).toHaveCount(1, { timeout: 3000 });
    });
});
