/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, getUserState, TestFlags } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

const defaultDocumentationUrl = 'https://support.hyland.com/p/hylandexperience';

test.use({ storageState: getUserState('hruser') });

test.describe('Workspace-HxP Help functionality', async () => {
    test(`${TestFlags.UnderFF} [C704170] User should be able to click on help button and navigate to documentation page`, async ({
        contentBrowserPage,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');
        await contentBrowserPage.navigate();
        await contentBrowserPage.satoriHeaderComponent.appHeaderActionsButton.click();

        const popupPromise = contentBrowserPage.page.waitForEvent('popup');
        await contentBrowserPage.matMenuComponent.getMenuItemByText('help').click();
        const documentationPage = await popupPromise;
        await documentationPage.waitForLoadState();

        expect(documentationPage.url()).toEqual(defaultDocumentationUrl);
        await documentationPage.close();
    });
    test(`${TestFlags.UnderFF} [C704170-OLD] User should be able to click on help button and navigate to documentation page`, async ({
        contentBrowserPage,
        skipOrExecuteTestBasedOnFlagStatus,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'old-functionality');
        await contentBrowserPage.navigate();
        await contentBrowserPage.headerComponent.moreActionsMenuButton.click();

        const popupPromise = contentBrowserPage.page.waitForEvent('popup');
        await contentBrowserPage.matMenuComponent.getMenuItemByText('help').click();
        const documentationPage = await popupPromise;
        await documentationPage.waitForLoadState();

        expect(documentationPage.url()).toEqual(defaultDocumentationUrl);
        await documentationPage.close();
    });
});
