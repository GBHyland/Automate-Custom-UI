/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, TestFlags, getUserState, files } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

const dataSourceName = 'HXPR0000';
const categoryName = 'govern…/FINANCE';
const status = 'Under Retention';
const dispositionDate = 'Tomorrow';
const initialLabelText = 'Search for records using advanced filtering';
let parentFolder: Document;
let uploadedFile: Document;
let uploadedFileTitle: string;

test.use({ storageState: getUserState('repoadmin') });

test.describe('Governance Search', async () => {
    test.beforeEach(async ({ skipOrExecuteTestBasedOnFlagStatus, contentBrowserPage, hxprApi }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicGovernanceWorkspaceExtension, 'new-functionality');

        parentFolder = await hxprApi.documentServiceApi.createFolder('Parent Folder', 'Folder description');
        uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, parentFolder.sys_id, {
            sys_primaryType: 'gov-file-type',
        });
        uploadedFileTitle = uploadedFile.sys_title;
        await contentBrowserPage.navigate();
        await contentBrowserPage.contentSideNavbar.governanceButtonLocator.click();
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`${TestFlags.UnderFF} [XAT-18234] User should be able to filter records by Data Source`, async ({ governancePage }) => {
        await governancePage.dataSourceSearchFilter.dataSourceFilterLocator.click();
        await governancePage.multiSelectionFilter.matSelectionList.getCheckboxByLabel(dataSourceName).click();
        await governancePage.overlayActions.applyButton.click();

        await expect(governancePage.searchResults.noSearchResultsLabel).toHaveText(
            'No records found for the selected filters. Adjust your search criteria and try again.'
        );
    });

    test(`${TestFlags.UnderFF} [XAT-18235] User should be able to filter records by Category`, async ({ governancePage }) => {
        await governancePage.categoryFilter.categoryFilterLocator.click();
        await governancePage.multiSelectionFilter.matSelectionList.getCheckboxByLabel(categoryName).click();
        await governancePage.overlayActions.applyButton.click();
        await governancePage.searchResults.changePageSize('100');

        await expect.soft(governancePage.recordList.getRowByName(uploadedFileTitle)).toBeVisible();
        await expect(governancePage.recordList.getCategoryCellByRow(uploadedFileTitle)).toContainText(' FINANCE ');
    });

    test(`${TestFlags.UnderFF} [XAT-18240] User should be able to filter records by Status`, async ({ governancePage }) => {
        await governancePage.statusFilter.statusFilterLocator.click();
        await governancePage.multiSelectionFilter.matSelectionList.getCheckboxByLabel(status).click();
        await governancePage.overlayActions.applyButton.click();
        await governancePage.searchResults.changePageSize('100');

        await expect.soft(governancePage.recordList.getRowByName(uploadedFileTitle)).toBeVisible();
        await expect(governancePage.recordList.getStatusCellByRow(uploadedFileTitle)).toContainText(status);
    });

    test(`${TestFlags.UnderFF} [XAT-18245] User should be able to filter records by Record Name`, async ({ governancePage }) => {
        await governancePage.recordNameFilter.recordNameFilterLocator.click();
        await governancePage.overlayActions.recordNameInputLocator.fill(uploadedFileTitle);
        await governancePage.overlayActions.applyButton.click();
        await governancePage.searchResults.changePageSize('100');

        await expect.soft(governancePage.recordList.getRowByName(uploadedFileTitle)).toBeVisible();
        await expect(governancePage.recordList.getStatusCellByRow(uploadedFileTitle)).toContainText(status);
    });

    test(`${TestFlags.UnderFF} [XAT-18265] User should be able to filter by Disposition Date`, async ({ governancePage }) => {
        await governancePage.dispositionDateFilter.dispositionDateFilterLocator.click();
        await governancePage.multiSelectionFilter.matSelectionList.getListItemByLabel(dispositionDate).click();
        await governancePage.overlayActions.applyButton.click();
        await governancePage.searchResults.changePageSize('100');

        await expect(governancePage.recordList.getRowByName(uploadedFileTitle)).toBeVisible();
    });

    test(`${TestFlags.UnderFF} [XAT-18273] User should be able to reset search filters`, async ({ governancePage }) => {
        await governancePage.categoryFilter.categoryFilterLocator.click();
        await governancePage.multiSelectionFilter.matSelectionList.getCheckboxByLabel(categoryName).click();
        await governancePage.overlayActions.applyButton.click();
        await governancePage.dispositionDateFilter.dispositionDateFilterLocator.click();
        await governancePage.multiSelectionFilter.matSelectionList.getListItemByLabel(dispositionDate).click();
        await governancePage.overlayActions.applyButton.click();
        await governancePage.searchResults.changePageSize('100');

        await expect.soft(governancePage.recordList.getRowByName(uploadedFileTitle)).toBeVisible();

        await governancePage.searchResults.resetButtonLocator.click();

        await expect(governancePage.searchResults.searchInitialLabel).toContainText(initialLabelText);
    });
});
