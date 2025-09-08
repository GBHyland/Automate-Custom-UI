/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, getUserState, files, timeouts } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;
let uploadedFile: Document;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ skipOrExecuteTestBasedOnFlagStatus, hxprApi, contentBrowserPage }, workerInfo) => {
    await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.WorkspaceVersioning, 'new-functionality');
    await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);

    parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent Folder', 'Folder description', 'hr');
    uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, parentFolder.sys_id, {
        sys_mixinTypes: ['SysVersionable', 'SysFilish'],
        sys_primaryType: 'versionable-file',
    });
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Versioning', async () => {
    test(`[XAT-17595] Change versions of a document`, async ({ contentBrowserPage, hxprApi }) => {
        await hxprApi.checkInServiceApi.checkInDocument(uploadedFile.sys_id);
        const versionTag = 'version2';
        await hxprApi.documentServiceApi.updateDocument(uploadedFile, {
            sys_title: `${uploadedFile.sys_title}-${versionTag}`,
        });

        await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);
        await contentBrowserPage.page.waitForLoadState('networkidle');
        await expect.soft(contentBrowserPage.documentViewer.versionSelector).toBeVisible();

        const fileName = await contentBrowserPage.mainContentHeader.breadcrumb.getLastDocumentName();
        expect.soft(fileName).toContain(versionTag);

        await contentBrowserPage.documentViewer.versionSelector.click();
        await contentBrowserPage.dropdownListComponent.getNthOptionLocator(1).click();
        await contentBrowserPage.documentViewer.waitforReload();
        await contentBrowserPage.page.waitForLoadState('networkidle');

        const oldFileName = await contentBrowserPage.mainContentHeader.breadcrumb.getLastDocumentName();
        expect.soft(oldFileName).not.toContain(versionTag);
        expect(oldFileName).not.toEqual(fileName);
    });

    test(`[XAT-17598] Save to version history from the document preview`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);
        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Save to Version History').click();
        await contentBrowserPage.documentViewer.waitforReload();
        await contentBrowserPage.page.waitForLoadState('networkidle');

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('New version has been saved');
        await expect.soft(contentBrowserPage.documentViewer.versionSelector).toBeVisible({ timeout: timeouts.large });

        await contentBrowserPage.documentViewer.versionSelector.click();
        await contentBrowserPage.documentViewer.waitforReload();
        await contentBrowserPage.page.waitForLoadState('networkidle');

        await expect.soft(contentBrowserPage.dropdownListComponent.getNthVersionDropdownOption(1)).toBeVisible({ timeout: timeouts.large });
        expect.soft(await contentBrowserPage.dropdownListComponent.getVersionDropdownList.count()).toEqual(2);
    });

    test(`[XAT-17599] Save to version history from the document list`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFile.sys_title).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByExactText('Save to Version History').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('New version has been saved');

        await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);
        await contentBrowserPage.documentViewer.waitforReload();
        await contentBrowserPage.page.waitForLoadState('networkidle');

        await contentBrowserPage.documentViewer.versionSelector.click();
        await contentBrowserPage.documentViewer.waitforReload();
        await contentBrowserPage.page.waitForLoadState('networkidle');

        await expect.soft(contentBrowserPage.dropdownListComponent.getNthVersionDropdownOption(1)).toBeVisible({ timeout: timeouts.large });
        expect.soft(await contentBrowserPage.dropdownListComponent.getVersionDropdownList.count()).toEqual(2);
    });
});
