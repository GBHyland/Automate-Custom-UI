/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import type { Document } from '@hylandsoftware/hxcs-js-client/typings';
import { Page, TestInfo, Locator } from '@playwright/test';

import {
    assertSuccessfulEntryResponse,
    ProcessInstanceData,
    RequestResponse,
    RuntimeBundleService,
    HxprApi,
    FileProperties,
    QueryService,
    ProcessInstanceResponse,
} from '@alfresco-dbp/playwright/shared';

import { test, expect } from '../fixtures';
import { TasksPage } from '../page-object/pages';

interface TestProcess {
    processDefinitionKey: string;
    variables: { [key: string]: any };
}

export interface Rectangle {
    x: number;
    y: number;
    width: number;
    height: number;
}

export interface Point {
    x: number;
    y: number;
}

export async function createFolder(hxprApi: HxprApi, files: FileProperties[]) {
    let uploadFolder: Readonly<Document>;
    const uploadedFiles: Readonly<Document>[] = [];

    await test.step('Create temporary folder and upload files', async () => {
        uploadFolder = await hxprApi.documentServiceApi.createFolder('pw-run', 'temporary files uploaded during an e2e test');
        expect(uploadFolder).toBeDefined();
        expect(uploadFolder).not.toHaveProperty('status');

        for (const file of files) {
            const uploadedFile = await hxprApi.uploadServiceApi.uploadFile(file, uploadFolder.sys_id);
            expect(uploadedFile).toBeDefined();
            expect(uploadedFile).not.toHaveProperty('status');
            uploadedFiles.push(uploadedFile);
        }
    });

    return { uploadFolder, uploadedFiles };
}

export async function startProcess(
    runtimeBundleService: RuntimeBundleService,
    testFile: any,
    testProcess: TestProcess
): Promise<ProcessInstanceData> {
    const processInstance = await runtimeBundleService.processInstance.startProcess(testProcess.processDefinitionKey, {
        variables: { [testProcess.variables.attachedFiles.name as string]: testFile },
    });
    // Confirm we have a process instance instead of an HTTP response or other error object
    assertSuccessfulEntryResponse(processInstance);
    expect(processInstance).toHaveProperty('entry.id');
    return processInstance;
}

export async function findProcess(queryService: QueryService): Promise<ProcessInstanceResponse | RequestResponse> {
    test.slow(true, 'Nested process creation can take some time.');
    return queryService.processInstance.getProcessInstanceByFilters({
        processDefinitionKey: 'Process_qqh3i99C',
        initiator: 'hruser',
    });
}

/**
 * Retrieves the variable from the specified process instance and [attaches it to the Playwright test trace][1].
 *
 * @param runtimeBundleService - The service used to access process instance variables.
 * @param processInstance - The process instance from which to retrieve the variable.
 * @param options - Optional overrides for the attachment name and variable name.
 *   @param options.variableName - Name of the process variable to fetch (default: `batchState`).
 *   @param options.attachmentName - Custom name for the attachment file (default: `${variableName}.json`).
 * @returns A promise that resolves when the attachment has been added to the Playwright trace.
 *
 * @remarks
 * It is likely most useful to call this function immediately after the user task is created and/or completed.
 *
 * [1]: <https://playwright.dev/docs/api/class-testinfo#test-info-attach>
 */
export async function attachBatchStateToPlaywrightTrace(
    runtimeBundleService: RuntimeBundleService,
    processInstance: ProcessInstanceData,
    options?: { variableName?: string; attachmentName?: string }
): Promise<void> {
    const variableName = options?.variableName ?? 'batchState';
    const attachmentName = options?.attachmentName ?? `${variableName}.json`;
    await test.step(`Attach batch state from process instance ${processInstance.entry.id}`, async () => {
        const value = await runtimeBundleService.processInstance.getProcessVariable(processInstance.entry.id, variableName);
        await test.info().attach(attachmentName, { body: JSON.stringify(value, null, 2), contentType: 'application/json' });
    });
}

export async function waitForUserTask(
    runtimeBundleService: RuntimeBundleService,
    processInstance: ProcessInstanceData | RequestResponse
): Promise<any> {
    test.slow(true, 'Classification can take some time.');
    const tasks = await runtimeBundleService.processInstance.waitAndGetTasksByProcessInstanceId(processInstance.entry.id, { retry: 30 });
    await attachBatchStateToPlaywrightTrace(runtimeBundleService, processInstance as ProcessInstanceData);
    return tasks;
}

export async function refreshUserState(tasksPage: TasksPage, workerInfo: TestInfo) {
    await tasksPage.refreshUserState('hruser', workerInfo.project.use);
    await tasksPage.navigate({ waitUntil: 'load' });
}

export async function cleanupFiles(hxprApi: HxprApi, uploadFolder: Readonly<Document>) {
    await test.step('Delete temporary folder/files', async () => {
        await hxprApi.documentServiceApi.deleteDocumentById(uploadFolder.sys_id);
    });
}

export async function deleteTestFolder(hxprApi: HxprApi, folder: Document) {
    await test.step('Delete temporary folder/files', async () => {
        await hxprApi.documentServiceApi.deleteDocumentById(folder.sys_id);
    });
}

/**
 * Find tooltip coordinates based on expected text (with error handling)
 * This function searches for a tooltip with the specified text within a defined area on the page
 * and returns the coordinates if found.
 */
export async function findTooltipCoordinates(page: Page, searchArea: Rectangle, expectedText: string) {
    const { x, y, width, height } = searchArea;
    const step = 5; // Adjust for finer or coarser search

    for (let offsetX = 0; offsetX < width; offsetX += step) {
        for (let offsetY = 0; offsetY < height; offsetY += step) {
            await page.mouse.move(x + offsetX, y + offsetY);
            await page.waitForTimeout(100);

            const tooltip = page.locator('[data-automation-id="ocr-tooltip"]');
            if (await tooltip.isVisible()) {
                const tooltipText = await tooltip.textContent();
                if (tooltipText?.trim() === expectedText) {
                    return { x: x + offsetX, y: y + offsetY };
                }
            }
        }
    }
    return null;
}

/**
 * Find OCR tooltip and value based on expected text (with error handling)
 * This function uses the findTooltipCoordinates function to locate the tooltip and then retrieves its text content
 */
export async function findOcrTooltip(page: Page, searchArea: Rectangle, expectedText: string, ocrToolTip: Locator) {
    const coords = await findTooltipCoordinates(page, searchArea, expectedText);
    if (!coords) {
        throw new Error(`Tooltip with text "${expectedText}" not found in the specified area.`);
    }
    const value = await ocrToolTip.textContent();
    if (!value) {
        throw new Error('Failed to retrieve OCR value from tooltip.');
    }
    return { coords, value };
}

/**
 * This function simulates a drag action on the canvas
 * It moves the mouse to the starting point, presses down, moves to the end point, and then releases the mouse
 */
export async function dragOnCanvas(page: Page, start: Point, end: Point): Promise<void> {
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    await page.mouse.move(end.x, end.y, { steps: 10 });
    await page.mouse.up();
}

/**
 * This function retrieves the bounding box of a canvas element
 * It checks if the canvas element is present and visible, then retrieves its bounding box
 * If the canvas element is not found or if the bounding box cannot be retrieved, it throws an error
 */
export async function getCanvasBoundingBox(canvas: Locator) {
    if (!canvas) {
        throw new Error('Canvas element not found.');
    }
    await expect(canvas).toBeVisible();
    const boundingBox = await canvas.boundingBox();
    if (!boundingBox) {
        throw new Error('Failed to retrieve the bounding box of the canvas.');
    }
    return boundingBox;
}

export async function clickAndExpectPageChange(page: Page, direction: 'previous' | 'next', expectedPage: number) {
    const button = page.locator(`#${direction}`);
    await expect(button).toBeEnabled();
    await button.click();

    const pageCounter = page.locator('hyland-idp-viewer-page-navigation').getByRole('spinbutton');
    const currentPage = Number.parseInt(await pageCounter.inputValue(), 10);
    expect(currentPage).toBe(expectedPage);
}

/**
 * This function retrieves the ID for a table field based on its name.
 * It searches through a predefined list of basketball table fields and returns the ID for the specified field name.
 */
export const basketballTableFields = [
    // eslint-disable-next-line @cspell/spellchecker
    { name: 'Minutes Played', id: 'MinutesPlayed0ikpdt' },
    { name: '3Pt Field Goals', id: '3PtFieldGoals0crx8m' },
    // eslint-disable-next-line @cspell/spellchecker
    { name: 'Free Throws', id: 'FreeThrows0tkzyc' },
    { name: 'Rebounds', id: 'Rebounds0w7qjk' },
];

/**
 * This function returns a locator for a specific table field by its name.
 */
export function getTableFieldLocator(page: Page, name: string) {
    const field = basketballTableFields.find((f) => f.name === name);
    if (!field) {
        throw new Error(`${name} field not found in basketballTableFields`);
    }
    return page.locator(`[data-automation-id^="field-has-issue${field.id}"]`);
}

/**
 * This function checks if a table field is selected by verifying the presence of the 'idp-is-selected' class.
 * It uses the getTableFieldLocator function to find the field and then checks for the class.
 */
export async function expectTableFieldSelected(page: Page, name: string, expectFn: typeof import('@playwright/test').expect) {
    const locator = getTableFieldLocator(page, name);
    await expectFn(locator).toHaveClass(/idp-is-selected/);
}

/**
 * This function checks if a field is focused by using the Playwright expect API.
 * It takes a field locator and an expect object as parameters and asserts that the field is focused.
 */
export async function expectFieldFocused(fieldLocator: Locator, expectFn: typeof import('@playwright/test').expect) {
    await expectFn(fieldLocator).toBeFocused();
}

/**
 * Interact with a table field: open, verify splitter bar presence, type value, navigate, and close.
 */
export async function interactWithTableField(
    metadataPanel: {
        openTableForField: (fieldId: string) => Promise<void>;
        typeIntoFirstTableCell: (fieldId: string, value: string) => Promise<void>;
        navigateTableWithKeys: () => Promise<void>;
        closeTableView: () => Promise<void>;
    },
    splitterBar: Locator,
    fieldId: string,
    value: string
) {
    await metadataPanel.openTableForField(fieldId);
    await expect(splitterBar).toBeVisible(); // Verify that the splitter bar is visible for table fields
    await metadataPanel.typeIntoFirstTableCell(fieldId, value);
    await metadataPanel.navigateTableWithKeys();
    await metadataPanel.closeTableView();
}

/**
 * Helper to validate page navigation button and input state.
 */
export async function validatePageNavigationState(
    previousPage: Locator,
    nextPage: Locator,
    pageNavInput: Locator,
    prevDisabled: boolean,
    nextDisabled: boolean,
    pageValue: string
) {
    await expect(previousPage, 'Previous page button state mismatch').toHaveAttribute('ng-reflect-disabled', prevDisabled.toString());
    await expect(nextPage, 'Next page button state mismatch').toHaveAttribute('ng-reflect-disabled', nextDisabled.toString());
    await expect(pageNavInput, 'Page navigation input value mismatch').toHaveValue(pageValue);
}

/**
 * Helper to test page navigation input and validate state.
 */
export async function testPageInput(
    pageNavInput: Locator,
    previousPage: Locator,
    nextPage: Locator,
    inputValue: string,
    expectedPrevDisabled: boolean,
    expectedNextDisabled: boolean
) {
    await pageNavInput.fill(inputValue);
    await pageNavInput.press('Enter');
    await validatePageNavigationState(previousPage, nextPage, pageNavInput, expectedPrevDisabled, expectedNextDisabled, inputValue);
}

/**
 * Helper to validate which thumbnail is selected - supports any number of thumbnails *
 * @example
 * For a 3-page document
 * const thumbnails = [thumbnail1, thumbnail2, thumbnail3];
 * await validateThumbnailNavigation(thumbnails, [true, false, false]); // Page 1 selected
 * await validateThumbnailNavigation(thumbnails, [false, true, false]); // Page 2 selected
 */
export async function validateThumbnailNavigation(thumbnails: Locator[], selectedStates: boolean[]) {
    if (thumbnails.length !== selectedStates.length) {
        throw new Error(`Thumbnail count (${thumbnails.length}) must match selected states count (${selectedStates.length})`);
    }
    for (const [index, thumbnail] of thumbnails.entries()) {
        await expect(thumbnail, `Thumbnail ${index + 1} selection state mismatch`).toHaveAttribute(
            'ng-reflect-is-selected',
            selectedStates[index].toString()
        );
    }
}

/**
 * Helper to generate thumbnail navigation test data for any number of pages
 */
export function generateThumbnailSelectionStates(pageCount: number, selectedPageIndex: number): boolean[] {
    if (selectedPageIndex < 0 || selectedPageIndex >= pageCount) {
        throw new Error(`Selected page index ${selectedPageIndex} is out of range for ${pageCount} pages`);
    }
    return Array.from({ length: pageCount }, (_, index) => index === selectedPageIndex);
}

/**
 * Helper to get thumbnail locators by data automation ID pattern
 */
export function getThumbnailLocators(page: Page, pageCount: number, thumbnailPrefix = 'thumbnail-'): Locator[] {
    return Array.from({ length: pageCount }, (_, index) => page.locator(`[data-automation-id="${thumbnailPrefix}${index + 1}"]`));
}

/**
 * Helper to validate thumbnail navigation for documents with any number of pages
 */
export async function validateThumbnailNavigationForDocument(
    page: Page,
    pageCount: number,
    selectedPageIndex: number,
    thumbnailPrefix = 'thumbnail-'
) {
    const thumbnails = getThumbnailLocators(page, pageCount, thumbnailPrefix);
    const selectedStates = generateThumbnailSelectionStates(pageCount, selectedPageIndex);
    await validateThumbnailNavigation(thumbnails, selectedStates);
}

export async function typeRow(page: Page, values: string[]) {
    for (const value of values) {
        await page.keyboard.type(value);
        await page.keyboard.press('Tab');
    }
}

/**
 * Helper function to poll batchState for extraction status
 */
export async function waitForExtractionStatus(
    runtimeBundleService: RuntimeBundleService,
    processInstance: ProcessInstanceData,
    targetStatus: string,
    maxWaitTime = 30000
) {
    const startTime = Date.now();
    while (Date.now() - startTime < maxWaitTime) {
        const currentBatchState = await runtimeBundleService.processInstance.getProcessVariable(processInstance.entry.id, 'batchState');
        if (currentBatchState.extractionStatus === targetStatus) {
            return currentBatchState;
        }
        await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms before next check
    }
    throw new Error(`Timeout: extractionStatus did not become '${targetStatus}' within ${maxWaitTime}ms`);
}

/**
 * Unchecks the "Open next task automatically" checkbox if it's currently checked
 * @param page - The Playwright page object
 */
export async function uncheckOpenNextTaskAutomatically(page: Page): Promise<void> {
    const openNextTaskCheckbox = page.locator('[data-automation-id="idp-class-open-next-task-checkbox"] input[type="checkbox"]');

    // Wait for the checkbox to be visible
    await expect(openNextTaskCheckbox).toBeVisible();

    // Check if the checkbox is checked
    const isChecked = await openNextTaskCheckbox.isChecked();

    if (isChecked) {
        await openNextTaskCheckbox.uncheck();
        // Verify it's now unchecked
        await expect(openNextTaskCheckbox).not.toBeChecked();
    }
}

/**
 * Helper function to verify submit button accessibility
 * @param submitButton - The submit button locator
 * @param context - Optional context description for the verification step
 */
export async function verifySubmitButtonAccessible(submitButton: Locator, context?: string): Promise<void> {
    const stepName = context ? `Verify submit button accessibility: ${context}` : 'Verify submit button accessibility';
    await test.step(stepName, async () => {
        await expect(submitButton).toBeVisible();
        await expect(submitButton).toBeInViewport();
        await expect(submitButton).toBeEnabled();
    });
}

/**
 * Helper function to get scroll and field visibility information
 * @param page - The Playwright page object
 * @param fieldSelectors - Object containing field selector configurations
 * @param stepName - Description for the test step
 */
export async function getScrollInfo(page: Page, fieldSelectors: { FIRST: string; LAST: string; CONTAINER: string }, stepName: string) {
    return test.step(`Get scroll information: ${stepName}`, async () => {
        return page.evaluate((selectors) => {
            const container = document.querySelector(selectors.CONTAINER);
            const firstField = document.querySelector(selectors.FIRST);
            const lastField = document.querySelector(selectors.LAST);

            const isElementVisible = (element: Element | null) => {
                if (!element) {
                    return false;
                }
                const rect = element.getBoundingClientRect();
                return rect.top < window.innerHeight && rect.bottom > 0;
            };

            return {
                scrollTop: window.pageYOffset || document.documentElement.scrollTop,
                scrollHeight: document.documentElement.scrollHeight,
                viewportHeight: window.innerHeight,
                maxScrollTop: (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight,
                containerTop: container?.getBoundingClientRect().top ?? null,
                firstFieldVisible: isElementVisible(firstField),
                lastFieldVisible: isElementVisible(lastField),
                firstFieldExists: !!firstField,
                lastFieldExists: !!lastField,
            };
        }, fieldSelectors);
    });
}

/**
 * Helper function to scroll to a specific field element
 * @param page - The Playwright page object
 * @param fieldSelector - CSS selector for the target field
 * @param scrollOptions - Optional scroll behavior configuration
 */
export async function scrollToField(page: Page, fieldSelector: string, scrollOptions?: ScrollIntoViewOptions): Promise<void> {
    const defaultOptions: ScrollIntoViewOptions = {
        behavior: 'instant',
        block: 'end',
        inline: 'nearest',
    };

    await page.evaluate(
        ({ selector, options }) => {
            const field = document.querySelector(selector);
            if (field) {
                field.scrollIntoView(options);
            }
        },
        { selector: fieldSelector, options: scrollOptions ?? defaultOptions }
    );
}
