/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Pipe, PipeTransform } from '@angular/core';
import { ContextApp } from '../interfaces/context-app.interface';
import { AppEnv } from '../interfaces/app-env.interface';
import { getUniqueEnvs } from '../utils/get-unique-envs.util';

@Pipe({
    name: 'contextEnvs',
    standalone: true,
})
export class ContextEnvsPipe implements PipeTransform {
    transform(apps: ContextApp[]): AppEnv[] {
        return getUniqueEnvs(apps.filter((app: ContextApp) => !!app.environment).map((app: ContextApp) => app.environment || ({} as AppEnv)));
    }
}
