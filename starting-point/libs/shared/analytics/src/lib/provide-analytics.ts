/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { EnvironmentProviders, inject, provideAppInitializer } from '@angular/core';
import { PendoService } from './pendo.service';

export function provideAnalytics(): EnvironmentProviders[] {
    return [
        provideAppInitializer(() => {
            const service = inject(PendoService);
            return service.init();
        }),
    ];
}
