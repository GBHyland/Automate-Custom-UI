/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { LoggerLike, GenericLogger } from '../utils/logger';

export abstract class PlaywrightBase {
    public page: Page;
    public logger: LoggerLike;

    constructor(page: Page) {
        this.page = page;
        this.logger = new GenericLogger(process.env.PLAYWRIGHT_CUSTOM_LOG_LEVEL);
    }
}
