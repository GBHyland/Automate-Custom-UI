/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentPermissions } from '@alfresco-dbp/playwright/shared/api/services/content-service/document-service-api';

let parentFolder: Document;
let childFolder: Document;
let uploadedFile: Document;
let uploadedFileSysTitle: string;

test.describe('Display icons according to Document permissions as hr user', () => {
    test.use({ storageState: getUserState('hruser') });
    test.beforeEach(async ({ contentBrowserPage, hxprApi }, workerInfo) => {
        await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);

        parentFolder = await hxprApi.documentServiceApi.createFolder('Permission-Management-e2e', 'Folder Description');
        childFolder = await hxprApi.documentServiceApi.createFolder('permission-test', 'Child Folder', parentFolder.sys_id);
        uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, childFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C695034] should display icons based on Read permission`, async ({ hxprApi, contentBrowserPage }) => {
        const { getCellByColumnNameAndRowItem } = contentBrowserPage.hxpDatatableBody;

        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', childFolder, DocumentPermissions.READ);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(getCellByColumnNameAndRowItem(uploadedFile.sys_title, 'Permission')).toContainText('Read');
    });

    test(`[C695035] should display icons based on ReadWrite permission`, async ({ hxprApi, contentBrowserPage }) => {
        const { getCellByColumnNameAndRowItem } = contentBrowserPage.hxpDatatableBody;

        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', childFolder, DocumentPermissions.READ_WRITE);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(getCellByColumnNameAndRowItem(uploadedFile.sys_title, 'Permission')).toContainText('Read and Write');
    });

    test(`[C695036] should display icons based on Everything permission`, async ({ hxprApi, contentBrowserPage }) => {
        const { getCellByColumnNameAndRowItem } = contentBrowserPage.hxpDatatableBody;

        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', childFolder, DocumentPermissions.EVERYTHING);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(getCellByColumnNameAndRowItem(uploadedFile.sys_title, 'Permission')).toContainText('Everything');
    });

    test(`[C698930] should be able to display icons based on edit permission from Read & Write to Everything on a folder`, async ({
        hxprApi,
        contentBrowserPage,
    }) => {
        const { getCellByColumnNameAndRowItem } = contentBrowserPage.hxpDatatableBody;

        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', childFolder, DocumentPermissions.READ_WRITE);
        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', childFolder, DocumentPermissions.EVERYTHING);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(getCellByColumnNameAndRowItem(uploadedFile.sys_title, 'Permission')).toContainText('Everything');
    });

    test(`[C699039] should be able to display icons based on edit permission from Read to Read & Write on a folder `, async ({
        hxprApi,
        contentBrowserPage,
    }) => {
        const { getCellByColumnNameAndRowItem } = contentBrowserPage.hxpDatatableBody;

        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', childFolder, DocumentPermissions.READ);
        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', childFolder, DocumentPermissions.READ_WRITE);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(getCellByColumnNameAndRowItem(uploadedFile.sys_title, 'Permission')).toContainText('Read and Write');
    });

    test(`[XAT-17649] user should not able to see the file, when no permission is given to the file. `, async ({ contentBrowserPage }) => {
        const noPermissionMessage = "You don't have the required permissions to access this path";
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);

        await expect(contentBrowserPage.snackBar.message).toContainText(noPermissionMessage);
    });
});

test.describe('Add and Edit Permissions for user/group as Repoadmin', () => {
    const addPermissionSuccessMessage = 'Permissions update on this document';
    test.use({ storageState: getUserState('repoadmin') });
    test.beforeEach(async ({ hxprApi, contentBrowserPage }, workerInfo) => {
        await contentBrowserPage.refreshUserState('repoadmin', workerInfo.project.use);

        parentFolder = await hxprApi.documentServiceApi.createFolder('Permission-Management-e2e', 'Folder Description');
        childFolder = await hxprApi.documentServiceApi.createFolder('permission-test', 'Child Folder', parentFolder.sys_id);
        uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, childFolder.sys_id);

        uploadedFileSysTitle = uploadedFile.sys_title;

        await contentBrowserPage.navigateToDocument(childFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C695041] should be able to add Read permission on a document`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileSysTitle).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByExactText('Permissions').click();
        await contentBrowserPage.permissionDialog.addPermissionToEntity('hr', 'Read');

        await expect(contentBrowserPage.snackBar.message).toContainText(addPermissionSuccessMessage);
    });

    test(`[C695042] should be able to add ReadWrite permission on a document`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileSysTitle).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByExactText('Permissions').click();
        await contentBrowserPage.permissionDialog.addPermissionToEntity('hr', 'Read & Write');

        await expect(contentBrowserPage.snackBar.message).toContainText(addPermissionSuccessMessage);
    });

    test(`[C695343] should be able to add Everything permission on a document`, async ({ contentBrowserPage }) => {
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileSysTitle).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByExactText('Permissions').click();
        await contentBrowserPage.permissionDialog.addPermissionToEntity('hr', 'Everything');

        await expect(contentBrowserPage.snackBar.message).toContainText(addPermissionSuccessMessage);
    });

    test(`[C695344] should be able to edit permission from Everything to Read on a folder`, async ({ hxprApi, contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', uploadedFile, DocumentPermissions.READ_WRITE);

        await contentBrowserPage.navigateToDocument(childFolder.sys_id);
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileSysTitle).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByExactText('Permissions').click();
        await contentBrowserPage.permissionDialog.editPermissionToEntity('Read');

        await expect(contentBrowserPage.snackBar.message).toContainText(addPermissionSuccessMessage);
    });

    test(`[C695345] should be able to edit permission from Everything to No Access on a folder`, async ({ hxprApi, contentBrowserPage }) => {
        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', uploadedFile, DocumentPermissions.READ_WRITE);

        await contentBrowserPage.navigateToDocument(childFolder.sys_id);
        await contentBrowserPage.hxpDatatableBody.getCheckboxForElement(uploadedFileSysTitle).click();
        await contentBrowserPage.adfToolbar.moreActionsMenuButton.click();
        await contentBrowserPage.documentMoreMenuPanelComponent.getButtonByExactText('Permissions').click();
        await contentBrowserPage.permissionDialog.editPermissionToEntity('No Access');

        await expect(contentBrowserPage.snackBar.message).toContainText(addPermissionSuccessMessage);
    });
});
