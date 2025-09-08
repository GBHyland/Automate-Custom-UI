/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { chromium, Page } from '@playwright/test';
import { LoginPageTypes } from '../model';
import { AlfrescoIdentityServiceLoginPage, HxpLoginPage } from '../page-object';
import * as fs from 'node:fs';
import { getUserState, paths, timeouts, UtilFile } from '../utils';
import { AppNames, getBaseUrl, getUsers, UserType } from '../config';
import { logger } from '../utils/node-logger';
import { differenceInSeconds } from 'date-fns';
import { ContextFactory, DeploymentService, ModelingService, RuntimeBundleService } from '..';

export type LoginPage = AlfrescoIdentityServiceLoginPage | HxpLoginPage;

/* eslint-disable no-case-declarations */
export class GlobalSetupUtils {
    static setLoginPageFromConfig(loginPage: LoginPageTypes, page: Page): LoginPage {
        return loginPage === 'HxpLoginPage' ? new HxpLoginPage(page) : new AlfrescoIdentityServiceLoginPage(page);
    }

    static async createOutputFolders() {
        for (const path in paths) {
            if (!fs.existsSync(paths[path])) {
                fs.mkdirSync(paths[path], { recursive: true });
            }
        }
    }

    static async removeOutputFolders() {
        if (fs.existsSync(paths.rootFolder)) {
            fs.rmdirSync(paths.rootFolder, { recursive: true });
        }
    }

    static async storeFeatureFlagsData(applicationName: AppNames, deployedAppName?: string) {
        const users = getUsers();
        let featureFlagsData: any;

        switch (applicationName) {
            case 'studio-hxp': {
                const modelerContext = await ContextFactory.getContextByUser(users.modeler);
                const modelingServiceModeler = new ModelingService(modelerContext);
                featureFlagsData = await modelingServiceModeler.featureFlags.getFeatureFlags();
                break;
            }
            case 'admin-hxp': {
                const devopsContext = await ContextFactory.getContextByUser(users.devops);
                const deploymentServiceDevops = new DeploymentService(devopsContext);
                featureFlagsData = await deploymentServiceDevops.featureFlags.getFeatureFlags();
                break;
            }
            case 'workspace-hxp':
            case 'workspace-hxp-idp':
            case 'hxviewer': {
                if (deployedAppName === undefined) {
                    logger.error(`[GlobalSetupUtils] - Missing hxpModelingProjectName parameter in project's playwright.config.ts file`);
                }
                const repoadminContext = await ContextFactory.getContextByUser(users.repoadmin);
                const runtimeBundleServiceRepoadmin = new RuntimeBundleService(repoadminContext, deployedAppName);
                featureFlagsData = await runtimeBundleServiceRepoadmin.featureFlags.getFeatureFlags();
                break;
            }
        }

        if (featureFlagsData) {
            try {
                fs.writeFileSync(`${paths.rootFolder}/feature-flags.json`, JSON.stringify(featureFlagsData, null, 2));
            } catch (error) {
                logger.error(`[GlobalSetupUtils] - Couldn't save feature flags list to file - error: ${error.message}`);
                fs.writeFileSync(`${paths.rootFolder}/feature-flags.json`, JSON.stringify({}, null, 2));
            }
            logger.info('[GlobalSetupUtils] - Feature flags data saved to file');
        }
    }

    private static extractUserToken(oldStorage: any): any {
        return oldStorage.origins[0].localStorage.find((key) => key.name.includes('id_token_expires_at'));
    }

    private static isTokenInUserState(oldStorage: any): boolean {
        return this.extractUserToken(oldStorage) !== undefined;
    }

    static isStorageExpirationDateLessThan(oldStorage: any, seconds: number): boolean {
        const initialLocalStorageKeysExpiresAt = this.extractUserToken(oldStorage);
        const existingStorageDate = new Date(Number(initialLocalStorageKeysExpiresAt.value));
        const currentDate = new Date();

        logger.info(`[GlobalSetupUtils] - 'id_token_expires_at' expires in - ${differenceInSeconds(existingStorageDate, currentDate)}`);

        return differenceInSeconds(existingStorageDate, currentDate) < seconds;
    }

    static async saveStorageStateWithBrowser(user: UserType, projectUse: any): Promise<void> {
        const users = getUsers();
        const browser = await chromium.launch({ channel: 'chrome' });
        const context = await browser.newContext({ storageState: { cookies: [], origins: [] } });
        const page = await context.newPage();

        await page.goto(getBaseUrl(projectUse), { waitUntil: 'load' });

        const loginPage = GlobalSetupUtils.setLoginPageFromConfig(projectUse.loginPage, page);

        try {
            await loginPage.loginUser({ username: users[user].username, password: users[user].password.split('\\').join('') }, projectUse.appName, {
                withNavigation: false,
                waitForLoading: true,
            });
        } catch (error) {
            logger.error(`[GlobalSetupUtils] - Error during login for user ${users[user].username}: ${error.message}`);
            logger.error(`Current page url:${loginPage.page.url()}`);
            logger.error(`Current page title:${await loginPage.page.title()}`);
            throw error;
        }

        await page.context().storageState({ path: `${paths.userStates}/${user}UserState.json` });

        let userStateData = await UtilFile.readJsonFile(`${getUserState(user)}`);
        logger.info(`[GlobalSetupUtils] - Saved storageStates - ${user} | with 'id_token_expires_at' - ${this.isTokenInUserState(userStateData)} `);

        if (!this.isTokenInUserState(userStateData)) {
            await page.waitForTimeout(timeouts.medium);
            await page.context().storageState({ path: `${paths.userStates}/${user}UserState.json` });
            userStateData = await UtilFile.readJsonFile(`${getUserState(user)}`);
            logger.info(
                `[GlobalSetupUtils] - Saved storageStates attempt 2 - ${user} | with 'id_token_expires_at' - ${this.isTokenInUserState(
                    userStateData
                )} `
            );
        }

        await browser.close();
    }
}
