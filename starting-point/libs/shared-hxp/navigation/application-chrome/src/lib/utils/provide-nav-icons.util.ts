/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Provider } from '@angular/core';
import { provideNavIcon } from '../providers/nav-icon.provider';
import { HOME_NAV_ICON } from '../configs/home.nav-icon.config';

export function provideNavIcons(): Provider[] {
    return [provideNavIcon(HOME_NAV_ICON)];
}
