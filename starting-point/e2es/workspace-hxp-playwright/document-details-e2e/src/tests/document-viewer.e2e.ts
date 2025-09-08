/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, timeouts, FileProperties, files } from '@alfresco-dbp/playwright/shared';
import { ViewerTypes, expect, test } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';
import { format } from 'date-fns';

let uploadFolder: Document;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi }) => {
    uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Document Viewer Navigation', async () => {
    test(`[C697269] User should be able to see the document preview`, async ({ contentBrowserPage, hxprApi }) => {
        const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, uploadFolder.sys_id);

        await contentBrowserPage.navigateToDocument(uploadFolder.sys_id);
        await contentBrowserPage.mainContentContainer.getDocByTestId(uploadedFile.sys_title).click();

        await expect(contentBrowserPage.documentViewer.adfViewerLocator).toBeVisible();
    });

    const testScenarios: {
        testID: string;
        testName: string;
        file: FileProperties;
        viewerType: ViewerTypes;
    }[] = [
        { testID: 'C697261', testName: 'a PDF', file: files.pdfFile, viewerType: ViewerTypes.Pdf },
        { testID: 'C697262', testName: 'an image', file: files.jpgFile, viewerType: ViewerTypes.Img },
        { testID: 'XAT-417', testName: 'an unknown format', file: files.invalidFile, viewerType: ViewerTypes.UnknownFormat },
        { testID: 'C699497', testName: 'a Text', file: files.txtFile, viewerType: ViewerTypes.Txt },
    ];

    for (const scenario of testScenarios) {
        test(`[${scenario.testID}] Correct internal viewer is loaded when user opens ${scenario.testName} file`, async ({
            contentBrowserPage,
            hxprApi,
        }) => {
            const errorMessage = `Couldn't load preview. Unsupported file type or loading error. Please try refreshing the page.`;
            const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(scenario.file, uploadFolder.sys_id);

            await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);

            await expect(contentBrowserPage.documentViewer.getViewerByType(scenario.viewerType)).toBeVisible();
            if (scenario.testName === 'an unknown format') {
                await expect(contentBrowserPage.documentViewer.unknownFormatErrorMessage).toContainText(errorMessage);
            }
        });
    }
    const renditionTestScenarios: {
        testID: string;
        testName: string;
        file: FileProperties;
        viewerType: ViewerTypes;
    }[] = [
        { testID: 'C701466', testName: 'a Tiff', file: files.tiffFile, viewerType: ViewerTypes.Tiff },
        { testID: 'C699052', testName: 'a Word', file: files.docFile, viewerType: ViewerTypes.Word },
        { testID: 'XAT-16417', testName: 'an Excel', file: files.xlsFile, viewerType: ViewerTypes.Excel },
        { testID: 'XAT-16419', testName: 'a Powerpoint', file: files.pptFile, viewerType: ViewerTypes.Powerpoint },
    ];

    for (const scenario of renditionTestScenarios) {
        test(`[${scenario.testID}] Doc viewer loaded when user opens ${scenario.testName} file after pdf rendition`, async ({
            contentBrowserPage,
            hxprApi,
        }) => {
            const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(scenario.file, uploadFolder.sys_id);

            await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);

            await expect(contentBrowserPage.documentViewer.getViewerByType(scenario.viewerType)).toBeVisible({ timeout: timeouts.extraLarge });
        });
    }

    test(`[C698537] User should be able to close the document viewer and go back to parent folder`, async ({ contentBrowserPage, page, hxprApi }) => {
        const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, uploadFolder.sys_id);

        await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);
        await contentBrowserPage.documentViewer.closeButtonLocator.click();

        expect.soft(page.url()).toContain(uploadFolder.sys_id);
        await expect(contentBrowserPage.documentViewer.adfViewerLocator).not.toBeVisible();
    });

    test(`[C698538] Correct file path is visible in the Breadcrumb in the document viewer`, async ({ contentBrowserPage, hxprApi }) => {
        const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(files.pdfFile, uploadFolder.sys_id);
        const expectedBreadcrumb = ['Home', uploadFolder.sys_title, uploadedFile.sys_title];

        await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);

        const breadcrumbArray = await contentBrowserPage.documentViewer.getBreadcrumbArray();
        expect(breadcrumbArray).toEqual(expectedBreadcrumb);
    });

    test(`[C698840] Correct metadata is visible in the document viewer info panel`, async ({ contentBrowserPage, hxprApi }) => {
        const { pdfFile } = files;
        const fileSize = '13.02 KB';
        const currentDate = format(new Date(), 'MMM d, yyyy');
        const fileCategory = 'SysFile';
        const { propertiesViewer } = contentBrowserPage.documentViewer;

        const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(pdfFile, uploadFolder.sys_id);

        const { firstName, lastName } = uploadedFile.sys_creator;
        const currentUser = `${firstName} ${lastName}`;
        const path = uploadedFile.sys_path;

        await contentBrowserPage.navigateToDocument(uploadedFile.sys_id);
        await contentBrowserPage.documentViewer.infoButtonLocator.click();

        await expect(propertiesViewer.getChild('')).toBeVisible();
        await expect.soft(propertiesViewer.categoryValueLocator).toContainText(fileCategory); // wait for category to load

        const allProperties = await propertiesViewer.getAllProperties();
        const expectedProperties = {
            Title: uploadedFile.sys_title,
            Category: fileCategory,
            Created: currentDate,
            'Last Modified': currentDate,
            Creator: currentUser,
            'Last Contributor': currentUser,
            Filename: pdfFile.title,
            'Mime Type': pdfFile.mimeType,
            Size: fileSize,
            Contributors: currentUser,
            Path: path,
        };

        expect.soft(Object.keys(allProperties)).toEqual(Object.keys(expectedProperties)); // assert keys order
        expect(allProperties).toEqual(expectedProperties);
    });
});
