/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { timeouts } from '../utils';

const { env } = process;
const environmentVariables = [
    'BRANCH_NAME',
    'GITHUB_EVENT_NAME',
    'GITHUB_REPOSITORY',
    'GITHUB_RUN_ATTEMPT',
    'GITHUB_RUN_ID',
    'GITHUB_SERVER_URL',
    'JOB_NAME',
    'REPORT_PORTAL_ENVIRONMENT',
    'REPORT_PORTAL_TRIGGER',
    'REPORT_PORTAL_URL',
];

export const getReportPortalConfig = (appName: string, isHxp: boolean) => {
    for (const envVar of environmentVariables) {
        if (!env[envVar]) {
            console.warn(`Missing environment variable: ${envVar}`);
            env[envVar] = `No value`;
        }
    }

    let title = `Run on GitHub Actions ${env.GITHUB_RUN_ID}`;

    const runAttempt = `${env.GITHUB_RUN_ATTEMPT}`;
    if (runAttempt !== '1') {
        title += ` (attempt #${env.GITHUB_RUN_ATTEMPT})`;
    }

    const url = `${env.GITHUB_SERVER_URL}/${env.GITHUB_REPOSITORY}/actions/runs/${env.GITHUB_RUN_ID}/attempts/${runAttempt}`;
    const productFlavour = isHxp ? `hxp` : `apa`;

    const attributes = [
        {
            key: 'Job',
            value: `${env.JOB_NAME}`,
        },
        {
            key: 'ghrun',
            value: env.GITHUB_RUN_ID,
        },
        {
            key: 'event',
            value: env.GITHUB_EVENT_NAME,
        },
        {
            key: 'repository',
            value: env.GITHUB_REPOSITORY,
        },
        {
            key: 'metafilter',
            value: `+playwright`,
        },
        {
            key: 'branch',
            value: env.BRANCH_NAME,
        },
        {
            key: 'flavour',
            value: productFlavour,
        },
        {
            key: 'trigger',
            value: env.REPORT_PORTAL_TRIGGER,
        },
        {
            key: 'environment',
            value: env.REPORT_PORTAL_ENVIRONMENT,
        },
    ];

    return {
        apiKey: env.REPORT_PORTAL_TOKEN,
        endpoint: `${env.REPORT_PORTAL_URL}/api/v1`,
        project: 'alfresco-apps',
        launch: appName === undefined ? 'remote' : appName,
        // Do not turn on Include Test Steps as there is an issue with false positive CI run
        includeTestSteps: false,
        restClientConfig: {
            timeout: timeouts.globalTest,
        },
        attributes,
        description: `[${title}](${url})`,
    };
};
