/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// eslint-disable-next-line @nx/enforce-module-boundaries
import { expect, getUserState, FileProperties, files } from '@alfresco-dbp/playwright/shared';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { test, ViewerTypes } from '@hxp/playwright/workspace-hxp';
import { Document } from '@hylandsoftware/hxcs-js-client';

let uploadFolder: Document;

test.use({ storageState: getUserState('hruser') });

test.beforeEach(async ({ hxprApi, contentBrowserPage }, workerInfo) => {
    uploadFolder = await hxprApi.documentServiceApi.createFolderWithPermissions('Upload Folder', 'Folder description', 'hr');

    await contentBrowserPage.refreshUserState('hruser', workerInfo.project.use);
});

test.afterEach(async ({ hxprApi }) => hxprApi.documentServiceApi.teardown());

test.describe('Document viewer in Custom UI', async () => {
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
});
