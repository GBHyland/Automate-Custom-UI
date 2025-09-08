/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { expect, getUserState, HXP_APPS, ProcessInstanceDataEntry, UtilRandom } from '@alfresco-dbp/playwright/shared';
import { test } from '../fixtures/page-initialization';
import { ProcessManagementLabels } from '@hxp/playwright/workspace-hxp';

test.use({ storageState: getUserState('hruser') });
test.describe('Preferences', () => {
    let processInstance: ProcessInstanceDataEntry;

    test.beforeEach(async ({ tasksPage, preferenceMock, runtimeBundleServiceHrUser }, workerInfo) => {
        await tasksPage.refreshUserState('hruser', workerInfo.project.use);

        const processInstanceName = `fe-e2e-C694089-${UtilRandom.generateAlphaLowerCase(5)}`;
        const { simpleProcess } = HXP_APPS.SYS_WORKSPACE.processes;

        ({ entry: processInstance } = await runtimeBundleServiceHrUser.processInstance.startProcess(simpleProcess.processDefinitionKey, {
            name: processInstanceName,
        }));

        await tasksPage.navigate({ waitUntil: 'networkidle' });
        await tasksPage.dataTable.waitForRootElement();

        await preferenceMock.mockProcessColumnPreferences();
        await tasksPage.contentSideNavbar.navigateTo(ProcessManagementLabels.RunningProcesses);
    });

    test.afterEach(async ({ runtimeBundleServiceHrUser }) => {
        await runtimeBundleServiceHrUser.processInstance.deleteProcessInstance(processInstance.id);
    });

    test('[C694089] Change size and order of the columns and retrieve it from preferences', async ({ processPage }) => {
        const resizeOptions = {
            pixels: 40,
            direction: 'right',
        };

        const initialColumnWidth = await processPage.dataTable.getColumnWidth('Process Name');
        const expectedColumnWidth = resizeOptions.pixels + initialColumnWidth;
        const expectedHeaderOrder = [
            'Process Name',
            'Process Definition Name',
            'Related Process',
            'Start Date',
            'Status',
            'Completed Date',
            'Started By',
            'App Version',
        ];

        await processPage.dataTable.reorderColumn('Start Date', 'Status');
        await processPage.dataTable.resizeColumn('Process Name', resizeOptions.pixels, resizeOptions.direction);

        let columnHeaderOrder = await processPage.dataTable.getColumnTitlesList();
        let columnWidth = await processPage.dataTable.getColumnWidth('Process Name');

        await processPage.dataTable.sortBy('Started By', 'Ascending');

        expect.soft(columnWidth).toEqual(expectedColumnWidth);
        expect.soft(columnHeaderOrder).toEqual(expectedHeaderOrder);

        await processPage.contentSideNavbar.navigateTo(ProcessManagementLabels.AllProcesses);
        columnHeaderOrder = await processPage.dataTable.getColumnTitlesList();
        columnWidth = await processPage.dataTable.getColumnWidth('Process Name');

        expect(columnWidth).toEqual(expectedColumnWidth);
        expect(columnHeaderOrder).toEqual(expectedHeaderOrder);
    });
});
