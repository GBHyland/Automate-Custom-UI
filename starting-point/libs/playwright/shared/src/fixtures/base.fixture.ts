/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { test as base } from '@playwright/test';
import { getUsers, FeatureFlags, type Users, FeatureFlagsNames } from '../config';
import { AlfrescoIdentityServiceLoginPage, HxpLoginPage } from '../page-object';
import { subscribeToLogErrors } from '../utils';
import { CustomConfig } from '../model';

export type TestPurpose = 'old-functionality' | 'new-functionality';
export interface TestOptions {
    usersData: Users;
    skipOrExecuteTestBasedOnFlagStatus: (
        testObject,
        featureFlagName: FeatureFlagsNames[] | FeatureFlagsNames,
        testPurpose: TestPurpose,
        options?: { allFlagsMustBeOn: boolean }
    ) => Promise<void>;
}

export interface PageInitialization {
    alfrescoIdentityServiceLoginPage: AlfrescoIdentityServiceLoginPage;
    hxpIdpLoginPage: HxpLoginPage;
}

export const test = base.extend<TestOptions & PageInitialization & CustomConfig>({
    usersData: getUsers(),
    /* eslint-disable no-empty-pattern */
    skipOrExecuteTestBasedOnFlagStatus: async ({}, use) => {
        await use(FeatureFlags.skipOrExecuteTestBasedOnFlagStatus);
    },
    alfrescoIdentityServiceLoginPage: async ({ page }, use) => {
        await use(new AlfrescoIdentityServiceLoginPage(page));
    },
    hxpIdpLoginPage: async ({ page }, use) => {
        await use(new HxpLoginPage(page));
    },
    page: async ({ page }, use) => {
        subscribeToLogErrors(page);
        await use(page);
    },
});

export { expect } from '@playwright/test';
