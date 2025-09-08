/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, getUserState, files, UtilRandom, TestFlags } from '@alfresco-dbp/playwright/shared';
import { expect, test, ViewerTypes } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;
let uploadedFile: Document;
let updatedFileName: string;

test.use({ storageState: getUserState('hruser') });

async function setupVersioningTest(hxprApi, contentBrowserPage, skipOrExecuteTestBasedOnFlagStatus, featureFlag) {
    await skipOrExecuteTestBasedOnFlagStatus(test, featureFlag, 'new-functionality');
    parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Parent Folder', 'Folder description', 'hr');
    uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, parentFolder.sys_id, {
        sys_mixinTypes: ['SysVersionable', 'SysFilish'],
        sys_primaryType: 'versionable-file',
    });
    updatedFileName = `e2e--${UtilRandom.generateAlphaNumeric(8)}.pdf`;
    await hxprApi.checkInServiceApi.checkInDocument(uploadedFile.sys_id);
    await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);
}

test.describe('Manage Versioning (WorkspaceVersioning)', () => {
    test.beforeEach(async ({ hxprApi, contentBrowserPage, skipOrExecuteTestBasedOnFlagStatus }) => {
        await setupVersioningTest(hxprApi, contentBrowserPage, skipOrExecuteTestBasedOnFlagStatus, FeatureFlagsNames.WorkspaceVersioning);
    });
    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`${TestFlags.UnderFF} [XAT-17655] User should be able to create different versions and manage/view from manage version panel`, async ({
        contentBrowserPage,
    }) => {
        await test.step('Check if the version is visible in the manage version side panel', async () => {
            await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
            await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Manage Versions').click();

            await expect.soft(contentBrowserPage.manageVersionsSidebar.getAllVersion).toHaveCount(2);
        });

        await test.step('Create another version by editing the document metadata and check if the document is viewable', async () => {
            await contentBrowserPage.documentViewer.infoButtonLocator.click();
            await contentBrowserPage.documentViewer.propertiesViewer.editFileName(updatedFileName);
            await contentBrowserPage.documentViewer.propertiesViewer.saveButtonLocator.click();

            await expect.soft(contentBrowserPage.snackBar.message).toContainText('Properties updated successfully!');

            await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
            await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Save to Version History').click();

            await expect.soft(contentBrowserPage.snackBar.message).toContainText('New version has been saved');

            await contentBrowserPage.documentViewer.waitforReload();

            await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
            await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Manage Versions').click();

            await expect.soft(contentBrowserPage.manageVersionsSidebar.getAllVersion).toHaveCount(3);

            await contentBrowserPage.manageVersionsSidebar.getNthVersionLocator(2).click();
            await contentBrowserPage.documentViewer.waitforReload();

            await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Pdf)).toBeVisible();
        });
    });

    test(`${TestFlags.UnderFF} [XAT-17741] User should be able to edit the version information and delete a version`, async ({
        contentBrowserPage,
    }) => {
        await test.step('Create a new version and edit the version information', async () => {
            await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
            await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Manage Versions').click();

            await contentBrowserPage.manageVersionsSidebar.getMoreActionsButtonForNthVersion(1).click();
            await contentBrowserPage.manageVersionsSidebar.editVersionInfo('New Version Title', 'New Version Description');

            await expect.soft(contentBrowserPage.snackBar.message).toContainText('The version information has been updated');
            await expect.soft(contentBrowserPage.manageVersionsSidebar.getNthVersionTitle(1)).toContainText('New Version Title');
            await expect.soft(contentBrowserPage.manageVersionsSidebar.getNthVersionDescription(1)).toContainText('New Version Description');
            await expect.soft(contentBrowserPage.manageVersionsSidebar.getAllVersion).toHaveCount(2);
        });
        await test.step('Delete a version', async () => {
            await contentBrowserPage.manageVersionsSidebar.getMoreActionsButtonForNthVersion(1).click();
            await contentBrowserPage.manageVersionsSidebar.matMenuComponent.getButtonByNameLocator('Delete').click();
            await contentBrowserPage.manageVersionsSidebar.matDialogContainer.getButtonByText('Delete Version').click();

            await expect.soft(contentBrowserPage.snackBar.message).toContainText('The version has been deleted');
            await expect(contentBrowserPage.manageVersionsSidebar.getAllVersion).toHaveCount(1);
        });
    });

    test(`${TestFlags.UnderFF} [XAT-17882] User should be able to create a new version by replacing the document file`, async ({
        contentBrowserPage,
        page,
    }) => {
        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Replace file').click(),
        ]);
        await fileChooser.setFiles(files.txtFile.path);

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File replaced successfully.');

        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Save to Version History').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('New version has been saved');

        await contentBrowserPage.documentViewer.waitforReload();

        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Manage Versions').click();

        await expect.soft(contentBrowserPage.manageVersionsSidebar.getAllVersion).toHaveCount(3);

        await contentBrowserPage.manageVersionsSidebar.getNthVersionLocator(1).click();
        await contentBrowserPage.documentViewer.waitforReload();

        await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Txt)).toBeVisible();
    });
});

test.describe('Manage Versioning (VersioningNewContextMenu)', () => {
    test.beforeEach(async ({ hxprApi, contentBrowserPage, skipOrExecuteTestBasedOnFlagStatus }) => {
        await setupVersioningTest(hxprApi, contentBrowserPage, skipOrExecuteTestBasedOnFlagStatus, FeatureFlagsNames.VersioningNewContextMenu);
    });
    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`${TestFlags.UnderFF} [XAT-17937] User should be able to download a versionable file from context actions`, async ({
        contentBrowserPage,
    }) => {
        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByNameLocator('Manage Versions').click();
        await contentBrowserPage.manageVersionsSidebar.getMoreActionsButtonForNthVersion(1).click();
        await contentBrowserPage.manageVersionsSidebar.downloadButton.click();
        await expect(contentBrowserPage.snackBar.message).toContainText('File has been downloaded successfully!');
    });

    test(`${TestFlags.UnderFF} [XAT-17938] User should be able to share a versionable file from context actions`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByNameLocator('Manage Versions').click();
        await contentBrowserPage.manageVersionsSidebar.getMoreActionsButtonForNthVersion(1).click();
        await contentBrowserPage.manageVersionsSidebar.shareButton.click();
        await contentBrowserPage.fileActionDialog.getCopyToClipboardButtonLocator.click();
        const shareableFileLink = await contentBrowserPage.getClipboardData();
        await contentBrowserPage.page.goto(shareableFileLink);
        await expect(contentBrowserPage.documentViewer.adfViewerLocator).toBeVisible();
    });

    test(`${TestFlags.UnderFF} [XAT-17939] User should be able to restore a versionable file from context actions`, async ({
        contentBrowserPage,
        page,
    }) => {
        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Replace file').click(),
        ]);
        await fileChooser.setFiles(files.txtFile.path);

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('File replaced successfully.');

        await expect.soft(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Txt)).toBeVisible();
        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Save to Version History').click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText('New version has been saved');

        await contentBrowserPage.documentViewer.waitforReload();

        await contentBrowserPage.documentViewer.moreActionsButtonLocator.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Manage Versions').click();

        await contentBrowserPage.manageVersionsSidebar.getMoreActionsButtonForNthVersion(2).click();
        await contentBrowserPage.manageVersionsSidebar.restoreButton.click();
        await expect.soft(contentBrowserPage.snackBar.message).toContainText('Version has been restored.');
        await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Pdf)).toBeVisible();
    });
});
