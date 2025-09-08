/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { DocumentPermissions } from '@alfresco-dbp/playwright/shared/api/services/content-service/document-service-api';

const updatePermissionSuccessMessage = 'Permissions update on this document';

let parentFolder: Document;
let childFolder: Document;
let uploadedFile: Document;
let uploadedFileName: string;
let childFolderName: string;

test.describe('Permission Inheritance Test for repoadmin', () => {
    test.use({ storageState: getUserState('repoadmin') });
    test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
        parentFolder = await hxprApi.documentServiceApi.createFolder('Parent-Folder', 'Folder Description');
        childFolder = await hxprApi.documentServiceApi.createFolder('Child-Folder', 'Folder Description', parentFolder.sys_id);
        uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, childFolder.sys_id);
        childFolderName = childFolder.sys_title;
        uploadedFileName = uploadedFile.sys_title;

        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[XAT-17517] user should be able to turn off/on permission inheritance `, async ({ contentBrowserPage }) => {
        test.slow();
        await test.step('Set permission to folder', async () => {
            await contentBrowserPage.performContextMenuAction(childFolderName, 'Permissions');
            await contentBrowserPage.permissionDialog.addPermissionToEntity('sales', 'Read');
        });

        await test.step('Check if permission is set to sales group', async () => {
            await contentBrowserPage.navigateToDocument(childFolder.sys_id);
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');

            await expect.soft(contentBrowserPage.permissionDialog.getPermissionTableEntityCell('sales')).toBeVisible();
        });

        await test.step('Turn off permission inheritance and check if inherited permission is blocked', async () => {
            await contentBrowserPage.permissionDialog.getPermissionInheritanceToggle('Off').click();
            await contentBrowserPage.permissionDialog.savePermissionFormButton.click();
            await expect.soft(contentBrowserPage.snackBar.message).toContainText(updatePermissionSuccessMessage);

            await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');

            await expect.soft(contentBrowserPage.permissionDialog.inheritedPermissionColumnLocator).toContainText('Blocked');
        });

        await test.step('Should be able to save local permission when inherited permission is blocked', async () => {
            await contentBrowserPage.permissionDialog.editPermissionToEntity('Read & Write');
            await expect.soft(contentBrowserPage.snackBar.message).toContainText(updatePermissionSuccessMessage);

            await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');

            await expect.soft(contentBrowserPage.permissionDialog.permissionColumnLocator).toContainText('Read & Write');
        });

        await test.step('Turn on permission inheritance and check if inherited permission is retrieved', async () => {
            await contentBrowserPage.permissionDialog.getPermissionInheritanceToggle('On').click();
            await contentBrowserPage.permissionDialog.savePermissionFormButton.click();
            await expect.soft(contentBrowserPage.snackBar.message).toContainText(updatePermissionSuccessMessage);

            await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');

            await expect(contentBrowserPage.permissionDialog.inheritedPermissionColumnLocator).toContainText('Read');
        });
    });

    test('[XAT-17582] user should be able to inherit and override permission for individual users', async ({ contentBrowserPage }) => {
        test.slow();
        await test.step('Should save permission and Document should inherit same permission', async () => {
            await contentBrowserPage.performContextMenuAction(childFolderName, 'Permissions');
            await contentBrowserPage.permissionDialog.switchToTab('Individual Users');
            await contentBrowserPage.permissionDialog.addPermissionToEntity('hr hr', 'Read');

            await expect.soft(contentBrowserPage.snackBar.message).toContainText(updatePermissionSuccessMessage);

            await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
            await contentBrowserPage.navigateToDocument(childFolder.sys_id);
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');
            await contentBrowserPage.permissionDialog.switchToTab('Individual Users');

            await expect.soft(contentBrowserPage.permissionDialog.individualUserPermissionStatusLabelLocator).toContainText('Inherited');
            await expect.soft(contentBrowserPage.permissionDialog.inheritedIndividualUsersPermission('hr hr')).toContainText('Read');
        });

        await test.step('Should override the inherited permission', async () => {
            await contentBrowserPage.permissionDialog.addPermissionToEntity('hr hr', 'Read & Write');

            await expect.soft(contentBrowserPage.snackBar.message).toContainText(updatePermissionSuccessMessage);

            await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');
            await contentBrowserPage.permissionDialog.switchToTab('Individual Users');

            await expect.soft(contentBrowserPage.permissionDialog.individualUserPermissionStatusLabelLocator).toContainText('Overridden');
            await expect.soft(contentBrowserPage.permissionDialog.permissionColumnLocator).toContainText('Read & Write');
        });

        await test.step('Should edit the overridden permission', async () => {
            await contentBrowserPage.permissionDialog.editPermissionToEntity('Everything');

            await expect.soft(contentBrowserPage.snackBar.message).toContainText(updatePermissionSuccessMessage);

            await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
            await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');
            await contentBrowserPage.permissionDialog.switchToTab('Individual Users');

            await expect.soft(contentBrowserPage.permissionDialog.individualUserPermissionStatusLabelLocator).toContainText('Overridden');
            await expect.soft(contentBrowserPage.permissionDialog.permissionColumnLocator).toContainText('Everything');
        });
    });
});

test.describe('Permission Inheritance Test for hruser', () => {
    test.use({ storageState: getUserState('hruser') });
    test.beforeEach(async ({ hxprApi }) => {
        parentFolder = await hxprApi.documentServiceApi.createFolder('Permission-Management-e2e', 'Folder Description');
        childFolder = await hxprApi.documentServiceApi.createFolder('permission-test', 'Child Folder', parentFolder.sys_id);
        uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.txtFile, childFolder.sys_id);
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test('[XAT-17707] A user should not access a child folder with inheritance off, even if the parent has it enabled.', async ({
        hxprApi,
        contentBrowserPage,
    }) => {
        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', parentFolder, DocumentPermissions.EVERYTHING);
        await hxprApi.documentServiceApi.disableDocumentInheritancePermission(childFolder);
        await contentBrowserPage.navigateToDocument(parentFolder.sys_id);

        await expect(contentBrowserPage.hxpDatatableBody.getRowByName(childFolder.sys_title)).not.toBeVisible();
    });
});
