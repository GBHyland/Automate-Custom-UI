/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom, getUserState, StartProcessData, RequestResponse, expect, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { ProcessManagementLabels, test } from '@hxp/playwright/workspace-hxp';
import { format } from 'date-fns';

test.use({ storageState: getUserState('hruser') });
test.describe('Filtering process list by process variables values', () => {
    const { processVariableFiltersProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const { formWidgets } = processVariableFiltersProcess.form;
    const processNameSuffix = UtilRandom.generateAlphaNumericLowerCase(5);
    const processNames = ['1', '2', '3'].map((id) => `process-variable-filters-${id}-${processNameSuffix}`);
    const today = new Date();
    const todaysDate = format(today, 'yyyy-MM-dd');
    const formValues = [
        {
            [formWidgets.textInputId]: 'the quick brown fox',
            [formWidgets.decimalInputId]: 1.122,
            [formWidgets.datetimeInputId]: '2024-04-04T12:15:00.000Z',
            [formWidgets.integerInputId]: 100,
            [formWidgets.dateInputId]: `${todaysDate}T00:00:00.000Z`,
            [formWidgets.checkboxInputId]: true,
        },
        {
            [formWidgets.textInputId]: 'jumps over the',
            [formWidgets.decimalInputId]: 1.123,
            [formWidgets.datetimeInputId]: '2025-05-05T15:55:00.000Z',
            [formWidgets.integerInputId]: 200,
            [formWidgets.dateInputId]: '2025-05-05T00:00:00.000Z',
            [formWidgets.checkboxInputId]: false,
        },
        {
            [formWidgets.textInputId]: 'lazy dog',
            [formWidgets.decimalInputId]: 1.121,
            [formWidgets.datetimeInputId]: '2026-06-06T16:16:00.000Z',
            [formWidgets.integerInputId]: 300,
            [formWidgets.dateInputId]: '2026-12-12T00:00:00.000Z',
            [formWidgets.checkboxInputId]: false,
        },
    ];
    let processInstances: (StartProcessData | RequestResponse)[] = [];
    let processVariables;

    test.beforeAll(async ({ runtimeBundleServiceHrUser }) => {
        processInstances = await Promise.all(
            processNames.map((processName) =>
                runtimeBundleServiceHrUser.processInstance.startProcess(processVariableFiltersProcess.processDefinitionKey, { name: processName })
            )
        );
        const userTasks = await Promise.all(
            processInstances.map((processInstance) =>
                runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(processInstance.entry.id)
            )
        );
        processVariables = Object.keys(processVariableFiltersProcess.variables).map((element) => processVariableFiltersProcess.variables[element]);
        await Promise.all(userTasks.map((task, index) => runtimeBundleServiceHrUser.forms.submitForm(task[0].entry, formValues[index])));
    });

    test.beforeEach(async ({ processPage, preferenceMock }, workerInfo) => {
        await processPage.refreshUserState('hruser', workerInfo.project.use);

        const columnHeaders = <string[]>processVariables.map((element) => `${element.columnHeader}/${element.variableId}`);
        await preferenceMock.mockCloudColumnsVisibility(columnHeaders, 'processes-cloud-columns-visibility');

        await processPage.navigate();
        await processPage.contentSideNavbar.navigateTo(ProcessManagementLabels.RunningProcesses);
        await processPage.filterContainer.spinnerWaitForReload();
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        for (const processInstance of processInstances) {
            await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.entry.id);
        }
    });

    test(`[XAT-17751] Should be able to sort process variable column in Process list`, async ({ processPage }) => {
        const { columnHeader: integerVariableName } = processVariableFiltersProcess.variables.integerVar;
        let expectedSortOrder: string[] = [];

        await test.step('Set date and process name filter', async () => {
            await processPage.applyFilter('string', { filterName: 'Process Name', value: processNameSuffix });

            await processPage.applyFilter('date', {
                filterName: 'Start Date',
                predefinedDateOption: 'TODAY',
            });
        });

        await test.step('Sort process variable column in Process list in ascending order', async () => {
            expectedSortOrder = ['100', '200', '300'];

            await processPage.dataTable.getColumnHeaderByTitleLocator(integerVariableName).click();

            await expect.soft(processPage.dataTable.getAllCellsByColumnName(integerVariableName)).toHaveText(expectedSortOrder);
        });

        await test.step('Sort process variable column in Process list in descending order', async () => {
            expectedSortOrder = ['300', '200', '100'];

            await processPage.dataTable.getColumnHeaderByTitleLocator(integerVariableName).click();

            await expect(processPage.dataTable.getAllCellsByColumnName(integerVariableName)).toHaveText(expectedSortOrder);
        });
    });

    test(`[XAT-17453] Should be able to filter process list based on string and boolean process variable`, async ({ processPage }) => {
        const { columnHeader: stringVariableName } = processVariableFiltersProcess.variables.stringVar;
        const { columnHeader: booleanVariableName } = processVariableFiltersProcess.variables.booleanVar;
        const stringSearchValue = 'the quick brown fox';
        const substringSearchValue = 'the';
        const noResultsStringSearchValue = 'llama';

        await test.step('Set string filter and verify results', async () => {
            await processPage.applyFilter('string', { filterName: stringVariableName, value: stringSearchValue });
            let columnContent = await processPage.dataTable.getAllCellsByColumnName(stringVariableName).allTextContents();

            expect.soft(columnContent.every((element) => element === stringSearchValue)).toBe(true);

            await processPage.applyFilter('string', { filterName: stringVariableName, value: substringSearchValue });
            columnContent = await processPage.dataTable.getAllCellsByColumnName(stringVariableName).allTextContents();

            expect.soft(columnContent.length).toBeGreaterThan(0);
            expect.soft(columnContent.every((element) => element.includes(substringSearchValue))).toBe(true);
        });

        await test.step('Set string and boolean filters combined and verify results', async () => {
            await processPage.applyFilter('radio', { filterName: booleanVariableName, value: 'true' });
            const stringColumnContent = await processPage.dataTable.getAllCellsByColumnName(stringVariableName).allTextContents();
            const booleanColumnContent = await processPage.dataTable.getAllCellsByColumnName(booleanVariableName).allTextContents();

            expect.soft(stringColumnContent.every((element) => element.includes(substringSearchValue))).toBe(true);
            expect.soft(booleanColumnContent.every((element) => element.includes('true'))).toBe(true);
        });

        await test.step('Set string filter to a non existing value and verify if the list is empty', async () => {
            const expectedMessages = ['No Processes Found', 'Create a new process that you want to easily find later'];

            await processPage.filterContainer.getFilterRemoveIconByFilterName(booleanVariableName).click();
            await processPage.applyFilter('string', { filterName: stringVariableName, value: noResultsStringSearchValue });
            const emptyContent = [
                await processPage.dataTable.getEmptyContentTitleLocator.textContent(),
                await processPage.dataTable.getEmptyContentSubTitleLocator.textContent(),
            ];

            expect(emptyContent).toEqual(expectedMessages);
        });
    });

    test(`[XAT-17453] Should be able to filter process list based on number type process variable`, async ({ processPage }) => {
        const { columnHeader: integerVariableName } = processVariableFiltersProcess.variables.integerVar;
        const { columnHeader: bigdecimalVariableName } = processVariableFiltersProcess.variables.bigdecimalVal;

        await test.step('Set integer filter and verify results', async () => {
            await processPage.applyFilter('number', { filterName: integerVariableName, operator: '> Greater than', value: '100' });
            let columnContent = await processPage.dataTable.getAllCellsByColumnName(integerVariableName).allTextContents();

            expect.soft(columnContent.includes('300')).toBe(true);
            expect.soft(columnContent.includes('200')).toBe(true);
            expect.soft(columnContent.includes('100')).toBe(false);

            await processPage.applyFilter('number', { filterName: integerVariableName, operator: '≤ Less than or equals', value: '200' });
            columnContent = await processPage.dataTable.getAllCellsByColumnName(integerVariableName).allTextContents();

            expect.soft(columnContent.includes('300')).toBe(false);
            expect.soft(columnContent.includes('200')).toBe(true);
            expect.soft(columnContent.includes('100')).toBe(true);
        });

        await test.step('Set bigdecimal filter and verify results', async () => {
            await processPage.filterContainer.getFilterRemoveIconByFilterName(integerVariableName).click();
            await processPage.applyFilter('number', { filterName: bigdecimalVariableName, operator: '= Equals', value: '1.121' });
            const columnContent = await processPage.dataTable.getAllCellsByColumnName(bigdecimalVariableName).allTextContents();

            expect(columnContent.every((element) => element.includes('1.121'))).toBe(true);
        });
    });

    test(`[XAT-17453] Should be able to filter process list based on date and datetime process variable`, async ({ processPage }) => {
        const { columnHeader: dateVariableName } = processVariableFiltersProcess.variables.dateVar;
        const { columnHeader: datetimeVariableName } = processVariableFiltersProcess.variables.datetimeVar;
        let columnContent: string[] = [];

        await test.step('Set date filter and verify results', async () => {
            await processPage.applyFilter('date', {
                filterName: dateVariableName,
                predefinedDateOption: 'TODAY',
            });
            columnContent = await processPage.dataTable.getAllCellsByColumnName(dateVariableName).allTextContents();
            const todaysLongDate = format(today, 'MMM d, yyyy');

            expect.soft(columnContent.every((element) => element.includes(todaysLongDate.trim()))).toBe(true);
        });

        await test.step('Set datetime filter and verify results', async () => {
            await processPage.filterContainer.getFilterRemoveIconByFilterName(dateVariableName).click();
            const date = new Date('2024-04-04');

            await processPage.applyFilter('datetime', {
                filterName: datetimeVariableName,
                datetimeCustomValue: {
                    dateTimeFrom: { date: date, formattedHour: '12', formattedMinutes: '00' },
                    dateTimeTo: { date: date, formattedHour: '15', formattedMinutes: '15' },
                },
            });
            columnContent = await processPage.dataTable.getAllCellsByColumnName(datetimeVariableName).allTextContents();

            const dateWithinRangeISO = '2024-04-04T12:15:00.000Z';
            const dateOutsideRangeISO = '2025-05-05T00:00:00.000Z';
            const dateWithinRange = format(new Date(dateWithinRangeISO), ' MMM d, yyyy, h:mm:ss a ');
            const dateOutsideRange = format(new Date(dateOutsideRangeISO), ' MMM d, yyyy, h:mm:ss a ');

            expect.soft(columnContent).toContain(dateWithinRange);
            expect(columnContent).not.toContain(dateOutsideRange);
        });
    });
});
