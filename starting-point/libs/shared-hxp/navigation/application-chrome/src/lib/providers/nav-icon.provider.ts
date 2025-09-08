/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Provider } from '@angular/core';
import { NavIcon } from '../interfaces/nav-icon.interface';
import { NAV_ICONS_TOKEN } from '../tokens/nav-icons.token';

export function provideNavIcon(navIcon: NavIcon): Provider {
    return {
        provide: NAV_ICONS_TOKEN,
        useValue: navIcon,
        multi: true,
    };
}
