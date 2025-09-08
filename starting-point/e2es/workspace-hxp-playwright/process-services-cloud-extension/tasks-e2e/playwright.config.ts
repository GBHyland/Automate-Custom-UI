/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppNames, CustomConfig, getExcludedTestsRegExpArray, getGlobalConfig, HXP_APPS } from '@alfresco-dbp/playwright/shared';
import { Project, defineConfig } from '@playwright/test';
import EXCLUDED_JSON from './exclude.tests.json';

const projectConfiguration: Project<CustomConfig>[] = [
    {
        name: 'Automate - Task workspace tests',
        use: {
            loginPage: 'HxpLoginPage',
            users: ['hruser'],
            environmentCheck: {
                apps: true,
                envUp: true,
            },
            timeInSecondsToRefreshStorageStateBeforeTokenExpires: 40,
            remoteRoutePath: 'ui/default/',
            hxpModelingProjectName: HXP_APPS.SYS_WORKSPACE.appName,
        },
    },
];

export default defineConfig<CustomConfig>({
    ...getGlobalConfig(AppNames.WorkspaceHxP, projectConfiguration),
    grepInvert: getExcludedTestsRegExpArray(EXCLUDED_JSON, AppNames.WorkspaceHxP),
});
