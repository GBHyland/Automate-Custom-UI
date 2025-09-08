/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { NavEnv } from '../interfaces/nav-env.interface';
import { AppEnv } from '../interfaces/app-env.interface';
import { TranslateService } from '@ngx-translate/core';
import { mapNavEnv } from '../utils/map-nav-env.util';

@Pipe({
    name: 'navEnvs',
    standalone: true,
})
export class NavEnvsPipe implements PipeTransform {
    private readonly translateService = inject(TranslateService);

    transform(envs: AppEnv[]): NavEnv[] {
        return envs.map((env: AppEnv) => mapNavEnv(env.id, this.translateService.instant(env.name)));
    }
}
