/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

// eslint-disable-next-line @nx/enforce-module-boundaries
import { expect, getUserState } from '@alfresco-dbp/playwright/shared';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { test } from '@hxp/playwright/workspace-hxp';

test.describe('Custom UI tests', () => {
    test.use({ storageState: getUserState('repoadmin') });

    test.beforeEach(async ({ contentBrowserPage }, workerInfo) => {
        await contentBrowserPage.refreshUserState('repoadmin', workerInfo.project.use);
    });

    test(`[XAT-17726] Should have page created by "@hyland:extend - page" generator`, async ({ processPage, customUiPage }) => {
        await processPage.navigate();
        await processPage.contentSideNavbar.getButtonByExactText('custom-ui-page').click();
        const pageContent = await customUiPage.getPageContentByPageNameLocator('custom-ui-custom-ui-page').textContent();

        expect(pageContent).toContain('custom-ui-custom-ui-page Works! This is a plugin message');
    });
});
