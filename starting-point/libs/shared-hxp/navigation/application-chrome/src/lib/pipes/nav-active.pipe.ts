/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { ContextApp } from '../interfaces/context-app.interface';
import { AppKeyService } from '../services/app-key.service';

@Pipe({
    name: 'navActive',
    standalone: true,
})
export class NavActivePipe implements PipeTransform {
    private readonly appKeyService = inject(AppKeyService);

    transform(app: ContextApp): boolean {
        return this.appKeyService.currentKey === app.appKey;
    }
}
