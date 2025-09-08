/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Provider } from '@angular/core';
import { AppEnv } from '../interfaces/app-env.interface';
import { CONTROL_CENTER_TOKEN } from '../tokens/control-center.token';

export function provideControlCenter(controlCenter: AppEnv): Provider {
    return {
        provide: CONTROL_CENTER_TOKEN,
        useValue: controlCenter,
    };
}
