/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { expect, getUserState, HXP_APPS, ProcessInstanceDataEntry } from '@alfresco-dbp/playwright/shared';
import { test } from '@hxp/playwright/workspace-hxp';

test.describe('Section', () => {
    test.use({ storageState: getUserState('hruser') });

    const { sectionProcess } = HXP_APPS.SYS_WORKSPACE.processes;
    const {
        section1,
        section2,
        section3,
        integer,
        displayText,
        people,
        date,
        dateTime,
        text,
        group,
        sectionInTask,
        displayValue,
        groupWithoutHeader,
    } = sectionProcess.formElements;
    const testValue = 'test';
    let runningProcess: ProcessInstanceDataEntry;

    test.beforeEach(async ({ tasksPage }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);

        await tasksPage.navigate();
        await tasksPage.pageLayoutHeaderComponent.startProcessButton.click();
        await tasksPage.startProcessDialog.selectProcess(sectionProcess.processName);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessesIfExist(runningProcess.id);
    });

    test('[XAT-17534] Should be able to correctly display form with sections', async ({
        tasksPage,
        startProcessPage,
        taskDetailsPage,
        queryServiceHrUser,
        runtimeBundleServiceHrUser,
    }) => {
        await test.step('Verify that start form with sections has all fields displayed', async () => {
            const fieldsToVerify = [
                { sectionId: section1.id, fieldId: integer.id },
                { sectionId: section1.id, fieldId: displayText.id },
                { sectionId: section2.id, fieldId: people.id },
                { sectionId: section2.id, fieldId: date.id },
                { sectionId: section2.id, fieldId: dateTime.id },
                { sectionId: section3.id, fieldId: text.id },
            ];

            for (const { sectionId, fieldId } of fieldsToVerify) {
                await expect.soft(startProcessPage.taskForm.getSectionFieldByIdLocator(sectionId, fieldId)).toBeVisible();
            }

            await expect.soft(startProcessPage.taskForm.getHeaderLabelByIdLocator(group.id)).toBeVisible();
        });

        await test.step('Verify that visibility conditions and form rules work for section and its fields', async () => {
            const fieldsToVerify = [
                { sectionId: section1.id, fieldId: integer.id },
                { sectionId: section2.id, fieldId: people.id },
                { sectionId: section2.id, fieldId: date.id },
                { sectionId: section2.id, fieldId: dateTime.id },
            ];

            await startProcessPage.taskForm.getSectionFieldInputByIdLocator(section3.id, text.id).fill(testValue);

            for (const { sectionId, fieldId } of fieldsToVerify) {
                await expect.soft(startProcessPage.taskForm.getSectionFieldByIdLocator(sectionId, fieldId)).toBeHidden();
            }

            await expect.soft(startProcessPage.taskForm.getSectionFieldByIdLocator(section1.id, displayText.id)).toHaveText('testing');
        });

        await test.step('Verify that form styling works for field inside section', async () => {
            const displayTextStyle = await startProcessPage.taskForm.getSectionFieldByIdLocator(section1.id, displayText.id).getAttribute('style');

            expect.soft(displayTextStyle).toContain(displayText.style);
        });

        await test.step('Start the process', async () => {
            await startProcessPage.startProcessFooter.startProcessButton.click();
            await tasksPage.snackBar.closeSnackBar('Process created');
            ({ entry: runningProcess } = await queryServiceHrUser.processInstance.waitAndGetProcessInstanceByFilters({
                filters: {
                    processDefinitionName: sectionProcess.processName,
                    status: 'RUNNING',
                },
            }));
        });

        await test.step('Verify that task form is correctly displayed and contains mapped value', async () => {
            const userTasks = await runtimeBundleServiceHrUser.processInstance.waitAndGetTasksByProcessInstanceId(runningProcess.id);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            const displayValueStyle = await taskDetailsPage.taskForm
                .getFieldNthColumnByIdLocator(sectionInTask.id, Number(displayValue.column))
                .getAttribute('style');

            expect.soft(displayValueStyle).toContain(displayValue.style);
            await expect.soft(taskDetailsPage.taskForm.getFieldColumnByIdLocator(sectionInTask.id)).toHaveCount(5);
            await expect
                .soft(taskDetailsPage.taskForm.getSectionFieldInNthColumnByIdLocator(sectionInTask.id, displayValue.id, Number(displayValue.column)))
                .toBeVisible();
            await expect.soft(taskDetailsPage.taskForm.getHeaderLabelByIdLocator(groupWithoutHeader.id)).toBeHidden();
            await expect.soft(taskDetailsPage.taskForm.getFieldInputByIdLocator(displayValue.id)).toHaveValue(testValue);
        });

        await test.step('Complete the task', async () => {
            await taskDetailsPage.taskForm.completeButtonLocator.click();

            await expect(tasksPage.snackBar.message).toContainText('The task has been completed');
        });
    });
});
