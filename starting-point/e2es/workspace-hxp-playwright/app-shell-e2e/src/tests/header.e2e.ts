/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, getUserState, TestFlags } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });

test.describe('Workspace-HxP Header functionality', () => {
    test(`${TestFlags.UnderFF} [XAT-18237] Verify the component of Header`, async ({ contentBrowserPage, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');
        await contentBrowserPage.navigate();
        await expect.soft(contentBrowserPage.satoriHeaderComponent.appHeaderTitle).toContainText('Workspace');
        await expect.soft(contentBrowserPage.satoriHeaderComponent.appHeaderLogo).toBeVisible();
        await expect.soft(contentBrowserPage.satoriHeaderComponent.appHeaderActionsButton).toBeVisible();
    });
});
