/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

export interface GovernanceDiscoveryResponse {
    data: {
        currentUser: {
            id: string;
            subscribedApps: SubscribedApp[];
        };
    };
}

export interface SubscribedApp {
    id?: string;
    environmentId?: string;
    environmentKey?: string;
    launchUrl?: string;
    provisioningStatus?: string;
    app?: AppInfo;
}

export interface AppInfo {
    key: string;
    id: string;
    localizedName: string;
}
