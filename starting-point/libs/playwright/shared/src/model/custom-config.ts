/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppNames } from '../config/config-helpers';
import { type UserType } from '../config/global-variables';

export type LoginPageTypes = 'AlfrescoIdentityServiceLoginPage' | 'HxpLoginPage';
export interface CustomConfig {
    users: UserType[];
    testIdAttribute: string;
    permissions: Array<string>;
    loginPage: LoginPageTypes;
    environmentCheck: {
        apps: boolean;
        envUp: boolean;
    };
    appName: AppNames;
    /**
     * The name of the HXP modeling project.
     */
    hxpModelingProjectName: string;
    /**
     * The URL of the remote server. Only part which is after the host.
     */
    remoteRoutePath: string;
    timeInSecondsToRefreshStorageStateBeforeTokenExpires: number;
    screenshot: 'off' | 'on' | 'only-on-failure';
}
