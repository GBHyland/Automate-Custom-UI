/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { HXP_APPS, QueryService, RuntimeBundleService } from '@alfresco-dbp/playwright/shared';
import { test as base } from '@hxp/playwright/workspace-hxp';

interface Apis {
    runtimeBundleServiceSalesUser: RuntimeBundleService;
    queryServiceSalesUser: QueryService;
}
const { appName } = HXP_APPS.SYS_WORKSPACE;

export const test = base.extend<Apis>({
    runtimeBundleServiceSalesUser: async ({ salesUserApiContext }, use) => {
        await use(new RuntimeBundleService(salesUserApiContext, appName));
    },
    queryServiceSalesUser: async ({ salesUserApiContext }, use) => {
        await use(new QueryService({ context: salesUserApiContext, appName: appName }));
    },
});

export { expect } from '@playwright/test';
