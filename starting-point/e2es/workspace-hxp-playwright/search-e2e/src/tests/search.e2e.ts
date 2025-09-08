/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import {
    getUsers,
    getUserState,
    UtilRandom,
    DataGenerator,
    DateUtils,
    validateResponse,
    AppNames,
    files,
    TestFlags,
    FeatureFlagsNames,
} from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client/cjs/index';
import { subDays, format } from 'date-fns';

const generatedId = `${UtilRandom.generateAlphaNumeric(8)}`;

const parentFolderName = generatedId + '-pw-e2e-search-parentFolder';
const childFolderName = generatedId + '-pw-e2e-search-childFolder';
const fileName = generatedId + '-pw-e2e-search-emptyFile';

const textToSearch = 'e2e-' + generatedId + '-pw-e2e-search';
const expectedActions: string[] = ['Share', 'Delete', 'Copy', 'Move', 'Info'];
let parentFolder: Document;

test.describe('New Search', async () => {
    test.use({ storageState: getUserState('hruser') });

    test.beforeEach(async ({ contentBrowserPage, hxprApi }, workerInfo) => {
        await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);
        parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(parentFolderName, parentFolderName, 'hr');
        const childFolder = await hxprApi.documentServiceApi.createFolder(childFolderName, childFolderName, parentFolder.sys_id);
        await hxprApi.documentServiceApi.createFile(fileName, fileName, childFolder.sys_id);
        await contentBrowserPage.navigateToRoot();
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[C697258] Perform a search with text input`, async ({ contentBrowserPage, searchPage }) => {
        await test.step('Run a basic text search', async () => {
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
            await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

            expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);
        });

        await test.step('Reset filters and repeat the text search', async () => {
            await searchPage.searchFilters.resetFiltersButton.click();
            await expect(searchPage.searchResults.noResultsLocator).toBeVisible();

            await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

            expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);
        });

        await test.step("Check that text search input doesn't appear in the HXQL search field", async () => {
            await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
            await searchPage.searchResults.waitForSkeletonLoader();

            await expect.soft(searchPage.searchResults.textSearchTabLocator).toHaveAttribute('aria-selected', 'true');
            await expect.soft(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator).toHaveValue(generatedId);

            await searchPage.searchResults.HXQLSearchTabLocator.click();

            await expect.soft(searchPage.searchResults.HXQLSearchTabLocator).toHaveAttribute('aria-selected', 'true');
            await expect(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator).toHaveValue('');
        });
    });

    test(`[C697259] Perform a search with HXQL input`, async ({ contentBrowserPage, searchPage }) => {
        await test.step('Run a blank HXQL search', async () => {
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
            await searchPage.searchResults.HXQLSearchTabLocator.click();
            await contentBrowserPage.mainContentHeader.searchInput.search("SELECT * FROM SysContent WHERE sys_title = 'blank-pw-e2e-search'");

            await expect(searchPage.searchResults.noResultsLocator).toBeVisible();
        });

        await test.step('Run a basic HXQL search', async () => {
            await searchPage.searchResults.HXQLSearchTabLocator.click();
            await contentBrowserPage.mainContentHeader.searchInput.search(`SELECT * FROM SysContent WHERE sys_fulltext = '${textToSearch}'`);

            expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);
        });

        await test.step("Check that HXQL search input doesn't appear in the text search field", async () => {
            await contentBrowserPage.navigateToDocument(parentFolder.sys_id);
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
            await searchPage.searchResults.waitForSkeletonLoader();

            await expect.soft(searchPage.searchResults.HXQLSearchTabLocator).toHaveAttribute('aria-selected', 'true');
            await expect
                .soft(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator)
                .toHaveValue(`SELECT * FROM SysContent WHERE sys_fulltext = '${textToSearch}'`);

            await searchPage.searchResults.textSearchTabLocator.click();

            await expect.soft(searchPage.searchResults.textSearchTabLocator).toHaveAttribute('aria-selected', 'true');
            await expect(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator).toHaveValue('');
        });
    });

    test(`[C704105] User should be able to view search results in table format and context menu actions`, async ({
        contentBrowserPage,
        searchPage,
    }) => {
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

        expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);

        await contentBrowserPage.page.waitForLoadState('networkidle');
        await contentBrowserPage.hxpDatatableBody.getCellsByColumnName('Title').getByText(parentFolderName).click({ button: 'right' });

        const receivedActions = await contentBrowserPage.adfContextMenu.getAllButtonsLocator.allInnerTexts();
        for (const action of expectedActions) {
            expect(receivedActions).toContain(action);
        }
    });

    test(`[C697260] User should be able to navigate search results with pagination`, async ({ hxprApi, contentBrowserPage, searchPage }) => {
        const { getPaginationRangeAction } = searchPage.searchResultListPaginatorComponent;
        const { getContentRowCount } = contentBrowserPage.hxpDatatableBody;
        const filesData: Document[] = DataGenerator.generateFilesData(26 - 3, fileName);

        await hxprApi.documentServiceApi.createFilesSequentially(filesData, parentFolder.sys_id);
        await contentBrowserPage.navigate();
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

        expect(await searchPage.searchResults.getResultsNumberFromHeader()).toEqual(26);
        expect.soft(await getContentRowCount()).toBe(25);

        await getPaginationRangeAction('next').click();
        expect.soft(await getContentRowCount()).toBe(1);

        await getPaginationRangeAction('previous').click();
        expect.soft(await getContentRowCount()).toBe(25);

        await getPaginationRangeAction('last').click();
        expect.soft(await getContentRowCount()).toBe(1);

        await getPaginationRangeAction('first').click();
        expect(await getContentRowCount()).toBe(25);
    });

    test(`[C704479] Find documents from the last 2 days using custom date`, async ({ contentBrowserPage, searchPage, page }) => {
        const yesterdayDate = subDays(new Date(), 1);

        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await searchPage.searchFilters.getFilterChipButton('createdDate').click();

        await searchPage.createdDateFilter.customDateButton.click();
        await searchPage.createdDateFilter.afterDatePickerInput.fill(format(yesterdayDate, 'MM/dd/yyyy'));
        await searchPage.createdDateFilter.beforeDateToggle.click();
        await searchPage.datePicker.todayButton.click();

        await searchPage.createdDateFilter.applyFilterButton.click();
        const response = await validateResponse(page, '/api/query', 200);

        const responseDates = response.documents.map((doc: Document) => new Date(doc.sys_created));
        const datesOutOfRange = DateUtils.findDatesOutOfRange(responseDates, yesterdayDate, new Date());

        expect
            .soft(
                datesOutOfRange.length,
                `The following dates are out of the specified range:\n${datesOutOfRange.join('\n')}\nquery: "${response.query}"`
            )
            .toEqual(0);

        const labelText = `Created Date: Since ${format(yesterdayDate, 'MMM d, yyyy')} to ${format(new Date(), 'MMM d, yyyy')}`;
        await expect.soft(searchPage.searchFilters.getFilterChipLabel('createdDate')).toContainText(labelText);

        await searchPage.searchFilters.getFilterChipButton('createdDate').click();
        await searchPage.createdDateFilter.clearFilterButton.click();
        await expect(searchPage.searchResults.noResultsLocator).toBeVisible();
    });

    test(`[C704488] Find documents from the last 7 days using quick option`, async ({ contentBrowserPage, searchPage, page }) => {
        const past7DaysDate = subDays(new Date(), 7);
        const todayDate = new Date();

        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await searchPage.searchFilters.getFilterChipButton('createdDate').click();
        await searchPage.createdDateFilter.getQuickFilterButton('7_DAYS').click();
        await searchPage.createdDateFilter.applyFilterButton.click();

        await validateResponse(page, '/api/query', 200);
        await expect.soft(searchPage.searchFilters.getFilterChipLabel('createdDate')).toContainText('Created Date: In the Last 7 days');

        const cellDates = await contentBrowserPage.hxpDatatableBody.getCellsByColumnName('Created').allTextContents();
        const parsedDates = cellDates.map((value) => DateUtils.parseRelativeDate(value));
        const datesOutOfRange = DateUtils.findDatesOutOfRange(parsedDates, past7DaysDate, todayDate);

        expect(datesOutOfRange.length, `The following dates are out of the specified range:\n${datesOutOfRange.join('\n')}`).toEqual(0);
    });

    test(`[XAT-16730] Search 1 file by "Content Type", then clean filter using the "X" in the filter tag`, async ({
        contentBrowserPage,
        searchPage,
    }) => {
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

        expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
        await searchPage.categoryFilter.getCategoryCheckbox('SysFile').click();

        await expect.soft(searchPage.categoryFilter.getFilterTagLabel('SysFile')).toBeVisible();

        await searchPage.categoryFilter.applyFilterButton.click();

        await expect.soft(searchPage.searchFilters.getFilterChipLabel('documentCategory')).toContainText('Content Type: SysFile');
        expect(await searchPage.searchResults.getTableTitleDifference([fileName])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
        await searchPage.categoryFilter.getFilterTagRemoveButton('SysFile').click();
        await searchPage.categoryFilter.applyFilterButton.click();

        expect(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);
    });

    test(`[XAT-16731] Search 2 folders by "Content Type", then clean filter using "clear all"`, async ({ contentBrowserPage, searchPage }) => {
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

        expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
        await searchPage.categoryFilter.getCategoryCheckbox('SysFolder').click();

        await searchPage.categoryFilter.applyFilterButton.click();

        await expect.soft(searchPage.searchFilters.getFilterChipLabel('documentCategory')).toContainText('Content Type: SysFolder');
        expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
        await searchPage.categoryFilter.clearFilterButton.click();

        expect.soft(await searchPage.searchResults.getTableTitleDifference([parentFolderName, childFolderName, fileName])).toEqual([]);
    });

    test(`[XAT-16894] Find 2 documents by "Document Location", then clean filter using the "X" in the filter tag`, async ({
        contentBrowserPage,
        searchPage,
    }) => {
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await searchPage.searchFilters.getFilterChipButton('documentLocation').click();

        await expect.soft(searchPage.locationFilter.getTreeItem(parentFolderName)).toBeVisible();
        await expect.soft(searchPage.locationFilter.getTreeItem(childFolderName)).not.toBeVisible();

        await searchPage.locationFilter.expandNode(parentFolderName);
        await expect.soft(searchPage.locationFilter.getTreeItem(childFolderName)).toBeVisible();

        await searchPage.locationFilter.getTreeItem(parentFolderName).click();
        await expect.soft(searchPage.locationFilter.getFilterTagLabel(parentFolderName)).toBeVisible();

        await searchPage.locationFilter.applyFilterButton.click();

        await expect.soft(searchPage.searchFilters.getFilterChipLabel('documentLocation')).toContainText(`${parentFolderName}`);
        expect.soft(await searchPage.searchResults.getTableTitleDifference([childFolderName, fileName])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('documentLocation').click();
        await searchPage.locationFilter.getFilterTagRemoveButton(parentFolderName).click();
        await searchPage.locationFilter.applyFilterButton.click();

        await expect(searchPage.searchResults.noResultsLocator).toBeVisible();
    });

    test(`[XAT-16895] Find 1 document by searching in "Document Location", then clean filter using "Clear all"`, async ({
        contentBrowserPage,
        searchPage,
    }) => {
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await searchPage.searchFilters.getFilterChipButton('documentLocation').click();
        await searchPage.locationFilter.searchWithinFilter(generatedId);

        await expect.soft(searchPage.locationFilter.getSearchResultsListItemTitle(parentFolderName)).toBeVisible();
        await expect.soft(searchPage.locationFilter.getSearchResultsListItemTitle(childFolderName)).toBeVisible();

        await searchPage.locationFilter.getSearchResultsListItem(childFolderName).click();
        await searchPage.locationFilter.applyFilterButton.click();

        expect.soft(await searchPage.searchResults.getTableTitleDifference([fileName])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('documentLocation').click();
        await searchPage.locationFilter.clearFilterButton.click();

        await expect(searchPage.searchResults.noResultsLocator).toBeVisible();
    });

    test(`[XAT-16896] Store last used search for Created Date and Document Category filters`, async ({ contentBrowserPage, searchPage }) => {
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);
        await searchPage.searchResults.waitForSkeletonLoader();

        await searchPage.searchFilters.getFilterChipButton('createdDate').click();
        await searchPage.createdDateFilter.getQuickFilterButton('7_DAYS').click();
        await searchPage.createdDateFilter.applyFilterButton.click();
        await searchPage.searchResults.waitForSkeletonLoader();

        await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
        await searchPage.categoryFilter.getCategoryCheckbox('SysFile').click();
        await searchPage.createdDateFilter.applyFilterButton.click();

        expect.soft(await searchPage.searchResults.getTableTitleDifference([fileName])).toEqual([]);

        await contentBrowserPage.hxpDatatableBody.getRowByName(fileName).click();
        await contentBrowserPage.documentViewer.closeButtonLocator.click();

        await expect.soft(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator).toHaveValue(generatedId);
        await expect.soft(searchPage.searchFilters.getFilterChipLabel('createdDate')).toContainText('Created Date: In the Last 7 days');
        await expect.soft(searchPage.searchFilters.getFilterChipLabel('documentCategory')).toContainText('Content Type: SysFile');
        expect(await searchPage.searchResults.getTableTitleDifference([fileName])).toEqual([]);
    });

    test(`[XAT-17165] Find 2 files searching by Document in "File Type" filter then clear all filters`, async ({
        hxprApi,
        contentBrowserPage,
        searchPage,
    }) => {
        const mimeTypeFolderName = generatedId + '-pw-e2e-search-mimeTypeFolder';
        const mimeTypeFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(mimeTypeFolderName, mimeTypeFolderName, 'hr');
        await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, mimeTypeFolder.sys_id);
        await hxprApi.uploadServiceApi.uploadFile(files.docFile, mimeTypeFolder.sys_id);

        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);

        // Ensure the test is agnostic to search results; validate only filter behavior
        const expectedResults = await searchPage.searchResults.table.getDataRowTitles();

        await searchPage.searchFilters.getFilterChipButton('fileType').click();

        await expect.soft(searchPage.fileTypeFilter.getFileMimeTypeParent('Documents')).toBeVisible();

        await searchPage.fileTypeFilter.getFileMimeTypeParent('Documents').click();
        await searchPage.fileTypeFilter.applyFilterButton.click();

        expect.soft(await searchPage.searchResults.getTableTitleDifference([files.pdfFile.title, files.docFile.title])).toEqual([]);

        await searchPage.searchFilters.getFilterChipButton('fileType').click();
        await searchPage.fileTypeFilter.clearFilterButton.click();

        expect(await searchPage.searchResults.getTableTitleDifference(expectedResults)).toEqual([]);
    });

    test(`[XAT-17166] Find 1 file searching by PDF in "File Type" filter`, async ({ hxprApi, contentBrowserPage, searchPage }) => {
        const mimeTypeFolderName = generatedId + '-pw-e2e-search-mimeTypeFolder';
        const mimeTypeFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(mimeTypeFolderName, mimeTypeFolderName, 'hr');
        await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, mimeTypeFolder.sys_id);
        await hxprApi.uploadServiceApi.uploadFile(files.docFile, mimeTypeFolder.sys_id);

        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);
        await searchPage.searchResults.waitForSkeletonLoader();

        await searchPage.searchFilters.getFilterChipButton('fileType').click();

        await searchPage.fileTypeFilter.searchWithinFilter('pdf');
        await searchPage.fileTypeFilter.getFileMimeTypeTreeItem('Portable Document Format').click();
        await searchPage.fileTypeFilter.applyFilterButton.click();

        await expect.soft(searchPage.searchFilters.getFilterChipLabel('fileType')).toContainText('File Type: Portable Document Format (.pdf)');
        expect(await searchPage.searchResults.getTableTitleDifference([files.pdfFile.title])).toEqual([]);
    });
});

test.describe('New Search - Interactive login', async () => {
    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`${TestFlags.UnderFF} [XAT-17106-OLD] Don't store last used search for Created Date and Document Category filters after logout and login`, async ({
        hxpIdpLoginPage,
        contentBrowserPage,
        searchPage,
        skipOrExecuteTestBasedOnFlagStatus,
        hxprApi,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'old-functionality');

        await test.step('Provision', async () => {
            parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(parentFolderName, parentFolderName, 'hr');
            const childFolder = await hxprApi.documentServiceApi.createFolder(childFolderName, childFolderName, parentFolder.sys_id);
            await hxprApi.documentServiceApi.createFile(fileName, fileName, childFolder.sys_id);
            await contentBrowserPage.navigate();
        });
        await test.step('Login', async () => {
            await expect(hxpIdpLoginPage.email).toBeVisible();

            const users = getUsers();

            await hxpIdpLoginPage.loginUser(
                { username: users['hruser'].username, password: users['hruser'].password.split('\\').join('') },
                AppNames.WorkspaceHxP,
                { withNavigation: false, waitForLoading: true }
            );
        });

        await test.step('Search document by Created Date and Document Category', async () => {
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
            await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);
            await searchPage.searchResults.waitForSkeletonLoader();

            await searchPage.searchFilters.getFilterChipButton('createdDate').click();
            await searchPage.createdDateFilter.getQuickFilterButton('7_DAYS').click();
            await searchPage.createdDateFilter.applyFilterButton.click();
            await searchPage.searchResults.waitForSkeletonLoader();

            await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
            await searchPage.categoryFilter.getCategoryCheckbox('SysFile').click();
            await searchPage.createdDateFilter.applyFilterButton.click();

            expect.soft(await searchPage.searchResults.getTableTitleDifference([fileName])).toEqual([]);
        });

        await test.step('Logout', async () => {
            await contentBrowserPage.headerComponent.moreActionsMenuButton.click();
            await contentBrowserPage.matMenuComponent.getMenuItemByText('Sign Out').click();

            await expect.soft(hxpIdpLoginPage.logoutLabel).toContainText('You are now logged out.');
        });

        await test.step('Login', async () => {
            await contentBrowserPage.navigate();
            await expect(hxpIdpLoginPage.email).toBeVisible();

            const hruser = getUsers().hruser;

            await hxpIdpLoginPage.loginUser(
                {
                    username: hruser.username,
                    password: hruser.password,
                },
                AppNames.WorkspaceHxP,
                { waitForLoading: true }
            );
        });

        await test.step('Validate that last used search is not stored after logout and login', async () => {
            await contentBrowserPage.navigate();
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();

            await expect.soft(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator).toHaveValue('');
            await expect.soft(searchPage.searchFilters.getFilterChipLabel('createdDate')).toContainText('Created Date');
            await expect.soft(searchPage.searchFilters.getFilterChipLabel('documentCategory')).toContainText('Content Type');
            await expect(searchPage.searchResults.noResultsLocator).toBeVisible();
        });
    });

    test(`${TestFlags.UnderFF} [XAT-17106] Don't store last used search for Created Date and Document Category filters after logout and login`, async ({
        hxpIdpLoginPage,
        contentBrowserPage,
        searchPage,
        skipOrExecuteTestBasedOnFlagStatus,
        hxprApi,
    }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.CicWorkspaceSatoriApplicationChrome, 'new-functionality');

        await test.step('Provision', async () => {
            parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(parentFolderName, parentFolderName, 'hr');
            const childFolder = await hxprApi.documentServiceApi.createFolder(childFolderName, childFolderName, parentFolder.sys_id);
            await hxprApi.documentServiceApi.createFile(fileName, fileName, childFolder.sys_id);
            await contentBrowserPage.navigate();
        });

        await test.step('Login', async () => {
            await expect(hxpIdpLoginPage.email).toBeVisible();

            const users = getUsers();

            await hxpIdpLoginPage.loginUser(
                { username: users['hruser'].username, password: users['hruser'].password.split('\\').join('') },
                AppNames.WorkspaceHxP,
                { withNavigation: false, waitForLoading: true }
            );
        });

        await test.step('Search document by Created Date and Document Category', async () => {
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
            await contentBrowserPage.mainContentHeader.searchInput.search(generatedId);
            await searchPage.searchResults.waitForSkeletonLoader();

            await searchPage.searchFilters.getFilterChipButton('createdDate').click();
            await searchPage.createdDateFilter.getQuickFilterButton('7_DAYS').click();
            await searchPage.createdDateFilter.applyFilterButton.click();
            await searchPage.searchResults.waitForSkeletonLoader();

            await searchPage.searchFilters.getFilterChipButton('documentCategory').click();
            await searchPage.categoryFilter.getCategoryCheckbox('SysFile').click();
            await searchPage.createdDateFilter.applyFilterButton.click();

            expect.soft(await searchPage.searchResults.getTableTitleDifference([fileName])).toEqual([]);
        });

        await test.step('Logout', async () => {
            await contentBrowserPage.hxpApplicationChromeComponent.userAvatarButton.click();
            await contentBrowserPage.matMenuComponent.getMenuItemByText('Sign Out').click();

            await expect.soft(hxpIdpLoginPage.logoutLabel).toContainText('You are now logged out.');
        });

        await test.step('Login', async () => {
            await contentBrowserPage.navigate();
            await expect(hxpIdpLoginPage.email).toBeVisible();

            const hruser = getUsers().hruser;

            await hxpIdpLoginPage.loginUser(
                {
                    username: hruser.username,
                    password: hruser.password,
                },
                AppNames.WorkspaceHxP,
                { waitForLoading: true }
            );
        });

        await test.step('Validate that last used search is not stored after logout and login', async () => {
            await contentBrowserPage.navigate();
            await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();

            await expect.soft(contentBrowserPage.mainContentHeader.searchInput.searchInputLocator).toHaveValue('');
            await expect.soft(searchPage.searchFilters.getFilterChipLabel('createdDate')).toContainText('Created Date');
            await expect.soft(searchPage.searchFilters.getFilterChipLabel('documentCategory')).toContainText('Content Type');
            await expect(searchPage.searchResults.noResultsLocator).toBeVisible();
        });
    });
});
