/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { Document } from '@hylandsoftware/hxcs-js-client/typings';

import { HXP_APPS, FeatureFlagsNames, ProcessInstanceData, RequestResponse, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect, idpHelperMethods } from '@hxp/playwright/workspace-hxp';
// eslint-disable-next-line prettier/prettier
const { startProcess, waitForUserTask, createFolder, cleanupFiles, findOcrTooltip, findTooltipCoordinates, dragOnCanvas, getCanvasBoundingBox } = idpHelperMethods;

import { TEST_FILES } from '../resources';

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    /** managed by beforeAll and afterAll */
    let uploadFolder: Readonly<Document>;
    /** managed by beforeAll and afterAll */
    let rubberbandingTestFile: Readonly<Document>;
    let doubleClickInvoiceFile: Readonly<Document>;
    let doubleClickBasketballFile: Readonly<Document>;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | RequestResponse | undefined;
    const { processes } = HXP_APPS.SYS_IDP_E2E;
    const { idpFieldVerification: testProcess } = processes;

    test.beforeAll(async ({ hxprApi, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        const folderData = await createFolder(hxprApi, [TEST_FILES.basketball4tables1page, TEST_FILES.invoice1, TEST_FILES.basketball4tables1page]);
        uploadFolder = folderData.uploadFolder;
        rubberbandingTestFile = folderData.uploadedFiles[0];
        doubleClickInvoiceFile = folderData.uploadedFiles[1];
        doubleClickBasketballFile = folderData.uploadedFiles[2];
    });

    test.afterAll(async ({ hxprApi }) => {
        await cleanupFiles(hxprApi, uploadFolder);
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

    test.describe('Rubberbanding OCR Text Layer', () => {
        test(`[XAT-18062] Rubberbanding OCR Text Layer`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            processInstance = await startProcess(runtimeBundleService, [rubberbandingTestFile], {
                processDefinitionKey: testProcess.processDefinitionKey,
                variables: testProcess.variables,
            });

            // Wait for the process to be started and the user task to be available
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            // Constants for test configuration
            const canvas = fieldVerificationPage.fieldVerificationViewerTextLayer.textLayerCanvas;
            const canvasBoundingBox = await getCanvasBoundingBox(canvas);
            const searchAreaX = 40; // Adjust this value to move the search area right
            const searchAreaY = 25; // Adjust this value to move the search area down
            const searchArea = {
                x: canvasBoundingBox.x + searchAreaX,
                y: canvasBoundingBox.y + searchAreaY,
                width: canvasBoundingBox.width / 4,
                height: canvasBoundingBox.height / 10,
            };
            const clickAndDragDistanceX = 135; // Adjust as needed for your box width
            const clickAndDragDistanceY = 75; // Adjust as needed for your box height
            const expectedRubberbandHoverText = 'Basketball Statistic';
            const ocrToolTip = fieldVerificationPage.fieldVerificationViewerTextLayer.ocrToolTip;
            const organizationFieldSelector = '[data-automation-id^="idp-field-Organization"]';
            const organizationField = page.locator(organizationFieldSelector);

            // Drag to select text
            const dragStart = { x: canvasBoundingBox.x, y: canvasBoundingBox.y };
            const dragEnd = { x: dragStart.x + clickAndDragDistanceX, y: dragStart.y + clickAndDragDistanceY };
            await dragOnCanvas(page, dragStart, dragEnd);

            // Find and store OCR value for rubberbanded text
            const { coords: rubberBandCoords, value: ocrValueRubberBand } = await findOcrTooltip(
                page,
                searchArea,
                expectedRubberbandHoverText,
                ocrToolTip
            );

            // Hover and double-click to apply OCR value
            const hoverPositionRubberband = {
                x: rubberBandCoords.x - canvasBoundingBox.x,
                y: rubberBandCoords.y - canvasBoundingBox.y,
            };
            await canvas.hover({ position: hoverPositionRubberband });
            await canvas.dblclick({ position: hoverPositionRubberband });

            // Verify field value
            await expect(organizationField).toBeFocused();
            await expect(organizationField).toHaveValue(ocrValueRubberBand.trim());
        });
    });

    test.describe('Double clicking on OCR values (Invoice)', () => {
        test(`[XAT-17992] Double clicking a value to apply it to the first field`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            processInstance = await startProcess(runtimeBundleService, [doubleClickInvoiceFile], {
                processDefinitionKey: testProcess.processDefinitionKey,
                variables: testProcess.variables,
            });

            // Wait for the process to be started and the user task to be available
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            // Variables
            const canvas = fieldVerificationPage.fieldVerificationViewerTextLayer.textLayerCanvas;
            const ocrToolTip = fieldVerificationPage.fieldVerificationViewerTextLayer.ocrToolTip;
            const companyName = page.locator('[data-automation-id^="idp-field-Company"]');

            // Check if the canvas is visible, retrieve its bounding box and throw error if either one is not is found
            if (!canvas) {
                throw new Error('Canvas element not found.');
            }
            await expect(canvas).toBeVisible();
            const boundingBox = await canvas.boundingBox();
            if (!boundingBox) {
                throw new Error('Failed to retrieve the bounding box of the canvas.');
            }

            // Value for expected text from OCR tooltip and search area (adjust as needed)
            const expectedText = 'ERICSSON';
            const searchArea = {
                x: boundingBox.x + 75,
                y: boundingBox.y + 75,
                width: boundingBox.width / 4,
                height: boundingBox.height / 10,
            };

            // Find and set the coordinates of the tooltip with the expected text
            const matchedCoordinates = await findTooltipCoordinates(page, searchArea, expectedText);
            if (!matchedCoordinates) {
                throw new Error(`Tooltip with text "${expectedText}" not found in the specified area.`);
            }

            // Store the value of the tooltip text
            const ocrValue = await ocrToolTip.textContent();
            if (!ocrValue) {
                throw new Error('Failed to retrieve OCR value from tooltip.');
            }

            // Set the coordinates for the hover and double-click actions
            const hoverPosition = {
                x: matchedCoordinates.x - boundingBox.x,
                y: matchedCoordinates.y - boundingBox.y,
            };

            // Perform hover and double-click actions to apply the OCR value
            await canvas.hover({ position: hoverPosition });
            await canvas.dblclick({ position: hoverPosition });

            // Verify that the company name field is focused and has the expected value
            await expect(companyName).toBeFocused();
            await expect(companyName).toHaveValue(ocrValue.trim());
        });
    });

    test.describe('Double clicking on OCR values (Tables)', () => {
        test(`[XAT-17993] Double clicking a value to apply it to the first field`, async ({
            fieldVerificationPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            processInstance = await startProcess(runtimeBundleService, [doubleClickBasketballFile], {
                processDefinitionKey: testProcess.processDefinitionKey,
                variables: testProcess.variables,
            });

            // Wait for the process to be started and the user task to be available
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            const canvas = fieldVerificationPage.fieldVerificationViewerTextLayer.textLayerCanvas;
            const ocrToolTip = fieldVerificationPage.fieldVerificationViewerTextLayer.ocrToolTip;
            const organization = page.locator('[data-automation-id^="idp-field-Organization"]');

            // Check if the canvas is visible, retrieve its bounding box and throw error if either one is not is found
            if (!canvas) {
                throw new Error('Canvas element not found.');
            }
            await expect(canvas).toBeVisible();
            const boundingBox = await canvas.boundingBox();
            if (!boundingBox) {
                throw new Error('Failed to retrieve the bounding box of the canvas.');
            }

            // Value for expected text from OCR tooltip and search area (adjust as needed)
            const expectedText = 'Basketball';
            const searchArea = {
                x: boundingBox.x + 75,
                y: boundingBox.y + 10,
                width: boundingBox.width / 4,
                height: boundingBox.height / 10,
            };

            // Find and set the coordinates of the tooltip with the expected text
            const matchedCoordinates = await findTooltipCoordinates(page, searchArea, expectedText);
            if (!matchedCoordinates) {
                throw new Error(`Tooltip with text "${expectedText}" not found in the specified area.`);
            }

            // Store the value of the tooltip text
            const ocrValue = await ocrToolTip.textContent();
            if (!ocrValue) {
                throw new Error('Failed to retrieve OCR value from tooltip.');
            }

            // Set the coordinates for the hover and double-click actions
            const hoverPosition = {
                x: matchedCoordinates.x - boundingBox.x,
                y: matchedCoordinates.y - boundingBox.y,
            };

            // Perform hover and double-click actions to apply the OCR value
            await canvas.hover({ position: hoverPosition });
            await canvas.dblclick({ position: hoverPosition });

            // Verify that the company name field is focused and has the expected value
            await expect(organization).toBeFocused();
            await expect(organization).toHaveValue(ocrValue.trim());

            // Verify a table field is focused and has the expected value
            const metadataPanel = fieldVerificationPage.metadataPanel;
            // eslint-disable-next-line @cspell/spellchecker
            const minutesPlayedTableId = 'MinutesPlayed0ikpdt';

            await metadataPanel.openTableForField(minutesPlayedTableId);

            const tableFieldExpectedText = 'Minutes'; // Adjust if there's a specific OCR string that appears on your test image
            const tableFieldSearchArea = {
                x: boundingBox.x + 160 - 5,
                y: boundingBox.y + 100 - 5,
                width: 15,
                height: 15,
            };

            const tableMatchedCoordinates = await findTooltipCoordinates(page, tableFieldSearchArea, tableFieldExpectedText);
            if (!tableMatchedCoordinates) {
                throw new Error(`Tooltip with text "${tableFieldExpectedText}" not found in the specified area.`);
            }

            const tableOcrValue = await ocrToolTip.textContent();
            if (!tableOcrValue) {
                throw new Error('Failed to retrieve OCR value for table field from tooltip.');
            }

            const tableHoverPosition = {
                x: tableMatchedCoordinates.x - boundingBox.x,
                y: tableMatchedCoordinates.y - boundingBox.y,
            };

            await canvas.hover({ position: tableHoverPosition });
            await canvas.dblclick({ position: tableHoverPosition });

            const tableCellInput = page.locator('.idp-cell-edit-input').first();
            await expect(tableCellInput).toBeVisible();

            const actualTableValue = await tableCellInput.inputValue();
            expect(actualTableValue).toBe('1.');
        });
    });
});
