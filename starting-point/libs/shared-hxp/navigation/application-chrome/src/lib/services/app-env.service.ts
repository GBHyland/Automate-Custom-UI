/*
 * Copyright © 2005 - 2021 Alfresco Software, Ltd. All rights reserved.
 *
 * License rights for this program may be obtained from Alfresco Software, Ltd.
 * pursuant to a written agreement and any use of this program without such an
 * agreement is prohibited.
 */

import { Injectable } from '@angular/core';
import { AppEnv } from '../interfaces/app-env.interface';
import { BehaviorSubject, Observable } from 'rxjs';
import { NavEnv } from '../interfaces/nav-env.interface';
import { mapAppEnv } from '../utils/map-app-env.util';

@Injectable({
    providedIn: 'root',
})
export class AppEnvService {
    private selectedEnvSubject: BehaviorSubject<AppEnv | undefined> = new BehaviorSubject<AppEnv | undefined>(undefined);
    selectedEnv$: Observable<AppEnv | undefined> = this.selectedEnvSubject.asObservable();

    public onEnvChange(env: NavEnv) {
        this.selectedEnvSubject.next(mapAppEnv(env.value, env.label));
    }
}
