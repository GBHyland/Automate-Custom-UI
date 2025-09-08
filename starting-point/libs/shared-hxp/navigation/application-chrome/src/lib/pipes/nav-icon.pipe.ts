/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { inject, Pipe, PipeTransform } from '@angular/core';
import { ContextApp } from '../interfaces/context-app.interface';
import { NAV_ICONS_TOKEN } from '../tokens/nav-icons.token';
import { NavIcon } from '../interfaces/nav-icon.interface';

@Pipe({
    name: 'navIcon',
    standalone: true,
})
export class NavIconPipe implements PipeTransform {
    private readonly navIcons = inject(NAV_ICONS_TOKEN);

    transform(app: ContextApp): string | undefined {
        return this.navIcons.find((icon: NavIcon) => icon.id === app.id)?.icon;
    }
}
