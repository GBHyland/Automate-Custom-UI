/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Project, defineConfig } from '@playwright/test';
const dotenv = require('dotenv');
import { timeouts } from '../utils';
import { CustomConfig } from '../model';
import { AppNames, getBaseUrl, getReporter, reduceAppName, webServer } from './config-helpers';
import { resolve } from 'node:path';

export function getGlobalConfig(appName: AppNames, projects: Project<CustomConfig>[]) {
    dotenv.config({ path: resolve(process.cwd(), 'apps', reduceAppName(appName), '.env') });

    const { env } = process;
    const { use } = projects[0];
    const isLocalhost = /localhost/.exec(env.PLAYWRIGHT_E2E_HOST || '');
    const isHxp = env.APP_CONFIG_ECM_HOST?.includes('hxp');
    const baseURL = getBaseUrl(use);

    return defineConfig<CustomConfig>({
        timeout: timeouts.globalTest,
        globalTimeout: timeouts.globalSpec,
        testDir: './src/tests/',
        globalSetup: require.resolve('../global-setup/global.setup'),
        testMatch: /.*\.e2e\.ts/,
        reportSlowTests: null,

        expect: {
            timeout: timeouts.large,
            toHaveScreenshot: {
                maxDiffPixelRatio: 0.01,
            },
        },

        /* Fail the build on CI if you accidentally left test.only in the source code. */
        forbidOnly: !!process.env.CI,

        /* Retry on CI only */
        retries: process.env.PLAYWRIGHT_RETRY === undefined ? 2 : Number(process.env.PLAYWRIGHT_RETRY),

        /* Opt out of parallel tests on CI. */
        workers: process.env.PLAYWRIGHT_WORKERS ? Number.parseInt(process.env.PLAYWRIGHT_WORKERS, 10) : 1,

        /* Repeat tests to expose flakiness */
        repeatEach: process.env.PLAYWRIGHT_REPEAT_EACH ? Number.parseInt(process.env.PLAYWRIGHT_REPEAT_EACH, 10) : 1,

        /* Reporter to use. See https://playwright.dev/docs/test-reporters */
        // eslint-disable-next-line unicorn/prefer-module
        reporter: [[require.resolve('./jira-reporter.ts')], ['list'], ...getReporter(appName, isHxp)],

        quiet: false,
        projects,

        /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
        use: {
            appName,
            actionTimeout: 0,
            trace: 'retain-on-failure',
            video: 'retain-on-failure',
            screenshot: 'only-on-failure',
            headless: process.env.PLAYWRIGHT_HEADLESS ? process.env.PLAYWRIGHT_HEADLESS === 'true' : !!process.env.CI,
            ignoreHTTPSErrors: true,
            bypassCSP: true,
            browserName: 'chromium',
            channel: 'chrome',
            baseURL,
            viewport: {
                height: 1080,
                width: 1920,
            },
            launchOptions: {
                devtools: false,
                args: ['--disable-web-security', '--no-sandbox', '--disable-site-isolation-trials'],
            },
            timeInSecondsToRefreshStorageStateBeforeTokenExpires: 100,
        },

        webServer: isLocalhost && appName ? webServer(appName) : null,
    });
}
