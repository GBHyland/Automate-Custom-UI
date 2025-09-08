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

test.describe('Workspace IDP Tests - Claimable tasks tests', () => {
    let processInstance: ProcessInstanceData | RequestResponse | undefined;
    let batchRunner: IdpBatchStateSnapshotRunner;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.claimable);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await refreshUserState(tasksPage, workerInfo);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
    });

    test(`[XAT-17871] Classification Task should be queued and available to claim, then claimed and shown under "My Tasks" `, async ({
        runtimeBundleServiceHrUser: runtimeBundleService,
        idpClassificationPage,
    }) => {
        await test.step('Start the process', async () => {
            processInstance = await batchRunner.startProcess(runtimeBundleService);
        });
        await waitForUserTask(runtimeBundleService, processInstance);
        await idpClassificationPage.contentSideNavbar.navigateTo('queued-tasks_filter');
        await idpClassificationPage.dataTable.getRowByName('Claimable Classification Task').first().click();
        await idpClassificationPage.idpClassFooter.submitButton.isVisible();
        await idpClassificationPage.classificationHeader.goBackButton.click();
        await expect(idpClassificationPage.dataTable.getRowByName('Claimable Classification Task').first()).toHaveCount(0);
        await idpClassificationPage.contentSideNavbar.navigateTo('my-tasks_filter');
        await expect(idpClassificationPage.dataTable.getRowByName('Claimable Classification Task').first()).toHaveCount(1);
    });
});
