/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

/* eslint-disable @typescript-eslint/no-unused-expressions */

import { FullConfig } from '@playwright/test';
import { CustomConfig } from '../model/custom-config';
import { getUsers } from '../config';
import { CheckEnvBeforeTesting } from '../check-env/check-env-before-testing';
import { logger } from '../utils/node-logger';
import { GlobalSetupUtils } from './global-setup-utils';

export async function globalSetup(config: FullConfig<CustomConfig>) {
    const { use } = config.projects[0];

    use.environmentCheck?.envUp === undefined || use.environmentCheck?.envUp
        ? await CheckEnvBeforeTesting.checkEnvironmentIsUp()
        : logger.info('Skipping environment check');

    use.environmentCheck?.apps ? await CheckEnvBeforeTesting.checkAppsAreDeployed(use) : logger.info('Skipping apps check');

    await GlobalSetupUtils.removeOutputFolders();
    await GlobalSetupUtils.createOutputFolders();
    await GlobalSetupUtils.storeFeatureFlagsData(use.appName, use.hxpModelingProjectName);

    if (use.users) {
        const users = getUsers();
        for (const user of use.users) {
            if (users[user].username) {
                await GlobalSetupUtils.saveStorageStateWithBrowser(user, use);
            } else {
                throw new Error(`Add credentials for ${user} to you .env file!`);
            }
        }
    }
}

export default globalSetup;
