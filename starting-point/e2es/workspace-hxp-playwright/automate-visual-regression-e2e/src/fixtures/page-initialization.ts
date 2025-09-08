/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { test as base } from '@hxp/playwright/workspace-hxp';
import { TasksListMock } from '../mocks/tasks-list.mock';
import { ProcessListMock } from '../mocks/process-list.mock';

interface Mocks {
    tasksListMock: TasksListMock;
    processListMock: ProcessListMock;
}

export const test = base.extend<Mocks>({
    tasksListMock: async ({ page }, use) => {
        await use(new TasksListMock(page));
    },
    processListMock: async ({ page }, use) => {
        await use(new ProcessListMock(page));
    },
});

export { expect } from '@playwright/test';
