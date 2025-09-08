/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class SidenavExpansionService {
    constructor(private appConfig: AppConfigService) {}

    public isSideNavExpanded(): boolean {
        return !this.appConfig.get('landingPage', '');
    }
}
