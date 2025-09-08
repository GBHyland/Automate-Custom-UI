/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, files } from '@alfresco-dbp/playwright/shared';
import { DocumentPermissions } from '@alfresco-dbp/playwright/shared/api/services/content-service/document-service-api';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

const groupPermissionRestoreSuccessMessage = 'Group permissions have been restored successfully.';
const individualUserPermissionRestoreSuccessMessage = 'User permissions have been restored successfully.';

let parentFolder: Document;
let childFolder: Document;
let uploadedFile: Document;
let uploadedFileName: string;

test.use({ storageState: getUserState('repoadmin') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }) => {
    parentFolder = await hxprApi.documentServiceApi.createFolder('Parent-Folder', 'Folder Description');
    childFolder = await hxprApi.documentServiceApi.createFolder('Child-Folder', 'Folder Description', parentFolder.sys_id);
    uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, childFolder.sys_id);
    uploadedFileName = uploadedFile.sys_title;

    await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe(' Restore Permissions ', async () => {
    test(`[XAT-17583] User should be able to restore User Group permissions`, async ({ hxprApi, contentBrowserPage }) => {
        await hxprApi.documentServiceApi.updateGroupPermissionDocument('sales', childFolder, DocumentPermissions.READ);
        await hxprApi.documentServiceApi.updateGroupPermissionDocument('hr', uploadedFile, DocumentPermissions.READ_WRITE);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);
        await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');
        await contentBrowserPage.permissionDialog.restorePermissionsButton.click();
        await contentBrowserPage.permissionDialog.getRestorePermissionsOptionsLocator('User Group').click();
        await contentBrowserPage.permissionDialog.getDialogBoxRestoreButton.click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(groupPermissionRestoreSuccessMessage);

        await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
        await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');

        await expect.soft(contentBrowserPage.permissionDialog.getPermissionTableEntityCell('hr')).not.toBeVisible();
        await expect.soft(contentBrowserPage.permissionDialog.getPermissionTableEntityCell('sales')).toBeVisible();
        expect(await contentBrowserPage.permissionDialog.restorePermissionsButton.isDisabled());
    });

    test(`[XAT-17600] User should be able to restore permissions Individual User`, async ({ hxprApi, contentBrowserPage }) => {
        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', childFolder, DocumentPermissions.READ);
        await hxprApi.documentServiceApi.updateIndividualPermissionDocument('hr hr', uploadedFile, DocumentPermissions.READ_WRITE);
        await contentBrowserPage.navigateToDocument(childFolder.sys_id);
        await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');
        await contentBrowserPage.permissionDialog.switchToTab('Individual Users');

        await expect.soft(contentBrowserPage.permissionDialog.getPermissionTableEntityCell('hr hr')).toBeVisible();
        await expect.soft(contentBrowserPage.permissionDialog.individualUserPermissionStatusLabelLocator).toContainText('Overridden');

        await contentBrowserPage.permissionDialog.restorePermissionsButton.click();
        await contentBrowserPage.permissionDialog.getRestorePermissionsOptionsLocator('Individual User').click();
        await contentBrowserPage.permissionDialog.getDialogBoxRestoreButton.click();

        await expect.soft(contentBrowserPage.snackBar.message).toContainText(individualUserPermissionRestoreSuccessMessage);

        await contentBrowserPage.snackBar.message.waitFor({ state: 'hidden' });
        await contentBrowserPage.performContextMenuAction(uploadedFileName, 'Permissions');
        await contentBrowserPage.permissionDialog.switchToTab('Individual Users');

        await expect.soft(contentBrowserPage.permissionDialog.getPermissionTableEntityCell('hr hr')).toBeVisible();
        await expect(contentBrowserPage.permissionDialog.individualUserPermissionStatusLabelLocator).toContainText('Inherited');
    });
});
