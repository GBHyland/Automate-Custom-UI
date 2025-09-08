/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { AppNames } from '../../config/config-helpers';
import { getRequestUrlFromAppName } from '../../utils/request-url';
import { LoginOptions, UserModel } from '../../api-playwright/services/modeling-service/models';

export class AlfrescoIdentityServiceLoginPage extends BasePage {
    constructor(page: Page) {
        super(page, '');
    }

    public titleApp = 'Alfresco Identity Service';
    public titleLocator = this.page.locator('.application-name');
    private username = this.page.locator('#username');
    private password = this.page.locator('#password');
    private submitButton = this.page.locator('.submit');

    async loginUser(userData: { username: string; password: string } | UserModel, appName: AppNames, options?: LoginOptions): Promise<void> {
        if (options?.withNavigation) {
            await this.navigate();
        }
        await this.username.fill(userData.username);
        await this.password.fill(userData.password);
        await this.submitButton.click();

        if (options?.waitForLoading) {
            await Promise.all([this.page.waitForRequest(getRequestUrlFromAppName(appName), { timeout: 30_000 }), this.spinner.waitForReload()]);
        }
    }
}
