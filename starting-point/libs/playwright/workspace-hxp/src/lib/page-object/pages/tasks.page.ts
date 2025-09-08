/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { ProcessManagementPage } from './process-management.page';
import { DataTableComponent } from '@alfresco-dbp/playwright/shared';

export class TasksPage extends ProcessManagementPage {
    private static pageUrl = '/tasks';

    dataTable = new DataTableComponent(this.page);

    constructor(page: Page) {
        super(page, TasksPage.pageUrl);
    }
}
