/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppNames, CustomConfig, getExcludedTestsRegExpArray, getGlobalConfig } from '@alfresco-dbp/playwright/shared';
import { Project, defineConfig } from '@playwright/test';
import EXCLUDED_JSON from './exclude.tests.json';

const projectConfiguration: Project<CustomConfig>[] = [
    {
        name: 'IDP Services Extension - Field Verification E2E',
        use: {
            appName: AppNames.WorkspaceHxPIdp,
            loginPage: 'HxpLoginPage',
            users: ['hruser'],
            testIdAttribute: 'data-automation-id',
            environmentCheck: {
                apps: true,
                envUp: true,
            },
            permissions: ['clipboard-read'],
            remoteRoutePath: 'ui/workspace-br3id/',
            hxpModelingProjectName: 'sys-idp-e2e',
            timeInSecondsToRefreshStorageStateBeforeTokenExpires: 40,
        },
    },
];

export default defineConfig<CustomConfig>({
    ...getGlobalConfig(AppNames.WorkspaceHxPIdp, projectConfiguration),
    grepInvert: getExcludedTestsRegExpArray(EXCLUDED_JSON, AppNames.WorkspaceHxPIdp),
});
