/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { UtilRandom, getUserState, ProcessInstanceDataEntry, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { expect, ProcessManagementLabels, test } from '@hxp/playwright/workspace-hxp';
import { format, addDays } from 'date-fns';

test.use({ storageState: getUserState('hruser') });
test.describe('Custom filters on processes list', () => {
    const { simpleProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const today = new Date();
    let processPrefix: string;
    let runningProcessName: string;
    let completedProcessName: string;
    let runningProcessInstance: ProcessInstanceDataEntry;
    let completedProcessInstance: ProcessInstanceDataEntry;

    test.beforeAll(async ({ runtimeBundleServiceHrUser }) => {
        processPrefix = UtilRandom.generateAlphaNumericLowerCase(5);
        runningProcessName = `${processPrefix}-running-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
        completedProcessName = `${processPrefix}-completed-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
        ({ entry: runningProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(simpleProcess.processDefinitionKey, {
            name: runningProcessName,
        }));
        ({ entry: completedProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(simpleProcess.processDefinitionKey, {
            name: completedProcessName,
        }));

        const userTasks = await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(completedProcessInstance.id);
        await runtimeBundleServiceHrUser.tasks.completeTask(userTasks[0].entry.id);
    });

    test.beforeEach(async ({ processPage }, workerInfo) => {
        await processPage.refreshUserState('hruser', workerInfo.project.use);

        await processPage.navigate();
        await processPage.contentSideNavbar.navigateTo(ProcessManagementLabels.RunningProcesses);
        await processPage.filterContainer.spinnerWaitForReload();
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        for (const processInstance of [runningProcessInstance, completedProcessInstance]) {
            await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
        }
    });

    test(`[XAT-17394] Should be able to filter the process list using checkbox filters`, async ({ processPage }) => {
        const checkboxTypeFilters = [
            { name: 'App version', value: '1', parameter: 'appVersion' },
            { name: 'Process Definition Name', value: simpleProcess.processName, parameter: `processDefinitionName` },
            { name: 'Status', value: 'COMPLETED', parameter: 'status' },
        ];

        for (const filter of checkboxTypeFilters) {
            await processPage.applyFilter('checkbox', {
                filterName: filter.name,
                value: filter.value,
            });
            const columnContent = await processPage.dataTable.getAllCellsByColumnName(filter.name).allTextContents();

            expect.soft(columnContent.every((element) => element === filter.value)).toBe(true);
        }
    });

    test(`[XAT-17395] Should be able to filter process list - date filters`, async ({ processPage }) => {
        await test.step(`Set a Start date filter with option "Today"`, async () => {
            await processPage.applyFilter('date', {
                filterName: 'Start Date',
                predefinedDateOption: 'TODAY',
            });
        });

        await test.step('Verify that proper processes are displayed', async () => {
            const columnContent = await processPage.dataTable.getAllCellsByColumnName('Started date').allTextContents();

            const formattedDate = format(today, 'MMM d, yyyy');
            expect.soft(columnContent.every((element) => element === formattedDate)).toBe(true);
        });

        const tomorrow = addDays(new Date(), 1);
        const tomorrowsDate = format(tomorrow, 'MM/d/yyyy');
        let todaysDate = format(today, 'MM/d/yyyy');

        await test.step('Set date range for Completed date filter', async () => {
            await processPage.filterContainer.getFilterRemoveIconByFilterName('Start date').click();
            await processPage.applyFilter('checkbox', {
                filterName: 'Status',
                value: 'COMPLETED',
            });
            await processPage.applyFilter('date', {
                filterName: 'Completed Date',
                customStartDate: todaysDate,
                customEndDate: tomorrowsDate,
            });
        });

        await test.step('Verify that proper processes are displayed', async () => {
            await processPage.dataTable.spinnerWaitForReload();
            const columnContent = await processPage.dataTable.getAllCellsByColumnName('Completed Date').allTextContents();
            todaysDate = format(today, 'MMM d, yyyy');

            expect.soft(columnContent.every((element) => element.trim() === todaysDate)).toBe(true);
        });

        await test.step('Remove the filters and confirm that all processes are visible', async () => {
            await processPage.filterContainer.getFilterRemoveIconByFilterName('Completed Date').click();
            await processPage.filterContainer.getFilterRemoveIconByFilterName('Status').click();
            await processPage.dataTable.spinnerWaitForReload();
            const columnContent = await processPage.dataTable.getAllCellsByColumnName('Status').allTextContents();

            expect.soft(columnContent).toContain('RUNNING');
            expect(columnContent).toContain('COMPLETED');
        });
    });

    test(`[XAT-17396] Should be able to filter process list - string type and user filters`, async ({ processPage }) => {
        await test.step('Verify that process name column contains only names with prefix used in filter', async () => {
            await processPage.applyFilter('string', { filterName: 'Process Name', value: processPrefix });
            const columnContent = await processPage.dataTable.getAllCellsByColumnName('Process Name').allTextContents();

            expect.soft(columnContent.every((element) => element.includes(processPrefix))).toBe(true);
        });

        await test.step(`Search by 'Started by' filter and verify that 'Started by' column contains only HR user`, async () => {
            await processPage.applyFilter('user', { filterName: 'Started By', value: 'hruser' });
            const columnContent = await processPage.dataTable.getAllCellsByColumnName('Started By').allTextContents();

            expect(columnContent.every((element) => element === 'hruser')).toBe(true);
        });
    });
});
