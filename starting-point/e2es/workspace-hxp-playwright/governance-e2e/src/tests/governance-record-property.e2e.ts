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

const categoryName = 'govern…/HR';
const baseDate = new Date();
let parentFolder: Document;
let uploadedFile: Document;
let uploadedFileTitle: string;

test.use({ storageState: getUserState('repoadmin') });

test.describe('Governance record properties', async () => {
    test.beforeEach(async ({ skipOrExecuteTestBasedOnFlagStatus, contentBrowserPage, hxprApi }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicGovernanceWorkspaceExtension, 'new-functionality');
        const tomorrowDate = new Date(Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 1, 0, 0, 0, 0));
        const tomorrowDateISO = tomorrowDate.toISOString();

        parentFolder = await hxprApi.documentServiceApi.createFolder('Parent Folder', 'Folder description');
        uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, parentFolder.sys_id, {
            sys_primaryType: 'gov-file-type-property',
            gov_cut_off_date: tomorrowDateISO,
        });
        uploadedFileTitle = uploadedFile.sys_title;
        await contentBrowserPage.navigate();
        await contentBrowserPage.contentSideNavbar.governanceButtonLocator.click();
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`${TestFlags.UnderFF} [XAT-18264] User should be able to view and edit record property`, async ({ governancePage }) => {
        await test.step('open and verify record properties', async () => {
            await governancePage.categoryFilter.categoryFilterLocator.click();
            await governancePage.multiSelectionFilter.matSelectionList.getCheckboxByLabel(categoryName).click();
            await governancePage.overlayActions.applyButton.click();
            await governancePage.searchResults.changePageSize('100');
            await governancePage.recordList.getCheckboxByRow(uploadedFileTitle).click();
            await governancePage.searchResultsActions.recordPropertiesButton.click();

            await expect.soft(governancePage.recordPropertiesSidebar.recordTitleLocator).toHaveText(uploadedFileTitle);
            await expect.soft(governancePage.recordPropertiesSidebar.recordPropertiesHeaderLocator).toContainText('Record Properties');
        });

        await test.step('edit record properties', async () => {
            await governancePage.recordPropertiesSidebar.editButton.click();
            await governancePage.recordPropertiesSidebar.calenderIcon.click();
            const futureDate = new Date(Date.UTC(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + 2, 0, 0, 0, 0));
            const expectedDateString = `${String(futureDate.getUTCMonth() + 1).padStart(2, '0')}/${String(futureDate.getUTCDate()).padStart(
                2,
                '0'
            )}/${futureDate.getUTCFullYear()}`;

            await governancePage.recordPropertiesSidebar.datePicker.setDate(futureDate);
            await governancePage.datePickerActions.okButton.click();
            await governancePage.recordPropertiesSidebar.saveButton.click();
            await governancePage.searchResults.tableSkeletonLoader.waitFor({ state: 'visible' });
            await governancePage.recordList.getCheckboxByRow(uploadedFileTitle).click();
            await governancePage.searchResultsActions.recordPropertiesButton.click();

            await expect.soft(governancePage.recordPropertiesSidebar.hxpPropertyLocator).toContainText('Cutoff Date');
            await expect(governancePage.recordPropertiesSidebar.hxpPropertyLocator).toContainText(expectedDateString);
        });
    });
});
