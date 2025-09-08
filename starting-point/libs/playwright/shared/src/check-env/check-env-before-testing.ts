/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { ContextFactory, DeploymentService } from '../api-playwright';
import { getUsers } from '../config';
import { getApplicationNameWithEnv, getDeployedApp } from '../resources';
import { logger } from '../utils/node-logger';

export class CheckEnvBeforeTesting {
    private static checkerPrefix = '\n\n[ 🎭 Playwright Env-checker ]';
    private static formatError(message: string) {
        return `\n\n[ 🎭 Playwright Env-checker ] \u001B[31m${message}\u001B[0m`;
    }

    static async checkEnvironmentIsUp(): Promise<void> {
        try {
            const { superadmin } = getUsers();
            await ContextFactory.getContextByUser(superadmin);
        } catch {
            const errorMessage = `Check the env! Looks like it's down!`;
            throw new Error(this.formatError(errorMessage));
        }
    }

    static async checkAppsAreDeployed(projectConfig: any): Promise<void> {
        const { superadmin } = getUsers();
        const superadminApiContext = await ContextFactory.getContextByUser(superadmin);
        const deploymentServiceSuperadmin = new DeploymentService(superadminApiContext);
        const defaultApp = getDeployedApp(projectConfig);
        const defaultAppName = getApplicationNameWithEnv(defaultApp.appName);
        const deployedApp = await deploymentServiceSuperadmin.applications.getApplicationByName(defaultAppName);

        if (deployedApp.status === 404) {
            const errorMessage = `App "${defaultAppName}" is missing on env. Playwright stopped tests execution! Check the env!`;
            throw new Error(this.formatError(errorMessage));
        } else if (deployedApp.status === 'DeploymentFailed') {
            const errorMessage = `App "${defaultAppName}" is in Deployment Failed status. Playwright stopped tests execution! Check the env!`;
            throw new Error(this.formatError(errorMessage));
        } else if (deployedApp.status !== 'Deployed') {
            logger.warn(
                `${this.checkerPrefix} App ${defaultAppName} is present in the environment, but it's in status ${deployedApp.status}, it might affect test results`
            );
        }
    }
}
