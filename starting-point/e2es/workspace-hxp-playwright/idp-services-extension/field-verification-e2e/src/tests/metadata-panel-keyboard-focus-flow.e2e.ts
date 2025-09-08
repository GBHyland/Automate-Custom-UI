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
const { startProcess, waitForUserTask, createFolder, cleanupFiles, expectTableFieldSelected, expectFieldFocused } = idpHelperMethods;

import { TEST_FILES } from '../resources';

test.use({ storageState: getUserState('hruser') });

test.describe('IDP Services Extension - Field Verification User Task', () => {
    /** managed by beforeAll and afterAll */
    let uploadFolder: Readonly<Document>;
    /** managed by beforeAll and afterAll */
    let basketball2tables1pageBlankFields: Readonly<Document>;

    /** deleted by afterEach */
    let processInstance: ProcessInstanceData | RequestResponse | undefined;
    const { processes } = HXP_APPS.SYS_IDP_E2E;
    const { idpFieldVerification: testProcess } = processes;

    test.beforeAll(async ({ hxprApi, skipOrExecuteTestBasedOnFlagStatus }) => {
        await skipOrExecuteTestBasedOnFlagStatus(test, FeatureFlagsNames.IdpPromptBasedConfiguration, 'new-functionality');
        const folderData = await createFolder(hxprApi, [TEST_FILES.basketball2tables1pageBlankFields]);
        uploadFolder = folderData.uploadFolder;
        basketball2tables1pageBlankFields = folderData.uploadedFiles[0];
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

    test.describe('Focus flow for Enter key when multiple fields need attention', () => {
        test(`[XAT-18083] Focus flow for Enter key when multiple fields need attention`, async ({
            taskDetailsPage,
            runtimeBundleServiceHrUser: runtimeBundleService,
            page,
        }) => {
            processInstance = await startProcess(runtimeBundleService, [basketball2tables1pageBlankFields], {
                processDefinitionKey: testProcess.processDefinitionKey,
                variables: testProcess.variables,
            });

            // Wait for the process to be started and the user task to be available
            const userTasks = await waitForUserTask(runtimeBundleService, processInstance);
            await taskDetailsPage.navigate({ query: `/${userTasks[0].entry.id}`, waitUntil: 'load' });

            // Variables
            const fields = {
                organization: page.locator('[data-automation-id^="idp-field-Organization"]'),
                city: page.locator('[data-automation-id^="idp-field-City"]'),
                arena: page.locator('[data-automation-id^="idp-field-Arena"]'),
                division: page.locator('[data-automation-id^="idp-field-Division"]'),
                conference: page.locator('[data-automation-id^="idp-field-Conference"]'),
            };
            const TABLE_FIELDS = {
                freeThrows: 'Free Throws',
                rebounds: 'Rebounds',
                minutesPlayed: 'Minutes Played',
                threePtFieldGoals: '3Pt Field Goals',
            };
            interface NavigationStep {
                action: 'focus' | 'enter';
                target?: typeof fields[keyof typeof fields];
                verify: () => Promise<void>;
                description: string;
            }

            /*
            TEST DESCRIPTION: https://hyland.atlassian.net/browse/XAT-18083
            */
            const navigationSteps: NavigationStep[] = [
                {
                    action: 'focus',
                    target: fields.arena,
                    verify: () => expectFieldFocused(fields.arena, expect),
                    description: 'Arena is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectTableFieldSelected(page, TABLE_FIELDS.freeThrows, expect),
                    description: `"${TABLE_FIELDS.freeThrows}" table field has idp-is-selected class`,
                },
                {
                    action: 'enter',
                    verify: () => expectTableFieldSelected(page, TABLE_FIELDS.rebounds, expect),
                    description: `"${TABLE_FIELDS.rebounds}" table field has idp-is-selected class`,
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.division, expect),
                    description: '"Division" field is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.conference, expect),
                    description: '"Conference" field is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.city, expect),
                    description: '"City" field is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.arena, expect),
                    description: '"Arena" field is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectTableFieldSelected(page, TABLE_FIELDS.minutesPlayed, expect),
                    description: `"${TABLE_FIELDS.minutesPlayed}" table field has idp-is-selected class`,
                },
                {
                    action: 'enter',
                    verify: () => expectTableFieldSelected(page, TABLE_FIELDS.threePtFieldGoals, expect),
                    description: `"${TABLE_FIELDS.threePtFieldGoals}" table field has idp-is-selected class`,
                },
                {
                    action: 'enter',
                    verify: () => expectTableFieldSelected(page, TABLE_FIELDS.freeThrows, expect),
                    description: `"${TABLE_FIELDS.freeThrows}" table field has idp-is-selected class`,
                },
                {
                    action: 'enter',
                    verify: () => expectTableFieldSelected(page, TABLE_FIELDS.rebounds, expect),
                    description: `"${TABLE_FIELDS.rebounds}" table field has idp-is-selected class`,
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.division, expect),
                    description: '"Division" field is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.conference, expect),
                    description: '"Conference" field is focused',
                },
                {
                    action: 'enter',
                    verify: () => expectFieldFocused(fields.organization, expect),
                    description: '"Organization" field is focused',
                },
            ];

            for (const [i, step] of navigationSteps.entries()) {
                if (!step.verify || !step.description) {
                    throw new Error(`Navigation step at index ${i} is missing a verify function or description.`);
                }
                if (step.action === 'focus') {
                    await step.target.focus();
                } else if (step.action === 'enter') {
                    await page.keyboard.press('Enter');
                } else {
                    throw new Error(`Unknown action: ${step.action}`);
                }
                await test.step(`Verify ${step.description}`, step.verify);
            }
        });
    });
});
