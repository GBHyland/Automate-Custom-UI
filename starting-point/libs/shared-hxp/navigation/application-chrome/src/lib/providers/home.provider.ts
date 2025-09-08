/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Provider } from '@angular/core';
import { ContextName } from '../interfaces/context-name.interface';
import { HOME_TOKEN } from '../tokens/home.token';

export function provideHome(home: ContextName): Provider {
    return {
        provide: HOME_TOKEN,
        useValue: home,
    };
}
