/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

test.use({ storageState: getUserState('hruser') });

test.describe('Breadcrumb Navigation', async () => {
    let parentFolder: Document;
    let childFolder: Document;
    let file: Document;

    test.beforeEach(async ({ hxprApi }) => {
        parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent Folder', 'Folder description', 'hr');
        childFolder = await hxprApi.documentServiceApi.createFolder('Child Folder', 'Child Folder description', parentFolder.sys_id);
        file = await hxprApi.documentServiceApi.createFile('EmptyFile', 'File description', childFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C694998] User should be able to navigate between Child Folder, Parent Folder and Home`, async ({ contentBrowserPage }) => {
        const { getDocByTestId } = contentBrowserPage.mainContentContainer;
        const { breadcrumb } = contentBrowserPage.mainContentHeader;

        await contentBrowserPage.navigateToDocument(childFolder.sys_id);
        await expect(getDocByTestId(file.sys_title)).toBeVisible();

        await breadcrumb.getBreadcrumbLink(parentFolder.sys_title).click();
        await expect(getDocByTestId(childFolder.sys_title)).toBeVisible();

        await breadcrumb.getBreadcrumbLink('Home').click();
        await breadcrumb.getBreadcrumbLink(parentFolder.sys_title).waitFor({ state: 'hidden' });
        expect(await breadcrumb.getBreadcrumbArray()).toEqual(['Home']);
    });
});
