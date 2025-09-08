/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { getRequestUrlFromAppName } from '../../utils/request-url';
import { AppNames } from '../../config/config-helpers';
import { LoginOptions, UserModel } from '../../api-playwright/services/modeling-service/models';

export class HxpLoginPage extends BasePage {
    private static urlRequest = '/openid-configuration';

    constructor(page: Page) {
        super(page, '', HxpLoginPage.urlRequest);
    }

    title = this.page.locator('title');
    email = this.page.locator('#Email');
    continueButton = this.page.getByRole('button', { name: 'Continue' });
    password = this.page.locator('#Password');
    logoutLabel = this.page.locator('[data-testid="logout-message"]');
    errorMessage = this.page.locator('.alert-danger');
    errorMessageText = 'Error occurred. Please contact your system administrator or first line of support.';

    async loginUser(userData: { username: string; password: string } | UserModel, appName: AppNames, options?: LoginOptions): Promise<void> {
        if (options?.withNavigation) {
            await this.navigate({ waitUntil: 'networkidle' });
        }
        await this.email.fill(userData.username);
        await this.continueButton.click();
        await this.password.fill(userData.password);
        await this.continueButton.click();
        if (options?.waitForLoading) {
            try {
                await Promise.all([this.page.waitForRequest(getRequestUrlFromAppName(appName), { timeout: 30_000 }), this.spinner.waitForReload()]);
            } catch (error) {
                this.logger.error(`Login failed.\nCurrent page url: ${this.page.url()}\nCurrent page title: ${await this.title.textContent()}`);
                throw new Error(error);
            }
        }
    }
}
