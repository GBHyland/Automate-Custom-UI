/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { GlobalApps } from '../interfaces/global-apps.interface';
import { ContextApp } from '../interfaces/context-app.interface';
import { AccountApp } from '../interfaces/account-app.interface';
import { SubscribedApp } from '../interfaces/subscribed-app.interface';
import { map, Observable } from 'rxjs';
import { CONTROL_CENTER_TOKEN } from '../tokens/control-center.token';
import { HOME_TOKEN } from '../tokens/home.token';
import { mapContextApp } from '../utils/map-context-app.util';

@Pipe({
    name: 'contextApps',
    standalone: true,
})
export class ContextAppsPipe implements PipeTransform {
    private readonly controlCenter = inject(CONTROL_CENTER_TOKEN);
    private readonly home = inject(HOME_TOKEN);

    transform(globalApps: Observable<GlobalApps>): Observable<ContextApp[]> {
        return globalApps.pipe(
            map((apps: GlobalApps) => [
                ...(apps.data.currentUser.platformHomeUrl
                    ? [mapContextApp(this.home.id, this.home.name, apps.data.currentUser.platformHomeUrl)]
                    : []),
                ...apps.data.currentUser.accountApps.map((app: AccountApp) =>
                    mapContextApp(app.id, app.app.localizedName, app.launchUrl, app.appKey, this.controlCenter)
                ),
                ...apps.data.currentUser.subscribedApps.map((app: SubscribedApp) =>
                    mapContextApp(app.id, app.app.localizedName, app.launchUrl, app.appKey, app.environment)
                ),
            ])
        );
    }
}
