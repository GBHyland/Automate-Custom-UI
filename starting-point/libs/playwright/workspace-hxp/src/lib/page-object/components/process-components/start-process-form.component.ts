/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { TaskFormComponent } from './task-form.component';

export class StartProcessTaskFormComponent extends TaskFormComponent {
    private static rootElement = 'adf-cloud-start-process';

    constructor(page: Page, rootElement = StartProcessTaskFormComponent.rootElement) {
        super(page, rootElement);
    }
}
