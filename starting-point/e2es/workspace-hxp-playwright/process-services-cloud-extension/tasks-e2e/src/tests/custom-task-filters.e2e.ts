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
test.describe('Custom task filters', () => {
    const { processVariableFiltersProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const today = new Date();
    let processPrefix: string;
    let runningProcessName: string;
    let runningProcessInstance: ProcessInstanceDataEntry;

    test.beforeAll(async ({ runtimeBundleServiceHrUser }) => {
        processPrefix = UtilRandom.generateAlphaNumericLowerCase(5);
        runningProcessName = `${processPrefix}-running-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
        ({ entry: runningProcessInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(
            processVariableFiltersProcess.processDefinitionKey,
            {
                name: runningProcessName,
            }
        ));

        const userTasks = await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(runningProcessInstance.id);
        await runtimeBundleServiceHrUser.tasks.completeTask(userTasks[0].entry.id);
    });

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);

        await tasksPage.navigate();
        await tasksPage.contentSideNavbar.navigateTo(ProcessManagementLabels.MyTasks);
        await tasksPage.filterContainer.spinnerWaitForReload();
    });

    test.afterAll(async ({ runtimeBundleServiceHrUser }) => {
        for (const processInstance of [runningProcessInstance]) {
            await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
        }
    });

    test(`[XAT-17450] Should be able to filter the task list using checkbox filters`, async ({ tasksPage }) => {
        const checkboxTypeFilters = [
            { name: 'Process Definition Name', value: processVariableFiltersProcess.processName },
            { name: 'Status', value: 'COMPLETED' },
        ];

        for (const filter of checkboxTypeFilters) {
            await tasksPage.applyFilter('checkbox', {
                filterName: filter.name,
                value: filter.value,
            });

            const columnContent = await tasksPage.dataTable.getAllCellsByColumnName(filter.name).allTextContents();

            expect.soft(columnContent.every((element) => element === filter.value)).toBe(true);
        }
    });

    test(`[XAT-17451] Should be able to filter task list - date filters`, async ({ tasksPage }) => {
        const dueDate = new Date('2026-09-27');
        let dueDateFilterStartDate = format(dueDate, 'MM/dd/yyyy');
        let dueDateFilterEndDate = format(addDays(dueDate, 1), 'MM/dd/yyyy');

        await test.step(`Set 'Process Definition Name' Filter`, async () => {
            await tasksPage.applyFilter('checkbox', {
                filterName: 'Process Definition Name',
                value: processVariableFiltersProcess.processName,
            });
        });

        await test.step(`Set a due date filter with 'Custom Range' which includes Task Due Date and verify task is displayed`, async () => {
            await tasksPage.applyFilter('date', {
                filterName: 'Due Date',
                customStartDate: dueDateFilterStartDate,
                customEndDate: dueDateFilterEndDate,
            });

            const columnContent = await tasksPage.dataTable.getAllCellsByColumnName('Due Date').allTextContents();
            const taskDueDate = format(dueDate, 'MMM d, yyyy');

            expect.soft(columnContent.every((element) => element.trim() === taskDueDate)).toBe(true);
        });

        await test.step(`Set a due date filter with 'Custom Range' which doesn't include Task Due Date and verify no tasks are displayed `, async () => {
            dueDateFilterStartDate = format(addDays(dueDate, 1), 'MM/d/yyyy');
            dueDateFilterEndDate = format(addDays(dueDate, 2), 'MM/d/yyyy');

            await tasksPage.applyFilter('date', {
                filterName: 'Due Date',
                customStartDate: dueDateFilterStartDate,
                customEndDate: dueDateFilterEndDate,
            });

            await expect.soft(tasksPage.dataTable.getEmptyContentTitleLocator).toHaveText('No Tasks Found');
        });

        const tomorrow = addDays(new Date(), 1);
        const tomorrowsDate = format(tomorrow, 'MM/d/yyyy');
        let todaysDate = format(today, 'MM/d/yyyy');

        await test.step('Set a Created date filter with custom date range', async () => {
            await tasksPage.filterContainer.getFilterRemoveIconByFilterName('Due Date').click();
            await tasksPage.applyFilter('date', {
                filterName: 'Created Date',
                customStartDate: todaysDate,
                customEndDate: tomorrowsDate,
            });
        });

        await test.step('Verify tasks are displayed', async () => {
            const columnContent = await tasksPage.dataTable.getAllCellsByColumnName('Created Date').allTextContents();

            todaysDate = format(today, 'MMM d, yyyy');

            expect(columnContent.every((element) => element.trim() === todaysDate)).toBe(true);
        });
    });

    test(`[XAT-17452] Should be able to filter task list - string type and user filters`, async ({ tasksPage }) => {
        await test.step('Filter task name with a value', async () => {
            const task2Value = processVariableFiltersProcess.taskFlow.task2;

            await tasksPage.applyFilter('string', { filterName: 'Task Name', value: task2Value });
            const columnContent = await tasksPage.dataTable.getAllCellsByColumnName('Task Name').allTextContents();

            expect.soft(columnContent.every((element) => element.includes(task2Value))).toBe(true);
        });

        await test.step('Task list should be empty for odd task name', async () => {
            const task5Value = 'task5';

            await tasksPage.applyFilter('string', { filterName: 'Task Name', value: task5Value });

            await expect.soft(tasksPage.dataTable.getEmptyContentTitleLocator).toHaveText('No Tasks Found');
        });

        await test.step(`Filter by 'Assignee' and provide another user, task list should be empty`, async () => {
            await tasksPage.filterContainer.getFilterRemoveIconByFilterName('Assignee').click();
            await tasksPage.applyFilter('user', { filterName: 'Assignee', value: 'repoadmin' });

            await expect(tasksPage.dataTable.getEmptyContentTitleLocator).toHaveText('No Tasks Found');
        });
    });
});
