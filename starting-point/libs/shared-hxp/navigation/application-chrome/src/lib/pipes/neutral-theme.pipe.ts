/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { AppEnv } from '../interfaces/app-env.interface';
import { CONTROL_CENTER_TOKEN } from '../tokens/control-center.token';

@Pipe({
    name: 'neutralTheme',
    standalone: true,
})
export class NeutralThemePipe implements PipeTransform {
    private readonly controlCenter = inject(CONTROL_CENTER_TOKEN);

    transform(env: AppEnv): boolean {
        return env.id === this.controlCenter.id;
    }
}
