/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { FeatureFlagsNames, ProcessInstanceData, RequestResponse, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods, IdpBatchStateSnapshotRunner } from '@hxp/playwright/workspace-hxp';
const { waitForUserTask, validatePageNavigationState, testPageInput, validateThumbnailNavigationForDocument, getThumbnailLocators } =
    idpHelperMethods;

import { BATCH_STATE_SNAPSHOTS } from '../resources';

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    let batchRunner: IdpBatchStateSnapshotRunner;
    let enrollmentFormBatchRunner: IdpBatchStateSnapshotRunner;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | RequestResponse | undefined;

    test.beforeAll(async ({ idpBatchStateSnapshotInitializer, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        batchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.invoice1);
        enrollmentFormBatchRunner = await idpBatchStateSnapshotInitializer.upload(BATCH_STATE_SNAPSHOTS.enrollmentForm);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);
        await tasksPage.navigate({ waitUntil: 'load' });
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser: runtimeBundleService }) => {
        await test.step('Delete process instance', async () => {
            await runtimeBundleService.processInstance.deleteProcessesIfExist(processInstance?.entry?.id);
            processInstance = undefined;
        });
    });

    test.describe('Test viewer navigation and controls', () => {
        test(`[XAT-18109] Test thumbnail viewer visibility and basic navigation`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
            fieldVerificationPage,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const pageCount = 3;
            const { thumbnailViewerButton, thumbnailViewerClose } = fieldVerificationPage.fieldVerificationExtractionResult;
            const thumbnails = getThumbnailLocators(page, pageCount);

            await test.step('Validate thumbnail viewer open/close functionality', async () => {
                // Open thumbnail viewer
                await expect(thumbnailViewerButton).toBeVisible();
                await thumbnailViewerButton.click();

                // Check all thumbnails are visible
                for (let i = 0; i < pageCount; i++) {
                    await expect(thumbnails[i], `Thumbnail ${i + 1} should be visible`).toBeVisible();
                }

                // Close thumbnail viewer via button toggle
                await thumbnailViewerButton.click();

                // Check all thumbnails are hidden
                for (let i = 0; i < pageCount; i++) {
                    await expect(thumbnails[i], `Thumbnail ${i + 1} should be hidden`).toBeHidden();
                }

                // Reopen and close with close button
                await thumbnailViewerButton.click();
                await expect(thumbnailViewerClose).toBeVisible();
                await expect(thumbnailViewerClose).toBeEnabled();
                await thumbnailViewerClose.click();

                // Check all thumbnails are hidden after closing
                for (let i = 0; i < pageCount; i++) {
                    await expect(thumbnails[i], `Thumbnail ${i + 1} should be hidden after closing`).not.toBeVisible();
                }
            });
        });

        test(`[XAT-18110] Test thumbnail navigation and page synchronization`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
            fieldVerificationPage,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const pageCount = 3;
            const { thumbnailViewerButton, nextPage, pageNavInput, previousPage } = fieldVerificationPage.fieldVerificationExtractionResult;
            const thumbnails = getThumbnailLocators(page, pageCount);
            const getThumbnail = (pageNumber: number) => thumbnails[pageNumber - 1];

            await test.step('Test thumbnail click navigation', async () => {
                await thumbnailViewerButton.click();
                await validatePageNavigationState(previousPage, nextPage, pageNavInput, true, false, '1');
                await validateThumbnailNavigationForDocument(page, pageCount, 0);

                // Test clicking each thumbnail in sequence
                const thumbnailTestCases = [
                    { pageNumber: 2, expectedPage: '2', prevDisabled: false, nextDisabled: false },
                    { pageNumber: 3, expectedPage: '3', prevDisabled: false, nextDisabled: true },
                    { pageNumber: 1, expectedPage: '1', prevDisabled: true, nextDisabled: false },
                ];
                for (const testCase of thumbnailTestCases) {
                    await getThumbnail(testCase.pageNumber).click();
                    await validatePageNavigationState(
                        previousPage,
                        nextPage,
                        pageNavInput,
                        testCase.prevDisabled,
                        testCase.nextDisabled,
                        testCase.expectedPage
                    );
                    await validateThumbnailNavigationForDocument(page, pageCount, testCase.pageNumber - 1);
                }
            });

            await test.step('Test page input with thumbnail viewer', async () => {
                const pageInputTestCases = [
                    { inputPage: '3', prevDisabled: false, nextDisabled: true, expectedIndex: 2 },
                    { inputPage: '2', prevDisabled: false, nextDisabled: false, expectedIndex: 1 },
                    { inputPage: '1', prevDisabled: true, nextDisabled: false, expectedIndex: 0 },
                ];
                for (const testCase of pageInputTestCases) {
                    await testPageInput(pageNavInput, previousPage, nextPage, testCase.inputPage, testCase.prevDisabled, testCase.nextDisabled);
                    await validateThumbnailNavigationForDocument(page, pageCount, testCase.expectedIndex);
                }
            });

            await test.step('Test button navigation with thumbnail viewer', async () => {
                const buttonNavigationTestCases = [
                    { action: () => nextPage.click(), expectedPage: '2', prevDisabled: false, nextDisabled: false, expectedIndex: 1 },
                    { action: () => nextPage.click(), expectedPage: '3', prevDisabled: false, nextDisabled: true, expectedIndex: 2 },
                    { action: () => previousPage.click(), expectedPage: '2', prevDisabled: false, nextDisabled: false, expectedIndex: 1 },
                    { action: () => previousPage.click(), expectedPage: '1', prevDisabled: true, nextDisabled: false, expectedIndex: 0 },
                ];
                for (const testCase of buttonNavigationTestCases) {
                    await testCase.action();
                    await validatePageNavigationState(
                        previousPage,
                        nextPage,
                        pageNavInput,
                        testCase.prevDisabled,
                        testCase.nextDisabled,
                        testCase.expectedPage
                    );
                    await validateThumbnailNavigationForDocument(page, pageCount, testCase.expectedIndex);
                }
            });
        });

        test(`[XAT-18111] Test page navigation without thumbnail viewer`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            fieldVerificationPage,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const { nextPage, pageNavInput, previousPage } = fieldVerificationPage.fieldVerificationExtractionResult;

            await test.step('Test button navigation without thumbnail viewer', async () => {
                // Initial state validation
                await validatePageNavigationState(previousPage, nextPage, pageNavInput, true, false, '1');

                // Navigate forward and backward using buttons
                const navigationSteps = [
                    { action: () => nextPage.click(), prev: false, next: false, page: '2' },
                    { action: () => nextPage.click(), prev: false, next: true, page: '3' },
                    { action: () => previousPage.click(), prev: false, next: false, page: '2' },
                    { action: () => previousPage.click(), prev: true, next: false, page: '1' },
                ];
                for (const step of navigationSteps) {
                    await step.action();
                    await validatePageNavigationState(previousPage, nextPage, pageNavInput, step.prev, step.next, step.page);
                }
            });

            await test.step('Test direct page input without thumbnail viewer', async () => {
                await testPageInput(pageNavInput, previousPage, nextPage, '3', false, true);
                await testPageInput(pageNavInput, previousPage, nextPage, '2', false, false);
                await testPageInput(pageNavInput, previousPage, nextPage, '1', true, false);
            });
        });

        test(`[XAT-18112] Test zoom functionality`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            fieldVerificationPage,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const { singlePageView } = fieldVerificationPage.fieldVerificationDocumentViewer;
            const { zoomImageIn, zoomImageOut, zoomInput } = fieldVerificationPage.fieldVerificationExtractionResult;

            await test.step('Validate zoom controls are visible', async () => {
                await expect(zoomImageIn, 'Zoom In button should be visible').toBeVisible();
                await expect(zoomImageIn, 'Zoom In button should be enabled').toBeEnabled();
                await expect(zoomImageOut, 'Zoom Out button should be visible').toBeVisible();
                await expect(zoomImageOut, 'Zoom Out button should be enabled').toBeEnabled();
                await expect(zoomInput, 'Zoom input should be visible').toBeVisible();
                await expect(zoomInput, 'Zoom input should be enabled').toBeEnabled();
            });

            await test.step('Test zoom in button functionality', async () => {
                await zoomImageIn.click();
                await expect(singlePageView, 'First zoom in should scale to 1.25').toHaveAttribute('style', /transform:\s*scale\(1\.25\)/);
                await zoomImageIn.click();
                await expect(singlePageView, 'Second zoom in should scale to 1.5').toHaveAttribute('style', /transform:\s*scale\(1\.5\)/);
            });

            await test.step('Test zoom out button functionality', async () => {
                await zoomImageOut.click();
                await expect(singlePageView, 'Zoom out should return to 1.25').toHaveAttribute('style', /transform:\s*scale\(1\.25\)/);
            });

            await test.step('Test zoom input field', async () => {
                const zoomTestCases = [
                    { value: '300', expectedScale: '3', description: 'zoom to 300%' },
                    { value: '50', expectedScale: '0.5', description: 'zoom to 50%' },
                    { value: '100', expectedScale: '1', description: 'reset to 100%' },
                ];

                for (const { value, expectedScale, description } of zoomTestCases) {
                    await zoomInput.fill(value);
                    await zoomInput.press('Enter');
                    await expect(singlePageView, `Should ${description}`).toHaveAttribute(
                        'style',
                        new RegExp(`transform:\\s*scale\\(${expectedScale}\\)`)
                    );
                }
            });
        });

        test(`[XAT-18113] Test rotation functionality`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            fieldVerificationPage,
            page,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const { rotateImageClockwise } = fieldVerificationPage.fieldVerificationExtractionResult;

            await test.step('Validate rotation control is visible', async () => {
                await expect(rotateImageClockwise, 'Rotate button should be visible').toBeVisible();
                await expect(rotateImageClockwise, 'Rotate button should be enabled').toBeEnabled();
            });

            await test.step('Wait for image to be fully loaded', async () => {
                const issuePageImage = fieldVerificationPage.fieldVerificationDocumentViewer.idpViewer.locator(
                    '[data-automation-id="idp-viewer-page-image"]'
                );

                // Wait for image to be visible first
                await expect(issuePageImage, 'Image should be fully visible').toBeVisible();

                // Wait for image to be completely loaded using JavaScript
                await page.waitForFunction(
                    () => {
                        const img = document.querySelector('[data-automation-id="idp-viewer-page-image"]') as HTMLImageElement;
                        return img && img.complete && img.naturalWidth > 0 && img.naturalHeight > 0;
                    },
                    { timeout: 10000 }
                );
            });

            await test.step('Test complete rotation cycle', async () => {
                // Test complete rotation cycle (0° -> 90° -> 180° -> 270° -> 0°)
                const rotationTestCases = [
                    { expectedRotation: 90, description: 'first rotation to 90 degrees' },
                    { expectedRotation: 180, description: 'second rotation to 180 degrees' },
                    { expectedRotation: 270, description: 'third rotation to 270 degrees' },
                    { expectedRotation: 0, description: 'fourth rotation back to 0 degrees' },
                ];
                for (const { expectedRotation, description } of rotationTestCases) {
                    await rotateImageClockwise.click();
                    await expect(
                        fieldVerificationPage.fieldVerificationDocumentViewer.getRotationValue(),
                        `Rotation should be ${expectedRotation}° after ${description}`
                    ).resolves.toBe(expectedRotation);
                }
            });
        });

        test(`[XAT-18114] Test fullscreen functionality`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
            fieldVerificationPage,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const { idpViewer } = fieldVerificationPage.fieldVerificationDocumentViewer;
            const { viewerFullScreen } = fieldVerificationPage.fieldVerificationExtractionResult;

            await test.step('Validate fullscreen control is visible', async () => {
                await expect(viewerFullScreen, 'Full Screen button should be visible').toBeVisible();
                await expect(viewerFullScreen, 'Full Screen button should be enabled').toBeEnabled();
            });

            await test.step('Test entering fullscreen mode', async () => {
                await viewerFullScreen.click();
                await expect(idpViewer, 'Should enter fullscreen mode').toHaveClass(/idp-viewer__fullscreen/);
            });

            await test.step('Test exiting fullscreen via button', async () => {
                await viewerFullScreen.click();
                await expect(idpViewer, 'Should exit fullscreen mode via button').not.toHaveClass(/idp-viewer__fullscreen/);
            });

            await test.step('Test ESC key to exit fullscreen', async () => {
                await viewerFullScreen.click();
                await expect(idpViewer, 'Should re-enter fullscreen mode').toHaveClass(/idp-viewer__fullscreen/);
                await page.keyboard.press('Escape');
                await expect(idpViewer, 'Should exit fullscreen mode with ESC key').not.toHaveClass(/idp-viewer__fullscreen/);
            });
        });

        test(`[XAT-18115] Test view mode controls`, async ({
            taskDetailsPage,
            page,
            runtimeBundleServiceHrUser: runtimeBundleService,
            fieldVerificationPage,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await batchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });
            });

            const { viewExtractedTextButton, viewImageButton } = fieldVerificationPage.fieldVerificationExtractionResult;
            const { textLayoutSpanElement, activeHighlightLocator } = fieldVerificationPage.fieldVerificationDocumentViewer;

            await test.step('Validate view mode controls are visible', async () => {
                await expect(viewImageButton, 'View Image button should be visible').toBeVisible();
                await expect(viewImageButton, 'View Image button should be enabled').toBeEnabled();
                await expect(viewExtractedTextButton, 'View Extracted Text button should be visible').toBeVisible();
                await expect(viewExtractedTextButton, 'View Extracted Text button should be enabled').toBeEnabled();
            });

            await test.step('Should open image Viewer when clicking View Image button', async () => {
                await viewImageButton.click();
                await expect(fieldVerificationPage.fieldVerificationDocumentViewer.idpViewer, 'IDP Viewer should be opened').toBeVisible();
                await fieldVerificationPage.fieldVerificationDocumentViewer.idpViewer.click();
            });

            await test.step('Should verify extracted data from text layout', async () => {
                await viewExtractedTextButton.hover();
                await viewExtractedTextButton.click();
                await expect(fieldVerificationPage.fieldVerificationDocumentViewer.idpViewer, 'IDP Viewer should be opened').toBeVisible();

                const textLayout = await textLayoutSpanElement.textContent();
                expect(textLayout).toContain('ERICSSON');
                expect(textLayout).toContain('Ericsson GmbH');
                expect(textLayout).toContain('MPU MULTI PARTY UNIT');
            });

            await test.step('Should click text layer toolbar button and verify highlight text', async () => {
                const companyName = page.locator('[data-automation-id^="idp-field-Company"]');
                await companyName.click();
                await expect(companyName).toHaveValue('Ericsson GmbH');
                let activeHighlightValid = await activeHighlightLocator.textContent();
                expect.soft(activeHighlightValid).toContain('Ericsson GmbH');

                const invoiceNumber = page.locator('[data-automation-id^="idp-field-InvoiceNumber"]');
                await invoiceNumber.hover();
                await invoiceNumber.click();
                await expect(invoiceNumber).toHaveValue('324163');
                activeHighlightValid = await activeHighlightLocator.textContent();
                expect.soft(activeHighlightValid).toContain('324163');
            });
        });

        test(`[XAT-17982] Rotation should retain while back to task list and again reopen the task`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            await test.step('Start the process and navigate to user task', async () => {
                processInstance = await enrollmentFormBatchRunner.startProcess(runtimeBundleService);
                const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
                expect.soft(userTasks).toHaveLength(1);
                await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}` });
            });

            const userTask = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTask[0].entry.id}`, waitUntil: 'load' });
            await expect(fieldVerificationPage.fieldVerificationFooter.submitButton).toBeVisible();
            await fieldVerificationPage.documentViewer.clickOnDocument();
            await fieldVerificationPage.documentViewer.rotateButtonLocator.click();

            expect.soft(await fieldVerificationPage.documentViewer.getRotationValue()).toEqual(90);
            await fieldVerificationPage.fieldVerificationFooter.saveButton.isEnabled();
            await fieldVerificationPage.fieldVerificationFooter.saveButton.click();
            await fieldVerificationPage.fieldVerificationHeader.goBack.click();
            const discardButton = page.locator('[data-automation-id^="idp-discard-dialog__discard-button"]');
            await discardButton.click();
            await taskDetailsPage.navigate({ query: `/${userTask[0].entry.id}`, waitUntil: 'load' });
            await fieldVerificationPage.documentViewer.clickOnDocument();

            expect(await fieldVerificationPage.documentViewer.getRotationValue()).toEqual(90);
        });
    });
});
