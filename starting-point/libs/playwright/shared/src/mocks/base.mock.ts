/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page, Route } from '@playwright/test';
import { PlaywrightBase } from '../page-object/playwright-base';

export abstract class BaseMock extends PlaywrightBase {
    constructor(page: Page) {
        super(page);
    }

    async disableEndpoint(urlPattern: string | RegExp): Promise<void> {
        await this.page.route(urlPattern, async (route: Route) => {
            try {
                await route.abort();
            } catch (error) {
                console.error('Error in route handler:', error);
            }
        });
    }
}
