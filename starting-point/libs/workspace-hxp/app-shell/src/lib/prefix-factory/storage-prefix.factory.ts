/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { AppConfigService, StoragePrefixFactoryService } from '@alfresco/adf-core';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class StoragePrefixFactory implements StoragePrefixFactoryService {
    constructor(private appConfigService: AppConfigService) {}

    getPrefix(): Observable<string | undefined> {
        return this.appConfigService.select('alfresco-deployed-apps').pipe(
            map((deployedApps: Array<{ name: string }>) => {
                return deployedApps[0]?.name;
            })
        );
    }
}
