/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AccountApp } from './account-app.interface';
import { SubscribedApp } from './subscribed-app.interface';

export interface GlobalApps {
    data: {
        currentUser: {
            id: string;
            accountApps: AccountApp[];
            subscribedApps: SubscribedApp[];
            platformHomeUrl: string;
        };
    };
}
