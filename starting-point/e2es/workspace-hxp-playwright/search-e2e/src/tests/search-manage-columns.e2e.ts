/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, UtilRandom } from '@alfresco-dbp/playwright/shared';
import { expect, test } from '@hxp/playwright/workspace-hxp';

const documentToFind = `${UtilRandom.generateAlphaNumeric(8)}`;

const parentFolderDescription = documentToFind + 'pw-e2e-search-parentFolder-';
const fileDescription = documentToFind + 'pw-e2e-search-emptyFile-';

const expectedColumnsList: string[] = ['Title', 'Size', 'Last Modified', 'Permission', 'Content Type'];
const updatedColumnsList: string[] = [...expectedColumnsList, 'Location'];
const reorderColumnsList: string[] = ['', 'Title', 'Created', 'Last Modified', 'Permission', 'Location', 'Size', 'Content Type'];

test.use({ storageState: getUserState('hruser') });

test.describe('Search Manage Columns', async () => {
    test.beforeEach(async ({ contentBrowserPage, hxprApi, searchPage }) => {
        const parentFolder = await hxprApi.documentServiceApi.createFolderWithPermissions(parentFolderDescription, parentFolderDescription, 'hr');
        await hxprApi.documentServiceApi.createFile(fileDescription, fileDescription, parentFolder.sys_id);
        await contentBrowserPage.navigate();

        // search for a document
        await contentBrowserPage.contentSideNavbar.searchButtonLocator.click();
        await contentBrowserPage.mainContentHeader.searchInput.searchInputLocator.fill(documentToFind);
        await searchPage.searchFilters.getButtonByText('search').click();
    });

    test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

    test(`[XAT-16652] User should be able to modify search result columns`, async ({ contentBrowserPage, searchPage }) => {
        await test.step(' Deselect the columns and verify ', async () => {
            await contentBrowserPage.adfToolbar.getButtonByExactText('tune').click();
            await searchPage.manageColumns.removeColumns([' Created ', ' File Type ', 'Location']);
            await searchPage.manageColumns.getButtonByExactText('Update Table').click();
            await contentBrowserPage.mainContentContainer.datatableRowHeader.waitFor();

            await expect.soft(contentBrowserPage.mainContentContainer.columnHeaders).toHaveCount(5);
            expect.soft(await contentBrowserPage.mainContentContainer.columnHeaders.allInnerTexts()).toEqual(expectedColumnsList);
        });

        await test.step(' Search available column and update ', async () => {
            await contentBrowserPage.adfToolbar.getButtonByExactText('tune').click();
            await searchPage.manageColumns.availableColumnSearchContainer.pressSequentially('Location');
            await searchPage.manageColumns.addColumns(['Location']);
            await searchPage.manageColumns.getButtonByExactText('Update Table').click();

            await expect.soft(contentBrowserPage.mainContentContainer.columnHeaders).toHaveCount(6);
            expect.soft(await contentBrowserPage.mainContentContainer.columnHeaders.allInnerTexts()).toEqual(updatedColumnsList);
        });

        await test.step(' Reset to default column list ', async () => {
            await contentBrowserPage.adfToolbar.getButtonByExactText('tune').click();
            await searchPage.manageColumns.getButtonByExactText(' Reset to Default ').click();
            await searchPage.manageColumns.getButtonByExactText('Update Table').click();

            await expect(contentBrowserPage.mainContentContainer.columnHeaders).toHaveCount(8);
        });
    });

    test(`[XAT-16653] User should be able to drag and drop columns to change the order of columns in search result`, async ({
        contentBrowserPage,
        searchPage,
    }) => {
        await contentBrowserPage.adfToolbar.getButtonByExactText('tune').click();
        await searchPage.manageColumns.dragColumnOverColumn('Size', 'Location');
        await searchPage.manageColumns.getButtonByExactText('Update Table').click();
        await contentBrowserPage.mainContentContainer.datatableRowHeader.waitFor();

        await expect.soft(contentBrowserPage.mainContentContainer.columnHeaders).toHaveCount(8);
        expect(await contentBrowserPage.mainContentContainer.columnHeaders.allInnerTexts()).toEqual(reorderColumnsList);
    });

    test(`[XAT-16766] User should be able to resize the column `, async ({ contentBrowserPage }) => {
        const resizeOptions = {
            pixels: 40,
            direction: 'right',
        };
        const initialColumnWidth = await contentBrowserPage.mainContentContainer.getColumnWidth('Size');
        const expectedColumnWidth = Math.ceil(resizeOptions.pixels + initialColumnWidth);

        await contentBrowserPage.mainContentContainer.resizeColumn('Size', resizeOptions.pixels, resizeOptions.direction);
        await contentBrowserPage.mainContentContainer.datatableRowHeader.waitFor();
        const columnWidth = await contentBrowserPage.mainContentContainer.getColumnWidth('Size');

        expect(columnWidth).toEqual(expectedColumnWidth);
    });
});
