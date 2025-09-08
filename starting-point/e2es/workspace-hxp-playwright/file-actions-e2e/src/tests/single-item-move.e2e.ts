/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { expect, test, ViewerTypes } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let parentFolder: Document;
let sourceFolder: Document;
let targetFolder: Document;
let testFolder: Document;
let testDocument: Document;

const snackbarMessages = {
    fileMoved: 'File has been moved',
    folderMoved: 'Folder has been moved',
};

test.use({ storageState: getUserState('hruser') });

test.describe('Workspace-HxP Tests - Single Item Move', () => {
    test.beforeEach(async ({ hxprApi, contentBrowserPage }, workerInfo) => {
        await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);
        /**
         * A file with a blob is required to display the move feature button.
         * Hence we upload a file before the test begins.
         */
        parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Single-Item-Move', 'Folder Description', 'hr');
        sourceFolder = await hxprApi.documentServiceApi.createFolder('sourceFolder', 'Source Folder', parentFolder.sys_id);
        targetFolder = await hxprApi.documentServiceApi.createFolder('targetFolder', 'Target Folder', parentFolder.sys_id);
        testFolder = await hxprApi.documentServiceApi.createFolder('testFolder', 'Test Folder', sourceFolder.sys_id);
        testDocument = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, sourceFolder.sys_id);

        await contentBrowserPage.navigateToDocument(sourceFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[XAT-383] User should find "Move" button as disabled, when destination folder is the same as the parent folder`, async ({
        contentBrowserPage,
    }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(testDocument.sys_title).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();

        await expect(contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Move')).toBeVisible();

        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByText('Move').click();
        await expect(contentBrowserPage.fileActionDialog.getDialogHeaderLocator()).toContainText('Move item to');
        await expect(contentBrowserPage.fileActionDialog.getSelectedFolderNameLocator).toBeVisible();
        await expect(contentBrowserPage.fileActionDialog.subFoldersListLocator).toBeVisible();
        await expect(contentBrowserPage.fileActionDialog.getButtonByText('Cancel')).toBeVisible();
        await expect(contentBrowserPage.fileActionDialog.getButtonByText('Move')).toBeVisible();
        await expect(contentBrowserPage.fileActionDialog.getSelectedFolderNameLocator).toContainText(sourceFolder.sys_title);
        await expect(contentBrowserPage.fileActionDialog.getButtonByText('Move')).toBeDisabled();
    });

    test(`[XAT-385] User should be able to move a single file using action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.performToolbarAction(testDocument.sys_title, 'Move');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.performAction(targetFolder.sys_title, 'Move');

        await expect(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.fileMoved);

        await contentBrowserPage.navigateToDocument(testDocument.sys_id);
        await contentBrowserPage.page.waitForLoadState('domcontentloaded');

        await expect(contentBrowserPage.documentViewer.getViewerByType(ViewerTypes.Pdf)).toBeVisible();

        const expectedBreadcrumb = ['Home', parentFolder.sys_title, targetFolder.sys_title, testDocument.sys_title];
        const breadcrumbArray = await contentBrowserPage.documentViewer.getBreadcrumbArray();

        expect(breadcrumbArray).toEqual(expectedBreadcrumb);
    });

    test(`[XAT-390] User should be able to move a single folder using action toolbar`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(sourceFolder.sys_id);
        await contentBrowserPage.performToolbarAction(testFolder.sys_title, 'Move');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.performAction(targetFolder.sys_title, 'Move');
        await contentBrowserPage.navigateToDocument(targetFolder.sys_id);

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFolder.sys_title)).toBeVisible();
    });

    test(`[XAT-389] User should be able to move a single file using context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(sourceFolder.sys_id);
        await contentBrowserPage.performContextMenuAction(testDocument.sys_title, 'Move');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.performAction(targetFolder.sys_title, 'Move');

        await expect(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.fileMoved);
        await expect(contentBrowserPage.hxpDatatableBody.getCheckboxForElement(testDocument.sys_title)).not.toBeVisible();

        await contentBrowserPage.navigateToDocument(targetFolder.sys_id);
        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testDocument.sys_title)).toBeVisible();
    });

    test(`[XAT-391] User should be able to move a single folder using context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(sourceFolder.sys_id);
        await contentBrowserPage.performContextMenuAction(testFolder.sys_title, 'Move');
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.performAction(targetFolder.sys_title, 'Move');
        await contentBrowserPage.navigateToDocument(targetFolder.sys_id);

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(testFolder.sys_title)).toBeVisible();
    });

    test(`[XAT-16861] User should be able to move a single folder using document tree context menu`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.mainContentContainer.waitForRootElement();
        await contentBrowserPage.contentSideNavbar.contentBrowserNavigateTo(sourceFolder.sys_title);
        await contentBrowserPage.page.waitForLoadState('networkidle');
        await contentBrowserPage.contentSideNavbar.ellipsisLocator(testFolder.sys_title).click();
        await contentBrowserPage.hxpContextMenuComponent.getMenuByName('Move').click();
        await contentBrowserPage.fileActionDialog.getIconByNameLocator('arrow_back').click();
        await contentBrowserPage.fileActionDialog.performAction(targetFolder.sys_title, 'Move');

        await expect(contentBrowserPage.snackBar.message).toContainText(snackbarMessages.folderMoved);
    });
});
