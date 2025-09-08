/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ConsoleMessage, Page } from '@playwright/test';
import { logger } from './node-logger';

export function subscribeToLogErrors(page: Page) {
    let message: string;
    let body: string;
    page.on('response', async (response) => {
        if (!response.ok() && !/30\d/.test(response.status().toString())) {
            try {
                body = (await response.body()).toString();
            } catch {
                body = `Playwright was unable to read request's body - response.body() failed`;
            }
            message = `[DevTools Network Error] ${response.status()} ${response.url()}: \n ${body}`;
            logger.error(message);
        }
    });
    page.on('console', (msg: ConsoleMessage) => {
        if (msg.type() === 'error') {
            const location = msg.location();
            message = `[DevTools Console Message Error] ${msg.text()} at ${location.url}:${location.lineNumber}:${location.columnNumber}`;
            logger.error(message);
        }
    });
}
