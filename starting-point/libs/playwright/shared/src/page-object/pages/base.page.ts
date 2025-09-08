/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { getUserState, timeouts, UtilFile, UserType, GlobalSetupUtils } from '../../';
import { Page } from '@playwright/test';
import { PlaywrightBase } from '../playwright-base';
import { DataTableComponent, FilterType, HxpFiltersContainerComponent, IFilterOptions, SnackBarComponent, SpinnerComponent } from '..';
import { logger } from '../../utils/node-logger';

export interface NavigateOptions {
    query?: string;
    waitForRequest?: boolean;
    waitUntil?: 'networkidle' | 'commit' | 'load' | 'domcontentloaded';
    remoteRoutePath?: string;
}
export abstract class BasePage extends PlaywrightBase {
    protected pageUrl: string;
    protected urlRequest: RegExp | string;
    snackBar: SnackBarComponent;
    spinner: SpinnerComponent;
    filters = new HxpFiltersContainerComponent(this.page);
    dataTable = new DataTableComponent(this.page);

    constructor(page: Page, pageUrl: string, urlRequest?: RegExp | string) {
        super(page);
        this.pageUrl = pageUrl;
        this.urlRequest = urlRequest;
        this.snackBar = new SnackBarComponent(this.page);
        this.spinner = new SpinnerComponent(this.page);
    }

    /**
     * Method which navigate to appropriate page or remoteRoutePath
     * @param options object with configurable options
     * @property {string} query if you would like to navigate to page which support query,
     * then pass it in this option - e.g. '?appName=simpleapp'
     * @property {boolean} waitForRequest if you would like to NOT wait for request (which need to be passed
     * in the constructor of the page), then pass false. By default it'll wait for request to be fulfilled.
     * @property {'networkidle' | 'commit' | 'load' | 'domcontentloaded'} waitUntil by default will wait until 'networkidle' but you can change it if needed
     * @property {string} remoteRoutePath if you need to navigate to third part site, then you need to pass all of the URL in this option
     */
    async navigate(options?: Partial<NavigateOptions>): Promise<void> {
        const actualOptions: NavigateOptions = {
            query: '',
            waitForRequest: true,
            remoteRoutePath: '',
            ...options,
        };

        if (actualOptions.remoteRoutePath) {
            await this.page.goto(actualOptions.remoteRoutePath, {
                waitUntil: actualOptions.waitUntil,
            });
        } else {
            await (this.urlRequest && actualOptions.waitForRequest
                ? Promise.all([
                      this.page.goto(`./#/${this.pageUrl}${actualOptions.query}`, { waitUntil: 'load' }),
                      this.page.waitForResponse(this.urlRequest),
                  ])
                : this.page.goto(`./#/${this.pageUrl}${actualOptions.query}`, {
                      waitUntil: actualOptions.waitUntil,
                      timeout: timeouts.large,
                  }));
        }
        await this.spinner.waitForReload();
    }

    async refreshUserState(user: UserType, projectConfig: any): Promise<void> {
        const oldStorage = await UtilFile.readJsonFile(`${getUserState(user)}`);

        if (GlobalSetupUtils.isStorageExpirationDateLessThan(oldStorage, projectConfig.timeInSecondsToRefreshStorageStateBeforeTokenExpires)) {
            logger.info(`[BasePage] - Token will expire shortly. Going to refresh it for a user ${user}.`);

            await GlobalSetupUtils.saveStorageStateWithBrowser(user, projectConfig);
        }
    }

    async reload(options?: Pick<NavigateOptions, 'waitUntil'>): Promise<void> {
        const actualOptions: Pick<NavigateOptions, 'waitUntil'> = {
            waitUntil: 'domcontentloaded',
            ...options,
        };
        await this.page.reload(actualOptions);
    }

    async closeOverlays(): Promise<void> {
        await this.page.keyboard.press('Escape');
    }

    async getClipboardData(): Promise<string> {
        return this.page.evaluate('navigator.clipboard.readText()');
    }

    async applyFilter(searchValuetype: FilterType, filterOptions: IFilterOptions) {
        await this.filters.performSearch(searchValuetype, filterOptions);
        await this.dataTable.spinnerWaitForReload();
    }
}
