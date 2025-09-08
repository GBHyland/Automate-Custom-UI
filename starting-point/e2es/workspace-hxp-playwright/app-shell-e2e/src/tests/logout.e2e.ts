/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { test } from '@hxp/playwright/workspace-hxp';
import { FeatureFlagsNames, TestFlags, expect, getUsers, AppNames } from '@alfresco-dbp/playwright/shared';

test.describe('Workspace-HxP Tests - Log In/Out', () => {
    test(`${TestFlags.HxP} ${TestFlags.UnderFF} [C694996] User should be able to log in and out successfully`, async ({
        contentBrowserPage,
        hxpIdpLoginPage,
        page,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');
        await page.goto('/');
        await expect(hxpIdpLoginPage.email).toBeVisible();

        const users = getUsers();

        await hxpIdpLoginPage.loginUser(
            { username: users['hruser'].username, password: users['hruser'].password.split('\\').join('') },
            AppNames.WorkspaceHxP,
            { withNavigation: false, waitForLoading: true }
        );

        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();
        await expect.soft(contentBrowserPage.mainContentContainer.getRootLocator).toBeVisible();
        await expect.soft(contentBrowserPage.hxpApplicationChromeComponent.getRootLocator).toBeVisible();

        await contentBrowserPage.hxpApplicationChromeComponent.userAvatarButton.click();
        await contentBrowserPage.matMenuComponent.getMenuItemByText('Sign Out').click();
        await expect(hxpIdpLoginPage.logoutLabel).toContainText('You are now logged out.');
    });

    test(`${TestFlags.HxP} ${TestFlags.UnderFF} [C694996-OLD] User should be able to log in and out successfully`, async ({
        contentBrowserPage,
        hxpIdpLoginPage,
        page,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'old-functionality');
        await page.goto('/');
        await expect(hxpIdpLoginPage.email).toBeVisible();

        const users = getUsers();

        await hxpIdpLoginPage.loginUser(
            { username: users['hruser'].username, password: users['hruser'].password.split('\\').join('') },
            AppNames.WorkspaceHxP,
            { withNavigation: false, waitForLoading: true }
        );

        await contentBrowserPage.mainContentContainer.waitForSkeletonLoader();
        await expect.soft(contentBrowserPage.mainContentContainer.getRootLocator).toBeVisible();

        await contentBrowserPage.headerComponent.moreActionsMenuButton.click();
        await contentBrowserPage.matMenuComponent.getMenuItemByText('Sign Out').click();
        await expect(hxpIdpLoginPage.logoutLabel).toContainText('You are now logged out.');
    });
});
