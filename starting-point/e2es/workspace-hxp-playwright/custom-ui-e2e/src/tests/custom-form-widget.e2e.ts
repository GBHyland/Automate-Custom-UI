/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { expect, getUserState, HXP_APPS, timeouts } from '@alfresco-dbp/playwright/shared';
import { ProcessManagementLabels, test } from '@hxp/playwright/workspace-hxp';

test.describe('Custom Form Widget', async () => {
    test.use({ storageState: getUserState('repoadmin') });

    const { customWidgetGenerator } = HXP_APPS.SYS_WORKSPACE.processes;

    // eslint-disable-next-line @cspell/spellchecker
    const customWidgetTextContent = 'custom-ui-custom-widget-u3eky-4txeo';

    test(`[XAT-17981] Should have custom form widget created by "@hyland:extend - plugin" generator`, async ({
        processPage,
        taskDetailsPage,
        startProcessPage,
        contentBrowserPage,
        tasksPage,
    }) => {
        test.setTimeout(timeouts.extendedTest);

        await contentBrowserPage.navigate();
        await contentBrowserPage.contentSideNavbar.navigateTo(ProcessManagementLabels.MyTasks);
        await processPage.pageLayoutHeaderComponent.startProcessButton.click();
        await processPage.startProcessDialog.selectProcess(customWidgetGenerator.processName);
        await startProcessPage.startProcessFooter.startProcessButton.click();
        await tasksPage.dataTable.waitForRootElement();

        await tasksPage.applyFilter('string', { filterName: 'Task Name', value: 'custom-widget-generator' });

        await taskDetailsPage.dataTable.getRowByAriaLabel(customWidgetGenerator.userTask.name).first().click();
        await taskDetailsPage.page.waitForTimeout(timeouts.medium);

        const pageContent = await taskDetailsPage.getPageContentByPageNameLocator(customWidgetTextContent).allTextContents();

        expect(pageContent).toContain(`${customWidgetTextContent} Works!`);
    });
});
