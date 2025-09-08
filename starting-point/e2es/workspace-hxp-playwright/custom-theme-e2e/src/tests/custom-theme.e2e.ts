/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, getUserState, HXP_APPS, TestFlags } from '@alfresco-dbp/playwright/shared';
import { test, expect, ProcessManagementLabels } from '@hxp/playwright/workspace-hxp';

test.describe('Custom theme', () => {
    const { customTheme } = HXP_APPS.SYS_WORKSPACE;
    test.use({ storageState: getUserState('hruser') });

    test(`${TestFlags.UnderFF} [C688002] Should be able to apply custom theme`, async ({
        skipOrExecuteTestBasedOnFlagStatus,
        processPage,
        contentBrowserPage,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');
        await processPage.navigate();
        await processPage.dataTable.waitForRootElement();

        await expect.soft(processPage.pageLayoutHeaderComponent.startProcessButton).toHaveCSS('background-color', customTheme.primaryColor);

        await contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks).click();

        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toHaveCSS('color', customTheme.textColor);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.QueuedTasks))
            .toHaveCSS('color', customTheme.textColor);

        await expect.soft(contentBrowserPage.contentSideNavbar.getRootLocator).toHaveCSS('background-color', customTheme.backgroundColor);
        await expect.soft(contentBrowserPage.contentSideNavbar.getRootLocator).toHaveCSS('color', customTheme.textColor);

        await expect.soft(await processPage.contentSideNavbar.getBody()).toHaveCSS('font-size', customTheme.fontSize);
        await expect.soft(await processPage.contentSideNavbar.getBody()).toHaveCSS('font-family', customTheme.fontFamily);

        await expect.soft(contentBrowserPage.satoriHeaderComponent.appHeaderLogo).toHaveAttribute('src', customTheme.logoImage);
        await expect.soft(contentBrowserPage.satoriHeaderComponent.appHeaderTitle).toHaveCSS('color', customTheme.headerTextColor);
        await expect(contentBrowserPage.hxpWorkspaceHeaderComponent.getAppHeaderContainerLocator).toHaveAttribute(
            'style',
            `--hxp-header-bg: ${customTheme.headerColor}; --hxp-header-bg-image: ${customTheme.backgroundImageUrl}; --hxp-header-text-color: ${customTheme.headerTextColorHex};`
        );
    });

    test(`${TestFlags.UnderFF} [C688002-OLD] Should be able to apply custom theme`, async ({
        skipOrExecuteTestBasedOnFlagStatus,
        processPage,
        contentBrowserPage,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'old-functionality');
        await processPage.navigate();
        await processPage.dataTable.waitForRootElement();

        await expect.soft(processPage.pageLayoutHeaderComponent.startProcessButton).toHaveCSS('background-color', customTheme.primaryColor);

        await contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks).click();

        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.MyTasks))
            .toHaveCSS('color', customTheme.textColor);
        await expect
            .soft(contentBrowserPage.contentSideNavbar.getSidenavItemLabelLocator(ProcessManagementLabels.QueuedTasks))
            .toHaveCSS('color', customTheme.textColor);

        await expect.soft(contentBrowserPage.contentSideNavbar.getRootLocator).toHaveCSS('background-color', customTheme.backgroundColor);
        await expect.soft(contentBrowserPage.contentSideNavbar.getRootLocator).toHaveCSS('color', customTheme.textColor);

        await expect.soft(await processPage.contentSideNavbar.getBody()).toHaveCSS('font-size', customTheme.fontSize);
        await expect.soft(await processPage.contentSideNavbar.getBody()).toHaveCSS('font-family', customTheme.fontFamily);

        await expect.soft(contentBrowserPage.hxpWorkspaceHeaderComponent.getLogoLocator).toHaveAttribute('src', customTheme.logoImage);
        await expect.soft(contentBrowserPage.hxpWorkspaceHeaderComponent.getAppTitleLocator).toHaveCSS('color', customTheme.headerTextColor);
        await expect(contentBrowserPage.hxpWorkspaceHeaderComponent.getLegacyAppHeaderContainerLocator).toHaveAttribute(
            'style',
            `background-color: ${customTheme.headerColorRGB}; background-image: ${customTheme.backgroundImageUrlQuotes};`
        );
    });
});
