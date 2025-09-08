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

const snackbarMessages = {
    contentCreated: 'Content created successfully.',
};
let parentFolder: Document;

test.use({ storageState: getUserState('hruser') });

test.describe('Folder Creation', async () => {
    test.beforeEach(async ({ contentBrowserPage, hxprApi }) => {
        parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent-Folder', 'Folder description', 'hr');
        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C704113] User should be able to create folder via "create Folder" button`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.page.waitForLoadState('networkidle');
        await contentBrowserPage.mainContentHeader.newFileUploadButton.click();
        await contentBrowserPage.getUploadMenuButtonByText('Create').click();

        await expect(contentBrowserPage.fileActionDialog.getDialogTitleLocator).toContainText('Create New Folder');
        await contentBrowserPage.fileActionDialog.createFolder('NewCreateFolder', 'SysFolder');

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.contentCreated);
        await expect(contentBrowserPage.mainContentHeader.breadcrumb.getBreadcrumbLink('Parent-Folder')).toBeVisible();
        await expect(contentBrowserPage.mainContentContainer.getDocByTestId('NewCreateFolder')).toBeVisible();
    });
});
