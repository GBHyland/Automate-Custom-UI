/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, timeouts, DataGenerator } from '@alfresco-dbp/playwright/shared';
import { ContentBrowserLabels, expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;
let childFolder: Document;
let paginationFolder: Document;
let emptyFile: Document;

test.use({ storageState: getUserState('hruser') });

test.describe('Document List Navigation', async () => {
    test.beforeEach(async ({ contentBrowserPage, hxprApi }) => {
        parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Document List Paginator Folder', 'Folder description', 'hr');
        childFolder = await hxprApi.documentServiceApi.createFolder('Child Folder', 'Folder description', parentFolder.sys_id);
        paginationFolder = await hxprApi.documentServiceApi.createFolder('Pagination Folder', 'Folder description', parentFolder.sys_id);
        emptyFile = await hxprApi.documentServiceApi.createFile('EmptyFile', 'File description', childFolder.sys_id);

        const filesData: Document[] = DataGenerator.generateFilesData(26, 'paginator');

        await hxprApi.documentServiceApi.createFilesSequentially(filesData, paginationFolder.sys_id);
        await contentBrowserPage.navigate();
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C695713] user should be able to see the folder content and its path reflected in the breadcrumb`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(emptyFile.sys_title)).toBeVisible();

        await expect.soft(contentBrowserPage.mainContentHeader.breadcrumb.getBreadcrumbLink('Child Folder')).toBeVisible();
        await expect.soft(contentBrowserPage.mainContentHeader.breadcrumb.getBreadcrumbLink('Document List Paginator Folder')).toBeVisible();
        await expect(contentBrowserPage.mainContentHeader.breadcrumb.getBreadcrumbLink('Home')).toBeVisible();
    });

    test(`[C695706] user should be able to open a folder from the tree and see its content in the list`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.contentSideNavbar.navigateTo(ContentBrowserLabels.HomeLabel);

        await contentBrowserPage.contentSideNavbar.contentBrowserNavigateTo(parentFolder.sys_title);

        await expect.soft(contentBrowserPage.mainContentContainer.getDocByTestId(childFolder.sys_title)).toBeVisible();
        await expect(contentBrowserPage.mainContentContainer.getDocByTestId(paginationFolder.sys_title)).toBeVisible();
    });

    test(`[C695714] user should be able to change number of items per page and navigate between pages`, async ({ contentBrowserPage }) => {
        const { paginator } = contentBrowserPage.mainContentContainer;
        await contentBrowserPage.navigateToDocument(paginationFolder.sys_id);

        await expect.soft(contentBrowserPage.mainContentContainer.dataRowLocator).toHaveCount(25, { timeout: timeouts.large });

        await paginator.getPaginationRangeAction('next').click();

        await expect.soft(contentBrowserPage.mainContentContainer.dataRowLocator).toHaveCount(1, { timeout: timeouts.large });

        await expect.soft(paginator.getItemsPerPage('25')).toBeVisible();
        await paginator.selectTriggerLocator.click();
        await paginator.getPanelListNumber('50').click();

        await expect(contentBrowserPage.mainContentContainer.dataRowLocator).toHaveCount(26, { timeout: timeouts.large });
    });
});
