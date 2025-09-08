/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { test as base } from './base.fixture';
import { ContextFactory, UserContexts } from '../api-playwright';

export const test = base.extend<UserContexts>({
    processAdminApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.processadmin));
    },
    devopsUserApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.devops));
    },
    analystUserApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.analystuser));
    },
    hrUserApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.hruser));
    },
    hrUserAcsApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.hruser, 'ECM'));
    },
    modelerUserApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.modeler));
    },
    modelerqaUserApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.modelerqa));
    },
    repoAdminApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.repoadmin));
    },
    superadminApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.superadmin));
    },
    superadminIdentityApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.superadmin, 'Identity'));
    },
    salesUserApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.salesuser));
    },
    salesUserAcsApiContext: async ({ usersData }, use) => {
        await use(await ContextFactory.getContextByUser(usersData.salesuser, 'ECM'));
    },
});

export { expect } from '@playwright/test';
