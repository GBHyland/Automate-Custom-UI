/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, ProcessInstanceDataEntry, TaskDataEntry, UtilRandom, getUserState } from '@alfresco-dbp/playwright/shared';
import { test, expect } from '../fixtures/page-initialization';

test.use({ storageState: getUserState('hruser') });
test.describe('Change assignee', () => {
    const { processes } = HXP_APPS.SYS_WORKSPACE;
    const { candidateUsersGroupProcess, candidateUserProcess } = processes;
    let processNameSalesUser: string;
    let processNameHrUser: string;
    let processInstanceSalesUser: ProcessInstanceDataEntry;
    let processInstanceHrUser: ProcessInstanceDataEntry;
    let taskHrUser: TaskDataEntry;
    let taskSalesUser: TaskDataEntry;

    test.beforeEach(async ({ processDetailsPage }, workerInfo) => {
        await processDetailsPage.refreshUserState('hruser', workerInfo.project.use);

        processNameSalesUser = `process-sales-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
        processNameHrUser = `process-hr-${UtilRandom.generateAlphaNumericLowerCase(5)}`;
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser, runtimeBundleServiceSalesUser }) => {
        await runtimeBundleServiceSalesUser.processInstance.deleteProcessInstance(processInstanceSalesUser.id);
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstanceHrUser.id);
    });

    test.describe('when user task has candidate users and groups as assignment', () => {
        test.beforeEach(async ({ runtimeBundleServiceHrUser, runtimeBundleServiceSalesUser, queryServiceHrUser, queryServiceSalesUser }) => {
            ({ entry: processInstanceSalesUser } = await runtimeBundleServiceSalesUser.processInstance.startProcess(
                candidateUsersGroupProcess.processDefinitionKey,
                { name: processNameSalesUser }
            ));
            ({ entry: processInstanceHrUser } = await runtimeBundleServiceHrUser.processInstance.startProcess(
                candidateUsersGroupProcess.processDefinitionKey,
                { name: processNameHrUser }
            ));
            ({ entry: taskSalesUser } = await queryServiceSalesUser.userTasks.waitAndGetTasksByFilters({
                processInstanceId: processInstanceSalesUser.id,
            }));
            ({ entry: taskHrUser } = await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({ processInstanceId: processInstanceHrUser.id }));
        });

        test('[C687687] Candidate group member should be able to see only individual process directly', async ({
            processPage,
            processDetailsPage,
        }) => {
            await processPage.navigate();
            await processPage.dataTable.waitForRootElement();

            await expect.soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue('Process Name', processNameHrUser)).toBeVisible();
            await expect.soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue('Process Name', processNameSalesUser)).toBeHidden();

            await processDetailsPage.navigate({ query: processInstanceSalesUser.id });
            await processDetailsPage.dataTable.waitForRootElement();

            await expect(
                processDetailsPage.dataTable.getRowByColumnTitleAndItsCellValue('Task Name', candidateUsersGroupProcess.taskName)
            ).toBeVisible();
        });

        test('[C704108] User as not process initiator is able to see process of the task to which he is assigned', async ({
            processPage,
            processDetailsPage,
            taskDetailsPage,
            runtimeBundleServiceHrUser,
        }) => {
            await runtimeBundleServiceHrUser.tasks.claimTask(taskSalesUser.id, 'hruser');
            await processPage.navigate();
            await processPage.dataTable.waitForRootElement();

            await expect.soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue('Process Name', processNameSalesUser)).toBeVisible();

            await processDetailsPage.openProcessTaskByName(processInstanceSalesUser, candidateUsersGroupProcess.taskName);
            await taskDetailsPage.taskForm.getActionButtonLocator('RELEASE').click();

            await expect.soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue('Process Name', processNameSalesUser)).toBeHidden();
        });

        test('[C587521] Assigned candidate group member can change the assignee of the task only among candidate users', async ({
            processDetailsPage,
            runtimeBundleServiceHrUser,
            taskDetailsPage,
        }) => {
            await runtimeBundleServiceHrUser.tasks.claimTask(taskHrUser.id, 'hruser');
            await processDetailsPage.openProcessTaskByName(processInstanceHrUser, candidateUsersGroupProcess.taskName);
            await taskDetailsPage.taskHeader.infoDrawerIconLocator.click();

            await expect.soft(taskDetailsPage.infoDrawer.getInputByTitleLocator('Assignee')).toHaveValue('hruser');

            await taskDetailsPage.infoDrawer.getInputByTitleLocator('Assignee').click();
            await taskDetailsPage.changeAssigneeDialog.peopleComponent.getRemoveButtonForUserLocator('hruser').click();
            await taskDetailsPage.changeAssigneeDialog.peopleComponent.getUsersInputLocator.fill('s');
            await taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.waitForRootElement();

            await expect.soft(taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.getOptionLocator('salesuser')).toBeVisible();

            expect
                .soft(await taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.getOptionsList())
                .not.toEqual(expect.arrayContaining(['hruser']));

            await taskDetailsPage.changeAssigneeDialog.peopleComponent.getUsersInputLocator.fill('hruser');

            await expect(taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.noUserFoundInfoLocator).toHaveText(
                'No user found with the username hruser'
            );
        });
    });

    test.describe('when user task has only candidate users as assignment', () => {
        test.beforeEach(async ({ runtimeBundleServiceHrUser, runtimeBundleServiceSalesUser, queryServiceHrUser, queryServiceSalesUser }) => {
            ({ entry: processInstanceSalesUser } = await runtimeBundleServiceSalesUser.processInstance.startProcess(
                candidateUserProcess.processDefinitionKey,
                { name: processNameSalesUser }
            ));
            ({ entry: processInstanceHrUser } = await runtimeBundleServiceHrUser.processInstance.startProcess(
                candidateUserProcess.processDefinitionKey,
                { name: processNameHrUser }
            ));
            ({ entry: taskHrUser } = await queryServiceHrUser.userTasks.waitAndGetTasksByFilters({ processInstanceId: processInstanceHrUser.id }));
            ({ entry: taskSalesUser } = await queryServiceSalesUser.userTasks.waitAndGetTasksByFilters({
                processInstanceId: processInstanceSalesUser.id,
            }));
        });

        test('[C687686] Candidate user should be able to see processes that include tasks where he is a user candidate', async ({ processPage }) => {
            await processPage.navigate();
            await processPage.dataTable.waitForRootElement();

            await expect.soft(processPage.dataTable.getRowByColumnTitleAndItsCellValue('Process Name', processNameSalesUser)).toBeVisible();
        });

        test('[C587520] Assigned candidate user can change the assignee of the task among candidate users', async ({
            processDetailsPage,
            runtimeBundleServiceHrUser,
            taskDetailsPage,
        }) => {
            await runtimeBundleServiceHrUser.tasks.claimTask(taskHrUser.id, 'hruser');
            await processDetailsPage.openProcessTaskByName(processInstanceHrUser, candidateUserProcess.taskName);
            await taskDetailsPage.taskHeader.infoDrawerIconLocator.click();
            await taskDetailsPage.infoDrawer.getInputByTitleLocator('Assignee').click();
            await taskDetailsPage.changeAssigneeDialog.peopleComponent.getRemoveButtonForUserLocator('hruser').click();
            await taskDetailsPage.changeAssigneeDialog.peopleComponent.getUsersInputLocator.fill('s');
            await taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.waitForRootElement();

            await expect.soft(taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.getOptionLocator('salesuser')).toBeVisible();
            await expect.soft(taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.getOptionLocator('hruser')).toBeVisible();

            await taskDetailsPage.changeAssigneeDialog.peopleComponent.dropdown.getOptionLocator('salesuser').click();
            await taskDetailsPage.changeAssigneeDialog.getButtonByExactText('Assign').click();

            await expect.soft(taskDetailsPage.snackBar.message).toHaveText('Task assignee changed successfully');

            await processDetailsPage.navigate({ query: processInstanceHrUser.id });
            await processDetailsPage.dataTable.waitForRootElement();

            await expect.soft(processDetailsPage.dataTable.getCellByColumnNameAndRowItem('ASSIGNED', 'Status')).toBeVisible();
            await expect(processDetailsPage.dataTable.getCellByColumnNameAndRowItem('salesuser', 'Assignee')).toBeVisible();
        });
    });
});
