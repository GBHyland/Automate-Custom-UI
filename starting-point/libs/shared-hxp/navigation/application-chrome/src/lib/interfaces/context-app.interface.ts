/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppEnv } from './app-env.interface';

export interface ContextApp {
    id: string;
    name: string;
    launchUrl: string;
    appKey?: string;
    environment?: AppEnv;
}
