/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContentBrowserLabels, test } from '@hxp/playwright/workspace-hxp';
import { expect, getUserState } from '@alfresco-dbp/playwright/shared';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent Folder', 'Folder Description', 'hr');
    await contentBrowserPage.navigateToRoot();
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Workspace-HxP Tests - Side Navigation', () => {
    test(`[C695652] User should able to check the content management section`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.contentSideNavbar.navigateTo(ContentBrowserLabels.HomeLabel);
        await contentBrowserPage.page.waitForLoadState('domcontentloaded');

        await expect(contentBrowserPage.contentSideNavbar.getSideNavbarTitle(' Content Management ')).toBeVisible();
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator(' Home ')).toBeVisible();
        await expect(contentBrowserPage.contentSideNavbar.getContentMenuItemByNameLocator(parentFolder.sys_title)).toBeVisible();
    });
});
