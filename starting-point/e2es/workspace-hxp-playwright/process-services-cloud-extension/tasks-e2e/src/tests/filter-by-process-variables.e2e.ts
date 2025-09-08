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
test.describe('Filter task list by process variables values', () => {
    const { processVariableFiltersProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const { formWidgets } = processVariableFiltersProcess.form;
    const uniqueTextInputId = UtilRandom.generateAlphaNumericLowerCase(5);
    const processNames = ['1', '2', '3'].map((id) => `process-variable-filters-${id}-${UtilRandom.generateAlphaNumericLowerCase(5)}`);
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
            [formWidgets.uniqueTextInputId]: uniqueTextInputId,
        },
        {
            [formWidgets.textInputId]: 'jumps over the',
            [formWidgets.decimalInputId]: 1.123,
            [formWidgets.datetimeInputId]: '2025-05-05T15:55:00.000Z',
            [formWidgets.integerInputId]: 200,
            [formWidgets.dateInputId]: '2025-05-05T00:00:00.000Z',
            [formWidgets.checkboxInputId]: false,
            [formWidgets.uniqueTextInputId]: uniqueTextInputId,
        },
        {
            [formWidgets.textInputId]: 'lazy dog',
            [formWidgets.decimalInputId]: 1.121,
            [formWidgets.datetimeInputId]: '2026-06-06T16:16:00.000Z',
            [formWidgets.integerInputId]: 300,
            [formWidgets.dateInputId]: '2026-12-12T00:00:00.000Z',
            [formWidgets.checkboxInputId]: false,
            [formWidgets.uniqueTextInputId]: uniqueTextInputId,
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

    test.beforeEach(async ({ tasksPage, preferenceMock }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);

        const columnHeaders = <string[]>processVariables.map((element) => `${element.columnHeader}/${element.variableId}`);
        await preferenceMock.mockCloudColumnsVisibility(columnHeaders, 'tasks-list-cloud-columns-visibility');

        await tasksPage.navigate();
        await tasksPage.contentSideNavbar.navigateTo(ProcessManagementLabels.MyTasks);
        await tasksPage.filterContainer.spinnerWaitForReload();
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        for (const processInstance of processInstances) {
            await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.entry.id);
        }
    });

    test(`[XAT-17719] Should be able to sort process variable column in Task list`, async ({ tasksPage }) => {
        const { columnHeader: stringVariableName } = processVariableFiltersProcess.variables.stringVar;
        let expectedSortOrder: string[] = [];

        await test.step('Set date and task name filter', async () => {
            await tasksPage.applyFilter('string', { filterName: 'unique_var', value: uniqueTextInputId });
        });

        await test.step('Sort process variable column in Task list in ascending order', async () => {
            expectedSortOrder = ['jumps over the', 'lazy dog', 'the quick brown fox'];

            await tasksPage.dataTable.getColumnHeaderByTitleLocator(stringVariableName).click();

            await expect.soft(tasksPage.dataTable.getAllCellsByColumnName(stringVariableName)).toHaveText(expectedSortOrder);
        });

        await test.step('Sort process variable column in Task list in descending order', async () => {
            expectedSortOrder = ['the quick brown fox', 'lazy dog', 'jumps over the'];

            await tasksPage.dataTable.getColumnHeaderByTitleLocator(stringVariableName).click();

            await expect(tasksPage.dataTable.getAllCellsByColumnName(stringVariableName)).toHaveText(expectedSortOrder);
        });
    });

    test(`[XAT-17454] Should be able to filter task list based on string and boolean process variable`, async ({ tasksPage }) => {
        const { columnHeader: stringVariableName } = processVariableFiltersProcess.variables.stringVar;
        const { columnHeader: booleanVariableName } = processVariableFiltersProcess.variables.booleanVar;
        const stringSearchValue = 'the quick brown fox';
        const substringSearchValue = 'the';
        const noResultsStringSearchValue = 'llama';

        await test.step('Set string filter and verify results', async () => {
            await tasksPage.applyFilter('string', { filterName: stringVariableName, value: stringSearchValue });
            let columnContent = await tasksPage.dataTable.getAllCellsByColumnName(stringVariableName).allTextContents();

            expect.soft(columnContent.every((element) => element === stringSearchValue)).toBe(true);

            await tasksPage.applyFilter('string', { filterName: stringVariableName, value: substringSearchValue });
            columnContent = await tasksPage.dataTable.getAllCellsByColumnName(stringVariableName).allTextContents();

            expect.soft(columnContent.length).toBeGreaterThan(0);
            expect.soft(columnContent.every((element) => element.includes(substringSearchValue))).toBe(true);
        });

        await test.step('Set string and boolean filters combined and verify results', async () => {
            await tasksPage.applyFilter('radio', { filterName: booleanVariableName, value: 'true' });
            const stringColumnContent = await tasksPage.dataTable.getAllCellsByColumnName(stringVariableName).allTextContents();
            const booleanColumnContent = await tasksPage.dataTable.getAllCellsByColumnName(booleanVariableName).allTextContents();

            expect.soft(stringColumnContent.every((element) => element.includes(substringSearchValue))).toBe(true);
            expect.soft(booleanColumnContent.every((element) => element.includes('true'))).toBe(true);
        });

        await test.step('Set string filter to a non existing value and verify if the list is empty', async () => {
            const expectedMessages = ['No Tasks Found', 'Create a new task that you want to easily find later'];

            await tasksPage.filterContainer.getFilterRemoveIconByFilterName(booleanVariableName).click();
            await tasksPage.applyFilter('string', { filterName: stringVariableName, value: noResultsStringSearchValue });
            const emptyContent = [
                await tasksPage.dataTable.getEmptyContentTitleLocator.textContent(),
                await tasksPage.dataTable.getEmptyContentSubTitleLocator.textContent(),
            ];

            expect(emptyContent).toEqual(expectedMessages);
        });
    });

    test(`[XAT-17454] Should be able to filter task list based on number type process variable`, async ({ tasksPage }) => {
        const { columnHeader: integerVariableName } = processVariableFiltersProcess.variables.integerVar;
        const { columnHeader: bigdecimalVariableName } = processVariableFiltersProcess.variables.bigdecimalVal;

        await test.step('Set integer filter and verify results', async () => {
            await tasksPage.applyFilter('number', { filterName: integerVariableName, operator: '> Greater than', value: '100' });
            let columnContent = await tasksPage.dataTable.getAllCellsByColumnName(integerVariableName).allTextContents();

            expect.soft(columnContent.includes('300')).toBe(true);
            expect.soft(columnContent.includes('200')).toBe(true);
            expect.soft(columnContent.includes('100')).toBe(false);

            await tasksPage.applyFilter('number', { filterName: integerVariableName, operator: '≤ Less than or equals', value: '200' });
            columnContent = await tasksPage.dataTable.getAllCellsByColumnName(integerVariableName).allTextContents();

            expect.soft(columnContent.includes('300')).toBe(false);
            expect.soft(columnContent.includes('200')).toBe(true);
            expect.soft(columnContent.includes('100')).toBe(true);
        });

        await test.step('Set bigdecimal filter and verify results', async () => {
            await tasksPage.filterContainer.getFilterRemoveIconByFilterName(integerVariableName).click();
            await tasksPage.applyFilter('number', { filterName: bigdecimalVariableName, operator: '≠ Does not equal', value: '1.121' });

            const columnContent = await tasksPage.dataTable.getAllCellsByColumnName(bigdecimalVariableName).allTextContents();

            expect(columnContent.includes('1.121')).toBe(false);
        });
    });

    test(`[XAT-17454] Should be able to filter task list based on date and datetime process variable`, async ({ tasksPage }) => {
        const { columnHeader: dateVariableName } = processVariableFiltersProcess.variables.dateVar;
        const { columnHeader: datetimeVariableName } = processVariableFiltersProcess.variables.datetimeVar;
        let columnContent: string[] = [];

        await test.step('Set date filter and verify results', async () => {
            await tasksPage.applyFilter('date', {
                filterName: dateVariableName,
                predefinedDateOption: 'TODAY',
            });
            columnContent = await tasksPage.dataTable.getAllCellsByColumnName(dateVariableName).allTextContents();
            const todaysLongDate = format(today, 'MMM d, yyyy');

            expect.soft(columnContent.every((element) => element.includes(todaysLongDate.trim()))).toBe(true);
        });

        await test.step('Set datetime filter and verify results', async () => {
            await tasksPage.filterContainer.getFilterRemoveIconByFilterName(dateVariableName).click();
            const filterDate = new Date('2024-04-04');

            await tasksPage.applyFilter('datetime', {
                filterName: datetimeVariableName,
                datetimeCustomValue: {
                    dateTimeFrom: { date: filterDate, formattedHour: '12', formattedMinutes: '00' },
                    dateTimeTo: { date: filterDate, formattedHour: '15', formattedMinutes: '15' },
                },
            });
            columnContent = await tasksPage.dataTable.getAllCellsByColumnName(datetimeVariableName).allTextContents();
            const dateTimeWithinRange = ' Apr 4, 2024, 12:15:00 PM ';
            const dateTimeOutsideRange = ' June 6, 2025, 11:00:00 AM ';

            expect.soft(columnContent).toContain(dateTimeWithinRange);
            expect(columnContent).not.toContain(dateTimeOutsideRange);
        });
    });
});
