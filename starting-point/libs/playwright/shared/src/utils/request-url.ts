/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppNames } from '../config/config-helpers';

export const getRequestUrlFromAppName = (appName: AppNames) => {
    let url: RegExp;
    switch (appName) {
        case AppNames.AdminApa: {
            url = /protocol\/openid-connect\/token/;
            break;
        }
        case AppNames.WorkspaceHxPIdp:
        case AppNames.WorkspaceHxP:
        case AppNames.HxViewer: {
            url = /idp\/connect\/token/;
            break;
        }
        case AppNames.ContentEeApa: {
            url = /public\/authentication\/versions/;
            break;
        }
        case AppNames.AdminHxp: {
            url = /apps\/account/;
            break;
        }
        case AppNames.StudioApa:
        case AppNames.HxPStudio: {
            url = /projects\?maxItems/;
            break;
        }
        default: {
            throw new Error(`There's no url defined with the app name ${appName}`);
        }
    }
    return url;
};
