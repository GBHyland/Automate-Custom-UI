/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { StartProcessTaskFormComponent, StartProcessHeaderComponent, StartProcessFooterComponent } from '../components';
import { HomePage } from './home.page';

export class StartProcessPage extends HomePage {
    private static pageUrl = 'start-process-cloud';

    constructor(page: Page) {
        super(page, StartProcessPage.pageUrl);
    }

    taskForm = new StartProcessTaskFormComponent(this.page);
    startProcessHeader = new StartProcessHeaderComponent(this.page);
    startProcessFooter = new StartProcessFooterComponent(this.page);
}
