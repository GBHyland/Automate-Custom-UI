/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { StorageService, AppConfigService, JWT_STORAGE_SERVICE } from '@alfresco/adf-core';
import { inject, Injectable } from '@angular/core';
import { combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

export const provideCustomAuthStoragePrefix = () => [
    {
        provide: JWT_STORAGE_SERVICE,
        useExisting: CustomAuthStoragePrefixService,
    },
];

@Injectable({
    providedIn: 'root',
})
export class CustomAuthStoragePrefixService extends StorageService {
    appConfigService = inject(AppConfigService);

    constructor() {
        super();
        const customAuthStoragePrefix$ = combineLatest([
            this.appConfigService.select('alfresco-deployed-apps'),
            this.appConfigService.select('uiType'),
        ]).pipe(
            map(([deployedApps, uiType]) => {
                const appName = deployedApps[0]?.name;
                return `${appName}_${uiType}`;
            })
        );
        customAuthStoragePrefix$.subscribe((prefix) => {
            this.prefix = prefix;
        });
    }
}
